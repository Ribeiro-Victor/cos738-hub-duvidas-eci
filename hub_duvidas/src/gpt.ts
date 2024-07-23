import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { Document } from "@langchain/core/documents";

import { mongoClient } from "./mongodb-store";
import { searchBaseMessages } from "./searchBaseMessages";
import { getBaseAndPostMessages } from "./getPostMessages";
import 'dotenv/config';

const getBaseAndPostMessageDocuments = (baseAndPostMessages: Document<Record<string, any>>[]) => {
  const baseAndPostMessageDocuments = [];
  for (const baseMessage of baseAndPostMessages) {
    // Copia o baseMessage sem a chave metadata.postMessages
    const { metadata: { postMessages, ...metadataWithoutPostMessages }, ...rest } = baseMessage;
    const baseMessageWithoutPostMessages = {
      ...rest,
      metadata: metadataWithoutPostMessages,
    };

    // Adiciona o baseMessage modificado na nova lista
    baseAndPostMessageDocuments.push(baseMessageWithoutPostMessages);

    // Adiciona todos os postMessages na nova lista
    baseAndPostMessageDocuments.push(...postMessages);
  };

  return baseAndPostMessageDocuments;
};

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
    Você responde perguntas sobre do curso de Engenharia de Computação e Informação da universidade UFRJ do Rio de Janeiro (Brasil).
    Use os conteúdos das mensagens abaixo para responder a pergunta do usuário, mas use sua criatividade para dar suas opiniões / recomendações, caso a pergunta dê abertura para isso.
    Se a resposta não for encontrada nas mensagens, responda que você não sabe, não tente inventar uma resposta.
    Mande as respostas sempre em Markdown.
    Responda em tabela somente for exibir uma lista.

    Mensagens:
    {context}

    Pergunta:
    {input}
  `.trim(),
  inputVariables: ['context', 'input'] // variáveis que podemos receber no prompt
});

export async function main(input: string) {
  try {
    await mongoClient.connect();

    const baseMessages = await searchBaseMessages(input);
    const result = baseMessages && await getBaseAndPostMessages(baseMessages);
    if (result) {
      const { baseAndPostMessages, formattedBaseMessages } = result;

      const combineDocsChain = await createStuffDocumentsChain({
        llm: openAIChat,
        prompt
      });

      const baseAndPostMessageDocuments = getBaseAndPostMessageDocuments(baseAndPostMessages);
      console.log("invoking")
      const response = await combineDocsChain.invoke({ 
        input,
        context: baseAndPostMessageDocuments
      });
      console.log("response", response);
      
      return {
        content: response,
        baseMessages: formattedBaseMessages
      };
    } else {
      throw new Error('Nenhuma mensagem encontrada na busca semântica');
    };
  } catch (error) {
    console.error('Erro ao executar a cadeia de recuperação:', error);
  } finally {
    await mongoClient.close();
  };
};
