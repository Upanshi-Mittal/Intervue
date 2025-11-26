from fastapi import FastAPI
from pydantic import BaseModel
from services.vertex_wrapper import evaluate_answer
app = FastAPI()

class AnswerInput(BaseModel):
    answer: str

@app.get("/")
def home():
    return {"status": "backend running"}

@app.post("/answer")
def analyze_answer(input: AnswerInput):
    return evaluate_answer(input.answer)

from services.github_parser import fetch_github_profile

@app.get("/github/{username}")
def github(username: str):
    return fetch_github_profile(username)
