# from openai import OpenAI

# model = OpenAI()

# voice = model.audio.speech.create(
#     input="Yes, sir?",
#     model="tts-1",
#     voice="alloy",
# )

# voice.stream_to_file("sounds/detected.mp3")

# voice = model.audio.speech.create(
#     input="Let me look that up for you, sir.",
#     model="tts-1",
#     voice="alloy",
# )

# voice.stream_to_file("sounds/processing.mp3")


###

# from elevenlabs import generate, set_api_key, save, RateLimitError
# import openai
# import os

# elevenlabs_key = os.getenv("ELEVENLABS_API_KEY")

# if elevenlabs_key:
#     set_api_key(elevenlabs_key)

# voice = generate(
#     text="Yes, sir?",
#     voice="George",
#     model="eleven_monolingual_v1"
# )
# # voice.stream_to_file("sounds/detected.mp3")
# save(voice, "sounds/detected.mp3")

# voice = generate(
#     text="Let me look that up for you, sir.",
#     voice="George",
#     model="eleven_monolingual_v1"
# )

# # voice.stream_to_file("sounds/processing.mp3")
# save(voice, "sounds/processing.mp3")

import os
from elevenlabs import generate, set_api_key, save, RateLimitError
from dotenv import load_dotenv
load_dotenv()

def generate_and_save_voice(text, file_path, voice="George", model="eleven_monolingual_v1"):
    # Set API key if it's available in the environment variables
    elevenlabs_key = os.getenv("ELEVENLABS_API_KEY")
    if elevenlabs_key:
        set_api_key(elevenlabs_key)
    
    # Generate the voice using the provided parameters
    voice = generate(
        text=text,
        voice=voice,
        model=model
    )
    
    # Save the generated voice to the specified file path
    save(voice, file_path)

# Usage
generate_and_save_voice("Yes, sir?", "sounds/detected.mp3")
generate_and_save_voice("Let me look that up for you, sir.", "sounds/processing.mp3")
