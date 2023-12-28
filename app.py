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
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Run the service if this file is executed as a script
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
