import os
import base64
from elevenlabs import generate, set_api_key

# Import FastAPI and other necessary libraries
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from rag import rag_transcript

# Define a FastAPI app
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Set up CORS middleware options
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Define a Pydantic model for the input data
class QueryInput(BaseModel):
    query: str

# Initialize the rag_transcript class
rag_service = rag_transcript()

@app.post("/query")
async def query_rag(input_data: QueryInput):
    try:
        # Use the rag_transcript method to get the response
        response = rag_service.rag_transcript(input_data.query)
        
        # Generate the voice using the provided parameters
        voice_id="George"
        model="eleven_monolingual_v1"
        if elevenlabs_key := os.getenv("ELEVENLABS_API_KEY"):
            set_api_key(elevenlabs_key)

        # Generate the voice using the provided parameters
        generated_audio = generate(
            text=response,
            voice=voice_id,
            model=model
        )
        audio_b64 = base64.b64encode(generated_audio).decode("utf-8")

        return {"response": response,
                "audio": audio_b64,
                }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Run the service if this file is executed as a script
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
