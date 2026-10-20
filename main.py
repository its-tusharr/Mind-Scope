import joblib
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import Literal
from fastapi.middleware.cors import CORSMiddleware

model = joblib.load("Mental_Health_Model.pkl")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


#Pydantic model for input data
class InputData(BaseModel):
    age                     : int = Field(..., ge=10, le=120)
    gender                  : Literal['Male', 'Female', 'Other']
    country                 : str   
    academic_level          : Literal['High School', 'Undergraduate', 'Graduate']
    most_used_platform      : Literal['Facebook', 'LinkedIn', 'Instagram', 'Snapchat', 'Twitter', 'YouTube', 'TikTok', 'LINE', 'KakaoTalk', 'VKontakte', 'WhatsApp', 'WeChat']
    purpose_of_use          : Literal['Networking', 'Education', 'Entertainment', 'News']
    avg_daily_usage_hours   : float = Field(..., ge=0, le=24)
    daily_unlocks           : int  = Field(..., ge=0)
    study_hours             : float = Field(..., ge=0, le=24)
    physical_activity_hours : float = Field(..., ge=0, le=24)
    sleep_hours_per_night   : float = Field(..., ge=0, le=24)
    stress_level            : Literal['Medium', 'Low', 'Very High', 'High']
  
# Describe what we send back (velidation for target column)
class predictionResponse(BaseModel):
    predicted_mental_health_score: float

@app.get("/")
def greet():
    return {"hello": "world"}

top_countries = ['Other','India','USA','Canada','Australia','UK','Germany','Mexico','Turkey','France']
@app.post('/predict', response_model=predictionResponse)
def predict(data : InputData):

    country_group = data.country if data.country in top_countries else 'Other'
    input_row = pd.DataFrame([{ 
        "Study_Hours"             : data.study_hours,
        "Age"                     : data.age,
        "Gender"                  : data.gender,
        "Academic_Level"          : data.academic_level,
        "Most_Used_Platform"      : data.most_used_platform,
        "Purpose_Of_Use"          : data.purpose_of_use,
        "Avg_Daily_Usage_Hours"   : data.avg_daily_usage_hours,
        "Daily_Unlocks"           : data.daily_unlocks,
        "Physical_Activity_Hours" : data.physical_activity_hours,
        "Sleep_Hours_Per_Night"   : data.sleep_hours_per_night,
        "Stress_Level"            : data.stress_level,
        "Grouped_country"         : country_group   
    }])

    prediction = model.predict(input_row)[0]
    return predictionResponse(predicted_mental_health_score= round(prediction, 2))