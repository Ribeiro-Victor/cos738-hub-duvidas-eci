import { mongoClient, mongoVectorStore } from "./mongodb-store";

export async function searchBaseMessages(input: string) {
  try {
    // Conecta ao MongoDB
    await mongoClient.connect();

    // Executa a busca semântica
    const response = await mongoVectorStore.similaritySearch(input, 5);

    // Retorna os resultados
    console.log(response);
    return response;
  } catch (error) {
    // Trata erros durante a busca
    console.error('Erro durante a busca:', error);
  } finally {
    // Garante que a conexão seja fechada, independentemente de erros
    await mongoClient.close();
  };
};