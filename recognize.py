from openai import OpenAI
from pathlib import Path
import playsound
import json
import sys
import os
import re
from rag import rag_transcript
from voices import generate_and_save_voice

from recorder import live_speech
from dotenv import load_dotenv
load_dotenv()

chatgpt = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
messages = [
    {
        "role": "system",
        "content": "You are a voice controlled assistant. Answer the user's prompts as best you can. Answer in 20 words or less. If the question requires a longer answer, ask the user first if they would like to know more. After confirmation, you can provide a full answer."
    },
]

def detect_wakeup(command: str, wakeup_words: list[str]):
    command = re.sub(r"[,\.!?]", "", command.lower())

    for word in wakeup_words:
        word = re.sub(r"[,\.!?]", "", word.lower())
        if word in command:
            return True

    return False

if not os.path.exists("wakeup_words.json"):
    print("You must run init.py first!")
    sys.exit(1)

wakeup_words = json.load(
    open("wakeup_words.json", "r", encoding="utf-8")
    )

while True:
    for message in live_speech():
        if detect_wakeup(message, wakeup_words):
            print(f"Detected: {message}")
            playsound.playsound(Path(__file__).parent / "sounds" / "detected.mp3")
            break
    for message in live_speech(50):
        playsound.playsound(Path(__file__).parent / "sounds" / "processing.mp3")
        # messages.append(
        #     {
        #         "role": "user",
        #         "content": message
        #     }
        # )
        # response = chatgpt.chat.completions.create(
        #     model="gpt-3.5-turbo",
        #     messages=messages
        # )        
        response_text = rag_transcript().rag_transcript(message)

        # response_text = response.choices[0].message.content
        print(f"Jarvis: {response_text}")

        # messages.append(
        #     {
        #         "role": "assistant",
        #         "content": response_text
        #     }
        # )
        
        generate_and_save_voice(response_text, "audio.mp3")
        
        # voice = chatgpt.audio.speech.create(
        #     input=response_text,
        #     model="tts-1",
        #     voice="alloy",
        # )

        # voice.stream_to_file("audio.mp3")
        playsound.playsound("audio.mp3")
        os.remove("audio.mp3")
        break
