"""
High School Management System API

A super simple FastAPI application that allows students to view and sign up
for extracurricular activities at Mergington High School.
"""

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from datetime import datetime
from typing import List
import os
from pathlib import Path

app = FastAPI(title="Mergington High School API",
              description="API for viewing and signing up for extracurricular activities")

# Mount the static files directory
current_dir = Path(__file__).parent
app.mount("/static", StaticFiles(directory=os.path.join(Path(__file__).parent,
          "static")), name="static")

# In-memory activity database
activities = {
    "Chess Club": {
        "description": "Learn strategies and compete in chess tournaments",
        "schedule": "Fridays, 3:30 PM - 5:00 PM",
        "max_participants": 12,
        "participants": ["michael@mergington.edu", "daniel@mergington.edu"]
    },
    "Programming Class": {
        "description": "Learn programming fundamentals and build software projects",
        "schedule": "Tuesdays and Thursdays, 3:30 PM - 4:30 PM",
        "max_participants": 20,
        "participants": ["emma@mergington.edu", "sophia@mergington.edu"]
    },
    "Gym Class": {
        "description": "Physical education and sports activities",
        "schedule": "Mondays, Wednesdays, Fridays, 2:00 PM - 3:00 PM",
        "max_participants": 30,
        "participants": ["john@mergington.edu", "olivia@mergington.edu"]
    }
}


@app.get("/")
def root():
    return RedirectResponse(url="/static/index.html")


@app.get("/activities")
def get_activities():
    return activities


@app.post("/activities/{activity_name}/signup")
def signup_for_activity(activity_name: str, email: str):
    """Sign up a student for an activity"""
    # Validate activity exists
    if activity_name not in activities:
        raise HTTPException(status_code=404, detail="Activity not found")

    # Get the specific activity
    activity = activities[activity_name]

    # Add student
    activity["participants"].append(email)
    return {"message": f"Signed up {email} for {activity_name}"}


# Health Tracker Data Models
class HealthRecord(BaseModel):
    date: str
    steps: int
    water_intake: float  # in liters
    sleep_hours: float
    calories: int


# In-memory health records database
health_records: List[dict] = []


@app.get("/health")
def get_health_records():
    """Get all health records"""
    return health_records


@app.post("/health")
def add_health_record(record: HealthRecord):
    """Add a new health record"""
    health_record = {
        "id": len(health_records) + 1,
        "date": record.date,
        "steps": record.steps,
        "water_intake": record.water_intake,
        "sleep_hours": record.sleep_hours,
        "calories": record.calories,
        "timestamp": datetime.now().isoformat()
    }
    health_records.append(health_record)
    return {"message": "Health record added successfully", "record": health_record}


@app.get("/health/stats")
def get_health_stats():
    """Get health statistics summary"""
    if not health_records:
        return {
            "total_records": 0,
            "avg_steps": 0,
            "avg_water_intake": 0,
            "avg_sleep_hours": 0,
            "avg_calories": 0
        }
    
    total_records = len(health_records)
    avg_steps = sum(record["steps"] for record in health_records) / total_records
    avg_water_intake = sum(record["water_intake"] for record in health_records) / total_records
    avg_sleep_hours = sum(record["sleep_hours"] for record in health_records) / total_records
    avg_calories = sum(record["calories"] for record in health_records) / total_records
    
    return {
        "total_records": total_records,
        "avg_steps": round(avg_steps, 2),
        "avg_water_intake": round(avg_water_intake, 2),
        "avg_sleep_hours": round(avg_sleep_hours, 2),
        "avg_calories": round(avg_calories, 2)
    }
