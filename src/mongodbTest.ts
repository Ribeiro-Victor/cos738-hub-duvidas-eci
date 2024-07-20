const { MongoClient } = require('mongodb');

// Use sua string de conexão aqui
const MONGO_CONN_STRING = process.env.MONGO_CONNECTION_STRING || 'mongodb+srv://admin:admineci@cluster0.i4rlgsj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Função assíncrona para acessar o MongoDB e imprimir a primeira linha da coleção
async function accessMongoDB() {
  const client = new MongoClient(MONGO_CONN_STRING, {
    tls: true,
    tlsAllowInvalidCertificates: true, // Ignora certificados inválidos
  });

  try {
    // Conectando ao MongoDB
    await client.connect();

    // Selecionando o banco de dados e a coleção
    const db = client.db('hub_eci');
    const collection = db.collection('messages');

    // Buscando a primeira linha da coleção
    const firstDocument = await collection.findOne();

    // Imprimindo a primeira linha
    console.log('Primeira linha da coleção:', firstDocument);
  } catch (error) {
    console.error('Erro ao acessar o MongoDB:', error);
  } finally {
    // Fechando a conexão
    await client.close();
  }
}

// Chamando a função
accessMongoDB();