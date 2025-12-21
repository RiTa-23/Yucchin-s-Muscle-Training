from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy import func, desc, cast, Date
from datetime import datetime, date, timedelta
from typing import List, Dict
from app.models.training import TrainingLog
from app.models.yucchin import UserYucchin
from app.schemas.training import TrainingLogCreate, ExerciseStats, TrainingStatsResponse
import random

async def get_training_logs(db: AsyncSession, user_id: int):
    # Order by performed_at descending to show newest first
    result = await db.execute(select(TrainingLog).where(TrainingLog.user_id == user_id).order_by(TrainingLog.performed_at.desc()))
    return result.scalars().all()

async def create_training_log(db: AsyncSession, log: TrainingLogCreate, user_id: int):
    # 獲得判定のための以前の統計を取得
    stats_before = await get_training_stats(db, user_id)
    
    def get_totals(stats):
        total_units = sum(s.total_count + s.total_duration for s in stats.total_stats)
        exercise_map = {s.exercise_name: (s.total_count, s.total_duration) for s in stats.total_stats}
        return total_units, exercise_map

    old_total, old_exercises = get_totals(stats_before)

    db_log = TrainingLog(
        user_id=user_id,
        performed_at=log.performed_at,
        exercise_name=log.exercise_name,
        count=log.count,
        duration=log.duration
    )
    db.add(db_log)
    await db.commit()
    await db.refresh(db_log)

    # 保存後の統計を取得
    stats_after = await get_training_stats(db, user_id)
    new_total, new_exercises = get_totals(stats_after)

    unlocked_id = await check_and_unlock_yucchin(db, user_id, old_total, new_total, old_exercises, new_exercises)
    
    # スキーマに合わせて返却するために属性を追加
    setattr(db_log, 'unlocked_yucchin_type', unlocked_id)
    return db_log

YUCCHIN_NAMES = {
    1: "ねこゆっちん", 2: "かぶとゆっちん", 3: "ティールゆっちんブーケ", 4: "ブルーゆっちんブーケ", 5: "ブルーゆっちん",
    6: "青鬼ゆっちん", 7: "パープルゆっちん", 8: "紫鬼ゆっちん", 9: "デビルマンゆっちん", 10: "花火ゆっちん",
    101: "しかゆっちん", 102: "トリケラトユチン", 103: "カラフルゆっちんブーケ", 104: "ウマゆっちん", 105: "愛の伝道師ゆっちん",
    201: "リスカゆっちん", 202: "たまごゆっちん", 203: "しかゆっちん【神鹿】", 
    301: "エンジェルゆっちん", 401: "レントゲンゆっちん"
}

async def check_and_unlock_yucchin(db: AsyncSession, user_id: int, old_total: int, new_total: int, old_exercises: dict, new_exercises: dict):
    # すでに持っているゆっちんを取得
    owned_result = await db.execute(select(UserYucchin.yucchin_type).where(UserYucchin.user_id == user_id))
    owned_ids = set(owned_result.scalars().all())

    unlocked_id = None
    
    # 判定プライオリティ: Secret > UR > SR > Rare > Normal
    
    # Secret: 累計 3000 に到達
    if old_total < 3000 <= new_total:
        unlocked_id = 401
    # UR: 累計 1000 に到達
    elif old_total < 1000 <= new_total:
        unlocked_id = 301
    # SR: 腕立て 300
    elif old_exercises.get("pushup", (0,0))[0] < 300 <= new_exercises.get("pushup", (0,0))[0]:
        unlocked_id = 202
    # SR: スクワット 300
    elif old_exercises.get("squat", (0,0))[0] < 300 <= new_exercises.get("squat", (0,0))[0]:
        unlocked_id = 201
    # SR: プランク 300
    elif old_exercises.get("plank", (0,0))[1] < 300 <= new_exercises.get("plank", (0,0))[1]:
        unlocked_id = 203
    # Rare: 100 ごとに一回
    elif (new_total // 100) > (old_total // 100):
        # 101-105 のうち、未所持のものからランダム
        available = [i for i in range(101, 106) if i not in owned_ids]
        if available:
            unlocked_id = random.choice(available)
    # Normal: 30 ごとに一回
    elif (new_total // 30) > (old_total // 30):
        # 1-10 のうち、未所持のものからランダム
        available = [i for i in range(1, 11) if i not in owned_ids]
        if available:
            unlocked_id = random.choice(available)

    # 固定獲得（SR/UR/Secret）の場合、すでに持っていたら獲得なしにする
    if unlocked_id in owned_ids:
        unlocked_id = None

    if unlocked_id:
        # DB に登録
        new_yucchin = UserYucchin(
            user_id=user_id,
            yucchin_type=unlocked_id,
            yucchin_name=YUCCHIN_NAMES.get(unlocked_id, "謎のゆっちん")
        )
        db.add(new_yucchin)
        await db.commit()
        
    return unlocked_id

async def get_training_stats(db: AsyncSession, user_id: int) -> TrainingStatsResponse:
    # 1. Total Stats
    total_query = select(
        TrainingLog.exercise_name,
        func.sum(TrainingLog.count).label("total_count"),
        func.sum(TrainingLog.duration).label("total_duration")
    ).where(TrainingLog.user_id == user_id).group_by(TrainingLog.exercise_name)
    
    total_result = await db.execute(total_query)
    total_stats = []
    for row in total_result:
        total_stats.append(ExerciseStats(
            exercise_name=row.exercise_name,
            total_count=row.total_count or 0,
            total_duration=row.total_duration or 0
        ))

    # 2. Today's Stats
    today = datetime.now().date()
    # Note: performed_at is DateTime, so we need to filter safely.
    # Depending on DB, func.date() might vary. casting to Date is usually safe.
    today_query = select(
        TrainingLog.exercise_name,
        func.sum(TrainingLog.count).label("total_count"),
        func.sum(TrainingLog.duration).label("total_duration")
    ).where(
        TrainingLog.user_id == user_id,
        cast(TrainingLog.performed_at, Date) == today
    ).group_by(TrainingLog.exercise_name)

    today_result = await db.execute(today_query)
    today_stats = []
    for row in today_result:
        today_stats.append(ExerciseStats(
            exercise_name=row.exercise_name,
            total_count=row.total_count or 0,
            total_duration=row.total_duration or 0
        ))

    # 3. Streak Calculation
    # Get all distinct dates performed by user, ordered desc
    dates_query = select(cast(TrainingLog.performed_at, Date)).where(
        TrainingLog.user_id == user_id
    ).distinct().order_by(desc(cast(TrainingLog.performed_at, Date)))
    
    dates_result = await db.execute(dates_query)
    performed_dates = dates_result.scalars().all()

    streak_days = 0
    if performed_dates:
        # Check if performed today or yesterday to keep streak alive
        last_date = performed_dates[0]
        if last_date == today or last_date == today - timedelta(days=1):
            # Reset check to the most recent performed date to start counting backwards
            current_checking_date = last_date
            streak_days = 1 # We know at least one day (last_date) exists
            
            for i in range(1, len(performed_dates)):
                prev_date = performed_dates[i]
                if prev_date == current_checking_date - timedelta(days=1):
                    streak_days += 1
                    current_checking_date = prev_date
                else:
                    break
        else:
             streak_days = 0

    return TrainingStatsResponse(
        streak_days=streak_days,
        today_stats=today_stats,
        total_stats=total_stats
    )
