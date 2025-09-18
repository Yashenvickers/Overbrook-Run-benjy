from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timedelta
import uuid
from motor.motor_asyncio import AsyncIOMotorDatabase, AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
import logging

# Load environment and setup database connection
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

logger = logging.getLogger(__name__)

# Create game API router
game_router = APIRouter(prefix="/api/game", tags=["game"])

# Pydantic Models
class GameScore(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    player_name: str
    score: int
    time_survived: int  # in milliseconds
    enemies_defeated: int
    pickups_collected: int
    combo_max: int
    wave_reached: int
    powerups_used: List[str] = []
    difficulty: str = "normal"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    session_id: str

class GameScoreCreate(BaseModel):
    player_name: str
    score: int
    time_survived: int
    enemies_defeated: int = 0
    pickups_collected: int = 0
    combo_max: int = 0
    wave_reached: int = 1
    powerups_used: List[str] = []
    difficulty: str = "normal"
    session_id: str

class GameAnalytics(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    event_type: str  # game_start, run_end, share_click, cta_click
    session_id: str
    player_name: Optional[str] = None
    data: dict = {}
    created_at: datetime = Field(default_factory=datetime.utcnow)
    user_agent: Optional[str] = None
    ip_address: Optional[str] = None

class GameAnalyticsCreate(BaseModel):
    event_type: str
    session_id: str
    player_name: Optional[str] = None
    data: dict = {}

class LeaderboardEntry(BaseModel):
    rank: int
    player_name: str
    score: int
    time_survived: int
    created_at: datetime
    is_current_player: bool = False

class GameStats(BaseModel):
    total_games: int
    total_players: int
    average_score: float
    average_time: float
    top_score: int
    total_enemies_defeated: int
    total_pickups: int
    most_used_powerups: List[dict]

# Database collections
SCORES_COLLECTION = "game_scores"
ANALYTICS_COLLECTION = "game_analytics"

# API Routes
@game_router.post("/scores", response_model=GameScore)
async def submit_score(score_data: GameScoreCreate):
    """Submit a new game score"""
    try:
        score_dict = score_data.dict()
        score_obj = GameScore(**score_dict)
        
        result = await db[SCORES_COLLECTION].insert_one(score_obj.dict())
        
        if result.inserted_id:
            logger.info(f"Score submitted: {score_obj.score} by {score_obj.player_name}")
            return score_obj
        else:
            raise HTTPException(status_code=500, detail="Failed to save score")
            
    except Exception as e:
        logger.error(f"Error submitting score: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@game_router.get("/leaderboard", response_model=List[LeaderboardEntry])
async def get_leaderboard(
    limit: int = 10, 
    session_id: Optional[str] = None,
    timeframe: str = "all"  # all, daily, weekly, monthly
):
    """Get top scores leaderboard"""
    try:
        # Build query filter based on timeframe
        query_filter = {}
        if timeframe == "daily":
            query_filter["created_at"] = {"$gte": datetime.utcnow() - timedelta(days=1)}
        elif timeframe == "weekly":
            query_filter["created_at"] = {"$gte": datetime.utcnow() - timedelta(weeks=1)}
        elif timeframe == "monthly":
            query_filter["created_at"] = {"$gte": datetime.utcnow() - timedelta(days=30)}

        # Get top scores
        scores = await db[SCORES_COLLECTION].find(query_filter).sort("score", -1).limit(limit).to_list(length=limit)
        
        leaderboard = []
        for rank, score in enumerate(scores, 1):
            entry = LeaderboardEntry(
                rank=rank,
                player_name=score["player_name"],
                score=score["score"],
                time_survived=score["time_survived"],
                created_at=score["created_at"],
                is_current_player=(session_id and score["session_id"] == session_id)
            )
            leaderboard.append(entry)
        
        logger.info(f"Leaderboard requested: {timeframe}, {len(leaderboard)} entries")
        return leaderboard
        
    except Exception as e:
        logger.error(f"Error getting leaderboard: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@game_router.get("/stats", response_model=GameStats)
async def get_game_stats():
    """Get overall game statistics"""
    try:
        # Aggregate statistics
        pipeline = [
            {
                "$group": {
                    "_id": None,
                    "total_games": {"$sum": 1},
                    "unique_players": {"$addToSet": "$player_name"},
                    "average_score": {"$avg": "$score"},
                    "average_time": {"$avg": "$time_survived"},
                    "top_score": {"$max": "$score"},
                    "total_enemies": {"$sum": "$enemies_defeated"},
                    "total_pickups": {"$sum": "$pickups_collected"},
                    "all_powerups": {"$push": "$powerups_used"}
                }
            }
        ]
        
        result = await db[SCORES_COLLECTION].aggregate(pipeline).next()
        
        if not result:
            return GameStats(
                total_games=0,
                total_players=0,
                average_score=0.0,
                average_time=0.0,
                top_score=0,
                total_enemies_defeated=0,
                total_pickups=0,
                most_used_powerups=[]
            )
        
        # Count powerup usage
        powerup_counts = {}
        for powerup_list in result["all_powerups"]:
            for powerup in powerup_list:
                powerup_counts[powerup] = powerup_counts.get(powerup, 0) + 1
        
        most_used_powerups = [
            {"name": name, "count": count} 
            for name, count in sorted(powerup_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        ]
        
        stats = GameStats(
            total_games=result["total_games"],
            total_players=len(result["unique_players"]),
            average_score=round(result["average_score"], 2),
            average_time=round(result["average_time"], 2),
            top_score=result["top_score"],
            total_enemies_defeated=result["total_enemies"],
            total_pickups=result["total_pickups"],
            most_used_powerups=most_used_powerups
        )
        
        logger.info("Game stats requested")
        return stats
        
    except Exception as e:
        logger.error(f"Error getting game stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@game_router.post("/analytics")
async def track_analytics(analytics_data: GameAnalyticsCreate):
    """Track game analytics events"""
    try:
        analytics_dict = analytics_data.dict()
        analytics_obj = GameAnalytics(**analytics_dict)
        
        await db[ANALYTICS_COLLECTION].insert_one(analytics_obj.dict())
        
        logger.info(f"Analytics tracked: {analytics_obj.event_type} for session {analytics_obj.session_id}")
        return {"status": "success"}
        
    except Exception as e:
        logger.error(f"Error tracking analytics: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@game_router.get("/player/{session_id}/scores", response_model=List[GameScore])
async def get_player_scores(session_id: str, limit: int = 10):
    """Get scores for a specific player session"""
    try:
        scores = await db[SCORES_COLLECTION].find(
            {"session_id": session_id}
        ).sort("created_at", -1).limit(limit).to_list(length=limit)
        
        return [GameScore(**score) for score in scores]
        
    except Exception as e:
        logger.error(f"Error getting player scores: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@game_router.get("/player/{session_id}/rank")
async def get_player_rank(session_id: str):
    """Get current player's rank and best score"""
    try:
        # Get player's best score
        best_score_doc = await db[SCORES_COLLECTION].find_one(
            {"session_id": session_id},
            sort=[("score", -1)]
        )
        
        if not best_score_doc:
            return {"rank": None, "best_score": 0, "total_players": 0}
        
        best_score = best_score_doc["score"]
        
        # Count players with higher scores
        higher_scores = await db[SCORES_COLLECTION].count_documents(
            {"score": {"$gt": best_score}}
        )
        
        # Count total unique players
        total_players = len(await db[SCORES_COLLECTION].distinct("session_id"))
        
        rank = higher_scores + 1
        
        return {
            "rank": rank,
            "best_score": best_score,
            "total_players": total_players,
            "percentile": round((1 - (rank - 1) / total_players) * 100, 1) if total_players > 0 else 0
        }
        
    except Exception as e:
        logger.error(f"Error getting player rank: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@game_router.delete("/scores/{score_id}")
async def delete_score(score_id: str):
    """Delete a specific score (admin only)"""
    try:
        result = await db[SCORES_COLLECTION].delete_one({"id": score_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Score not found")
        
        logger.info(f"Score deleted: {score_id}")
        return {"status": "deleted"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting score: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Health check for game API
@game_router.get("/health")
async def game_health_check():
    """Health check for game API"""
    try:
        # Test database connection
        await db[SCORES_COLLECTION].count_documents({}, limit=1)
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow(),
            "service": "game_api"
        }
    except Exception as e:
        logger.error(f"Game API health check failed: {str(e)}")
        raise HTTPException(status_code=503, detail="Service unavailable")