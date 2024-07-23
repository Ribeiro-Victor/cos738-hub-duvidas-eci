import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { redis, redisVectorStore } from "./redis-store";
import { createRetrievalChain } from "langchain/chains/retrieval";

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
    Você responde perguntas sobre programação.
    O usuário está acompanhando um curso com vários conteúdos.
    Use os conteúdos das aulas abaixo para responder a pergunta do usuário.
    Se a resposta não for encontrada nos conteúdos, responda que você não sabe, não tente inventar uma resposta.

    Se possível, inclua exemplos de código.

    Conteúdos das aulas:
    {context}

    Pergunta:
    {input}
  `.trim(),
  inputVariables: ['context', 'input'] // variáveis que podemos receber no prompt
});

export async function main(input: string) {
  try {
    await redis.connect();

    const combineDocsChain = await createStuffDocumentsChain({
      llm: openAIChat,
      prompt,
    });

    const retrievalChain = await createRetrievalChain({
      combineDocsChain,
      retriever: redisVectorStore.asRetriever(),
    });

    const response = await retrievalChain.invoke({ 
      input 
    });

    return response;
  } catch (error) {
    console.error('Erro ao executar a cadeia de recuperação:', error);
  } finally {
    console.log('Desconectando do Redis...');
    await redis.disconnect();
    console.log('Desconectado do Redis.');
  }
}

