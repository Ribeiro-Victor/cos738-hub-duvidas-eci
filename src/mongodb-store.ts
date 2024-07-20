import { MongoClient, Db, Collection } from 'mongodb';
import { OpenAIEmbeddings } from '@langchain/openai';
import { MongoDBAtlasVectorSearch } from '@langchain/mongodb'; // Supondo que exista um módulo semelhante para MongoDB

// Conexão com o MongoDB usando a URL fornecida
export const mongoClient = new MongoClient('mongodb+srv://admin:admineci@cluster0.i4rlgsj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');

// Conecta ao MongoDB
const mongoDb: Db = mongoClient.db('hub_eci'); // Nome do banco de dados
const collection: Collection = mongoDb.collection('messages'); // Nome da coleção

// Cria instância de embeddings da OpenAI
const embeddings = new OpenAIEmbeddings({ openAIApiKey: 'sk-proj-uNmmdLuZWoC0Npyl9dUKT3BlbkFJ0EfMj93wGsNKwC8IliEL' });

// Cria instância da store para MongoDB Atlas
export const mongoVectorStore = new MongoDBAtlasVectorSearch(embeddings, {
  collection
});
