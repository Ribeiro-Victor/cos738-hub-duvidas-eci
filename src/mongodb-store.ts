import { MongoClient, Db, Collection } from 'mongodb';
import { OpenAIEmbeddings } from '@langchain/openai';
import { MongoDBAtlasVectorSearch } from '@langchain/mongodb'; // Supondo que exista um módulo semelhante para MongoDB

import 'dotenv/config'; 

// Conexão com o MongoDB usando a URL fornecida
export const mongoClient = new MongoClient(process.env.DATABASE_URL || '');

// Conecta ao MongoDB
const mongoDb: Db = mongoClient.db('hub_eci'); // Nome do banco de dados
const collection: Collection = mongoDb.collection('messages'); // Nome da coleção

// Cria instância de embeddings da OpenAI
const embeddings = new OpenAIEmbeddings({ openAIApiKey: process.env.OPEN_AI_KEY });

// Cria instância da store para MongoDB Atlas
export const mongoVectorStore = new MongoDBAtlasVectorSearch(embeddings, {
  collection
});
