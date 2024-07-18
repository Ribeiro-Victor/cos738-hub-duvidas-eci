from pymongo.mongo_client import MongoClient
from dotenv import load_dotenv
import os
import pandas as pd
import ast

load_dotenv()
data = pd.read_csv('conversa_embedded.csv', index_col=0)
data['message'] = data['message'].astype(str)
data['timestamp'] = pd.to_datetime(data['timestamp'], dayfirst=False)
data['embeddings'] = data['embeddings'].apply(ast.literal_eval)
print("Loaded from csv")

MONGO_CONN_STRING = os.getenv('MONGO_CONNECTION_STRING')
client = MongoClient(MONGO_CONN_STRING)
db = client['hub_eci']
collection = db['messages']

# Prepare data for MongoDB
data = data.to_dict(orient='records')

chunk_size = 10000
for i in range(0, len(data), chunk_size):
    chunk = data[i:i + chunk_size]
    collection.insert_many(chunk)
print("Data inserted into MongoDB successfully.")