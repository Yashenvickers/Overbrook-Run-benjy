#!/usr/bin/env python3
"""
Backend API Test Suite for 56ers Overbrook Run Game
Tests all game API endpoints for functionality and data persistence
"""

import requests
import json
import uuid
import time
from datetime import datetime
from typing import Dict, Any
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Get backend URL from environment
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'http://localhost:8001')
BASE_URL = f"{BACKEND_URL}/api"
GAME_API_URL = f"{BASE_URL}/game"

class GameAPITester:
    def __init__(self):
        self.session_id = str(uuid.uuid4())
        self.player_name = "TestPlayer_" + str(int(time.time()))
        self.test_results = {}
        
    def log_test(self, test_name: str, success: bool, details: str = ""):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        self.test_results[test_name] = {"success": success, "details": details}
        
    def test_health_check(self) -> bool:
        """Test the game API health check endpoint"""
        try:
            response = requests.get(f"{GAME_API_URL}/health", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "healthy" and data.get("service") == "game_api":
                    self.log_test("Game API Health Check", True, f"Service healthy, timestamp: {data.get('timestamp')}")
                    return True
                else:
                    self.log_test("Game API Health Check", False, f"Invalid health response: {data}")
                    return False
            else:
                self.log_test("Game API Health Check", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Game API Health Check", False, f"Exception: {str(e)}")
            return False
    
    def test_score_submission(self) -> bool:
        """Test score submission endpoint"""
        try:
            # Test data for score submission
            score_data = {
                "player_name": self.player_name,
                "score": 15750,
                "time_survived": 125000,  # 2 minutes 5 seconds
                "enemies_defeated": 45,
                "pickups_collected": 12,
                "combo_max": 8,
                "wave_reached": 5,
                "powerups_used": ["speed_boost", "shield", "double_damage"],
                "difficulty": "normal",
                "session_id": self.session_id
            }
            
            response = requests.post(f"{GAME_API_URL}/scores", 
                                   json=score_data, 
                                   timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                # Verify all fields are returned correctly
                required_fields = ["id", "player_name", "score", "time_survived", "created_at", "session_id"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if not missing_fields and data["score"] == score_data["score"]:
                    self.log_test("Score Submission", True, f"Score {data['score']} submitted for {data['player_name']}")
                    return True
                else:
                    self.log_test("Score Submission", False, f"Missing fields: {missing_fields} or score mismatch")
                    return False
            else:
                self.log_test("Score Submission", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Score Submission", False, f"Exception: {str(e)}")
            return False
    
    def test_leaderboard(self) -> bool:
        """Test leaderboard retrieval"""
        try:
            # Test default leaderboard
            response = requests.get(f"{GAME_API_URL}/leaderboard", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                if isinstance(data, list):
                    # Check if our submitted score appears in leaderboard
                    player_found = any(entry.get("player_name") == self.player_name for entry in data)
                    
                    # Test with session_id parameter to highlight current player
                    response_with_session = requests.get(
                        f"{GAME_API_URL}/leaderboard?session_id={self.session_id}&limit=20", 
                        timeout=10
                    )
                    
                    if response_with_session.status_code == 200:
                        session_data = response_with_session.json()
                        current_player_highlighted = any(
                            entry.get("is_current_player", False) for entry in session_data
                        )
                        
                        success_msg = f"Leaderboard retrieved with {len(data)} entries"
                        if player_found:
                            success_msg += f", player {self.player_name} found"
                        if current_player_highlighted:
                            success_msg += ", current player highlighted"
                            
                        self.log_test("Leaderboard Retrieval", True, success_msg)
                        return True
                    else:
                        self.log_test("Leaderboard Retrieval", False, f"Session-based leaderboard failed: HTTP {response_with_session.status_code}")
                        return False
                else:
                    self.log_test("Leaderboard Retrieval", False, f"Invalid response format: {type(data)}")
                    return False
            else:
                self.log_test("Leaderboard Retrieval", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Leaderboard Retrieval", False, f"Exception: {str(e)}")
            return False
    
    def test_game_stats(self) -> bool:
        """Test game statistics endpoint"""
        try:
            response = requests.get(f"{GAME_API_URL}/stats", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                # Check required fields
                required_fields = [
                    "total_games", "total_players", "average_score", "average_time",
                    "top_score", "total_enemies_defeated", "total_pickups", "most_used_powerups"
                ]
                
                missing_fields = [field for field in required_fields if field not in data]
                
                if not missing_fields:
                    # Verify data types and reasonable values
                    if (isinstance(data["total_games"], int) and data["total_games"] >= 0 and
                        isinstance(data["total_players"], int) and data["total_players"] >= 0 and
                        isinstance(data["average_score"], (int, float)) and
                        isinstance(data["most_used_powerups"], list)):
                        
                        self.log_test("Game Statistics", True, 
                                    f"Stats: {data['total_games']} games, {data['total_players']} players, top score: {data['top_score']}")
                        return True
                    else:
                        self.log_test("Game Statistics", False, "Invalid data types in response")
                        return False
                else:
                    self.log_test("Game Statistics", False, f"Missing fields: {missing_fields}")
                    return False
            else:
                self.log_test("Game Statistics", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Game Statistics", False, f"Exception: {str(e)}")
            return False
    
    def test_analytics(self) -> bool:
        """Test analytics event tracking"""
        try:
            # Test different types of analytics events
            events = [
                {
                    "event_type": "game_start",
                    "session_id": self.session_id,
                    "player_name": self.player_name,
                    "data": {"difficulty": "normal", "timestamp": datetime.utcnow().isoformat()}
                },
                {
                    "event_type": "run_end",
                    "session_id": self.session_id,
                    "player_name": self.player_name,
                    "data": {"final_score": 15750, "cause": "enemy_collision"}
                },
                {
                    "event_type": "share_click",
                    "session_id": self.session_id,
                    "data": {"platform": "twitter"}
                }
            ]
            
            success_count = 0
            for event in events:
                response = requests.post(f"{GAME_API_URL}/analytics", 
                                       json=event, 
                                       timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("status") == "success":
                        success_count += 1
            
            if success_count == len(events):
                self.log_test("Analytics Tracking", True, f"All {len(events)} analytics events tracked successfully")
                return True
            else:
                self.log_test("Analytics Tracking", False, f"Only {success_count}/{len(events)} events tracked successfully")
                return False
                
        except Exception as e:
            self.log_test("Analytics Tracking", False, f"Exception: {str(e)}")
            return False
    
    def test_player_rank(self) -> bool:
        """Test player ranking endpoint"""
        try:
            response = requests.get(f"{GAME_API_URL}/player/{self.session_id}/rank", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                # Check required fields
                required_fields = ["rank", "best_score", "total_players"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if not missing_fields:
                    # Verify data makes sense
                    if (data["best_score"] > 0 and 
                        data["total_players"] >= 0 and
                        (data["rank"] is None or isinstance(data["rank"], int))):
                        
                        rank_info = f"Rank: {data['rank']}, Best Score: {data['best_score']}, Total Players: {data['total_players']}"
                        if "percentile" in data:
                            rank_info += f", Percentile: {data['percentile']}%"
                            
                        self.log_test("Player Ranking", True, rank_info)
                        return True
                    else:
                        self.log_test("Player Ranking", False, f"Invalid ranking data: {data}")
                        return False
                else:
                    self.log_test("Player Ranking", False, f"Missing fields: {missing_fields}")
                    return False
            else:
                self.log_test("Player Ranking", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Player Ranking", False, f"Exception: {str(e)}")
            return False
    
    def test_player_scores(self) -> bool:
        """Test player scores retrieval"""
        try:
            response = requests.get(f"{GAME_API_URL}/player/{self.session_id}/scores", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                if isinstance(data, list):
                    # Should contain at least our submitted score
                    if len(data) > 0:
                        # Verify the score structure
                        score = data[0]
                        required_fields = ["id", "player_name", "score", "session_id"]
                        missing_fields = [field for field in required_fields if field not in score]
                        
                        if not missing_fields and score["session_id"] == self.session_id:
                            self.log_test("Player Scores Retrieval", True, f"Retrieved {len(data)} scores for player")
                            return True
                        else:
                            self.log_test("Player Scores Retrieval", False, f"Invalid score structure or session mismatch")
                            return False
                    else:
                        self.log_test("Player Scores Retrieval", True, "No scores found for player (valid for new player)")
                        return True
                else:
                    self.log_test("Player Scores Retrieval", False, f"Invalid response format: {type(data)}")
                    return False
            else:
                self.log_test("Player Scores Retrieval", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Player Scores Retrieval", False, f"Exception: {str(e)}")
            return False
    
    def run_all_tests(self) -> Dict[str, Any]:
        """Run all backend API tests"""
        print(f"\n🎮 Starting Backend API Tests for 56ers Overbrook Run Game")
        print(f"Backend URL: {BACKEND_URL}")
        print(f"Test Session ID: {self.session_id}")
        print(f"Test Player: {self.player_name}")
        print("=" * 60)
        
        # Run tests in logical order
        tests = [
            ("Health Check", self.test_health_check),
            ("Score Submission", self.test_score_submission),
            ("Leaderboard", self.test_leaderboard),
            ("Game Statistics", self.test_game_stats),
            ("Analytics", self.test_analytics),
            ("Player Ranking", self.test_player_rank),
            ("Player Scores", self.test_player_scores),
        ]
        
        passed = 0
        total = len(tests)
        
        for test_name, test_func in tests:
            print(f"\n🧪 Running {test_name} Test...")
            if test_func():
                passed += 1
            time.sleep(0.5)  # Small delay between tests
        
        print("\n" + "=" * 60)
        print(f"📊 Test Results: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All tests passed! Backend API is working correctly.")
        else:
            print(f"⚠️  {total - passed} test(s) failed. Check the details above.")
        
        return {
            "total_tests": total,
            "passed_tests": passed,
            "success_rate": (passed / total) * 100,
            "test_results": self.test_results
        }

def main():
    """Main test execution"""
    tester = GameAPITester()
    results = tester.run_all_tests()
    
    # Return exit code based on results
    if results["passed_tests"] == results["total_tests"]:
        print("\n✅ All backend tests completed successfully!")
        return 0
    else:
        print(f"\n❌ {results['total_tests'] - results['passed_tests']} tests failed!")
        return 1

if __name__ == "__main__":
    exit(main())