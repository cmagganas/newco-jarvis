# Import necessary libraries
import os
import openai
from dotenv import load_dotenv
load_dotenv()
openai.api_key = os.environ["OPENAI_API_KEY"]

from langchain.chains.question_answering import load_qa_chain
from langchain.chat_models import ChatOpenAI
from langchain.embeddings import OpenAIEmbeddings
from langchain.text_splitter import CharacterTextSplitter
from langchain.vectorstores import Chroma


mark_transcript = open("transcripts/mark_transcript.txt", "r").read()
transcript = mark_transcript

class rag_transcript():
    def __init__(self):
        self.transcript = transcript
        self.initialized = False
        
        # Splitting the transcript text into chunks
        text_splitter = CharacterTextSplitter(chunk_size=800, chunk_overlap=50, separator="\n\n")
        split_chunks = text_splitter.split_text(mark_transcript)
        
        # Creating embeddings and document search
        embeddings = OpenAIEmbeddings()
        retriever = Chroma.from_texts(split_chunks, embeddings, metadatas=[{"source": str(i)} for i in range(len(split_chunks))]).as_retriever()
        
        # Loading the chat model and QA chain
        chat_model = ChatOpenAI(model_name="gpt-4-1106-preview")
        chain = load_qa_chain(llm=chat_model, chain_type="stuff")
        self.retriever = retriever
        self.chain = chain

    def rag_transcript(self, query): 
        # sourcery skip: inline-immediately-returned-variable
        
        # Getting relevant documents for the query
        docs = self.retriever.get_relevant_documents(query)
        
        # Running the chain and getting the response
        response = self.chain.run(input_documents=docs, question=query)
        return response

if __name__ == "__main__":
    # Loading the transcript and running the query
    QUERY_TO_TEST = "What does Phil say about press strokes?"
    test_response = rag_transcript().rag_transcript(QUERY_TO_TEST)
    print(test_response)
