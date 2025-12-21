import client from "./client";

export interface TrainingLogCreate {
    performed_at: string; // ISO 8601
    exercise_name: string;
    count?: number;
    duration?: number;
}

export interface TrainingLogResponse {
    id: number;
    user_id: number;
    performed_at: string;
    exercise_name: string;
    count?: number;
    duration?: number;
    created_at: string;
    unlocked_yucchin_types: number[];
}

export interface ExerciseStats {
    exercise_name: string;
    total_count: number;
    total_duration: number;
}

export interface TrainingStatsResponse {
    streak_days: number;
    today_stats: ExerciseStats[];
    total_stats: ExerciseStats[];
}

export const trainingApi = {
    createLog: async (log: TrainingLogCreate): Promise<TrainingLogResponse> => {
        const response = await client.post<TrainingLogResponse>("/training-logs", log);
        return response.data;
    },

    getLogs: async (): Promise<TrainingLogResponse[]> => {
        const response = await client.get<TrainingLogResponse[]>("/training-logs");
        return response.data;
    },

    getStats: async (): Promise<TrainingStatsResponse> => {
        const response = await client.get<TrainingStatsResponse>("/training-logs/stats");
        return response.data;
    }
};
