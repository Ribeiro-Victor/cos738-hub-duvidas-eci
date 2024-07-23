import pandas as pd
from transformers import AutoTokenizer, AutoModel
import torch
from datetime import datetime

data = pd.read_csv('historico_conversa_filtered.csv')
data['message'] = data['message'].astype(str)
data['timestamp'] = pd.to_datetime(data['timestamp'], dayfirst=True)
data.sort_values(by='timestamp', inplace=True)

model_name = 'sentence-transformers/all-MiniLM-L6-v2'
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModel.from_pretrained(model_name)

def embed_text(text):
    inputs = tokenizer(text, return_tensors='pt', truncation=True, padding=True)
    
    with torch.no_grad():
        outputs = model(**inputs)
    
    embeddings = outputs.last_hidden_state.mean(dim=1)
    return embeddings[0].numpy().tolist()

print(f"Starting at: {datetime.now().strftime('%H:%M:%S')}")
data['embeddings'] = data['message'].apply(embed_text)
print(f"Finished at: {datetime.now().strftime('%H:%M:%S')}")

data.to_csv('conversa_embedded.csv')

