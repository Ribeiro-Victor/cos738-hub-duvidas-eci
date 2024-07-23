import { MongoClient, Db, Collection } from 'mongodb';
import { MongoDBAtlasVectorSearch } from '@langchain/mongodb'; // Supondo que exista um módulo semelhante para 
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";

import 'dotenv/config';

// Conexão com o MongoDB usando a URL fornecida
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not defined');
}

export const mongoClient = new MongoClient(process.env.DATABASE_URL);

// Conecta ao MongoDB
const mongoDb: Db = mongoClient.db('hub_eci'); // Nome do banco de dados
export const mongoCollection: Collection = mongoDb.collection('messages'); // Nome da coleção

// Cria instância de embeddings da OpenAI
const embeddings = new HuggingFaceInferenceEmbeddings({
  model: 'sentence-transformers/all-MiniLM-L6-v2',
  apiKey: process.env.HUGGING_FACE_API_KEY
});

// Cria instância da store para MongoDB Atlas
export const mongoVectorStore = new MongoDBAtlasVectorSearch(embeddings, {
  collection: mongoCollection,
  textKey: 'message',
  embeddingKey: 'embeddings',
  indexName: 'vector_index'
});
