# Import necessary libraries
from langchain.chat_models import ChatOpenAI
from langchain.embeddings import OpenAIEmbeddings
from langchain.prompts import ChatPromptTemplate
from langchain.vectorstores import Chroma
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnableLambda, RunnablePassthrough
from langchain.text_splitter import CharacterTextSplitter
from langchain.chains.question_answering import load_qa_chain
from langchain.llms import OpenAI
from operator import itemgetter

mark_transcript = open("transcripts/mark_transcript.txt", "r").read()

def rag_transcript(query):
    # Splitting the transcript text into chunks
    text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0, separator="\n\n")
    split_chunks = text_splitter.split_text(mark_transcript)

    # Creating embeddings and document search
    embeddings = OpenAIEmbeddings()
    docsearch = Chroma.from_texts(split_chunks, embeddings, metadatas=[{"source": str(i)} for i in range(len(split_chunks))]).as_retriever()

    # Getting relevant documents for the query
    docs = docsearch.get_relevant_documents(query)

    # Loading the chat model and QA chain
    chat_model = ChatOpenAI(model_name="gpt-4-1106-preview")
    chain = load_qa_chain(llm=chat_model, chain_type="stuff")

    # Running the chain and getting the response
    response = chain.run(input_documents=docs, question=query)
    return response

if __name__ == "__main__":
    # Loading the transcript and running the query
    query = "What does Phil say about press strokes?"
    response = rag_transcript(query)
    print(response)
