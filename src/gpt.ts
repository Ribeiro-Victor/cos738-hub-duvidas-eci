import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { RetrievalQAChain } from 'langchain/chains'
import { redis, redisVectorStore } from "./redis-store";

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
    {question}
  `.trim(),
  inputVariables: ['context', 'question'] // variáveis que podemos receber no prompt
});

// As chains são uma forma de conectar os módulos: prompt, api da OpenAI e banco de dados redis
// A ConversationChain é uma chain que podemos utilizar uma inteligência de memória
const chain = RetrievalQAChain.fromLLM(openAIChat, redisVectorStore.asRetriever(), {
  prompt,
  returnSourceDocuments: true,
  verbose: true
})

async function main() {
  await redis.connect()

  const response = await chain.call({
    query: 'Quais bibliotecas o react suporta integração de gerenciamento de estado externas?'
  })

  console.log(response)

  await redis.disconnect()
}

main()

