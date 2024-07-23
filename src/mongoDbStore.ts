import { MongoClient, Db, Collection } from "mongodb";

import 'dotenv/config'; 

const mongoClient = new MongoClient(process.env.DATABASE_URL || '');

async function logCollectionContents() {
  try {
    await mongoClient.connect();
    console.log('Conectado ao MongoDB.');

    const mongoDb: Db = mongoClient.db('hub_eci');
    const collection: Collection = mongoDb.collection('messages');

    const documents = await collection.find({}).toArray();
    console.log('Documentos encontrados na coleção messages:', documents);
  } catch (error) {
    console.error('Erro ao acessar a coleção MongoDB:', error);
  } finally {
    await mongoClient.close();
    console.log('Desconectado do MongoDB.');
  }
}

logCollectionContents();