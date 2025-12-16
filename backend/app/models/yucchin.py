from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class UserYucchin(Base):
    __tablename__ = "user_yucchins"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    yucchin_type = Column(Integer, nullable=False)
    yucchin_name = Column(String, nullable=False)
    obtained_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="yucchins")
