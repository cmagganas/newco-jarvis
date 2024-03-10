import os
from elevenlabs import generate, set_api_key

# Assuming the setup and API call code you provided is here

voice_id = "George"
model = "eleven_monolingual_v1"
elevenlabs_key = True

texts = ["Hello", "How can I help you?", "No! That's so wild!"]
if elevenlabs_key := os.getenv("ELEVENLABS_API_KEY"):
    set_api_key(elevenlabs_key)
    print("API key set")


    for text in texts:
        print(f"Generating audio for: {text}")
        # Generate the voice using the provided parameters
        generated_audio = generate(
            text=text,
            voice=voice_id,
            model=model
        )

        # Specify the filename for the MP3 file
        filename = f"{text}.mp3"

        # Write the generated audio data to an MP3 file
        with open(filename, "wb") as file:
            file.write(generated_audio)

        print(f"Audio saved to {filename}")
    
