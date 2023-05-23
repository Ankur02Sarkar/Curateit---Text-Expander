from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from youtube_transcript_api import YouTubeTranscriptApi
from urllib.parse import unquote
from goose3 import Goose

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "API is running"}

@app.get("/transcript/{video_id}")
async def get_transcript(video_id: str):
    try:
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        all_text = " ".join([entry['text'] for entry in transcript])
        return {"transcription": all_text}
    except Exception as e:
        return {"error": str(e)}

@app.get("/extract_article/{url:path}")
def extract_article(url: str):
    try:
        decoded_url = unquote(url)
        goose = Goose()
        article = goose.extract(decoded_url)
        return {"text" : article.cleaned_text}
    except Exception as e:
        return {"error": str(e)}

