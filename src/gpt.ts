import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { redis, redisVectorStore } from "./redis-store";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { mongoClient, mongoVectorStore } from "./mongodb-store";

import 'dotenv/config'; 

const openAIChat = new ChatOpenAI({
  openAIApiKey: process.env.OPEN_AI_KEY, // chave api open ai
  modelName: 'gpt-3.5-turbo', // modelo
  temperature: 0.3 // nível de criatividade / aleatoriedade do modelo
})

import 'dotenv/config'; 

// Criação do prompt
const prompt = new PromptTemplate({
  template: `
    Você responde perguntas sobre o curso de engenharia de computação.
    Use os conteúdos das mensagens abaixo para responder a pergunta do usuário.
    Se a resposta não for encontrada nas mensagens, responda que você não sabe, não tente inventar uma resposta.

    Conteúdos das aulas:
    {context}

    Pergunta:
    {input}
  `.trim(),
  inputVariables: ['context', 'input'] // variáveis que podemos receber no prompt
});

export async function main(input: string) {
  try {
    await mongoClient.connect();

    const combineDocsChain = await createStuffDocumentsChain({
      llm: openAIChat,
      prompt,
    });

    const retrievalChain = await createRetrievalChain({
      combineDocsChain,
      retriever: mongoVectorStore.asRetriever(),
    });

    const response = await retrievalChain.invoke({ 
      input 
    });

    return response;
  } catch (error) {
    console.error('Erro ao executar a cadeia de recuperação:', error);
  } finally {
    console.log('Desconectando do Redis...');
    await mongoClient.close();
    console.log('Desconectado do Redis.');
  }
}

