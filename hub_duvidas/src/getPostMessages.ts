import { WithId, Document as MongodbDocument } from "mongodb";
import { Document, DocumentInterface } from "@langchain/core/documents";

import { mongoClient, mongoCollection } from "./mongodb-store";

const getFormattedBaseMessage = (
  baseMessage: DocumentInterface<Record<string, any>>, 
  postMessages: WithId<MongodbDocument>[]
) => {
  return {
    content: baseMessage.pageContent,
    timestamp: baseMessage.metadata.timestamp,
    postMessages: postMessages.map((postMessage) => (
      {
        content: postMessage.message,
        timestamp: postMessage.timestamp
      }
    ))
  }
}

const transformToDocument = (postMessages: WithId<MongodbDocument>[]) => {
  return postMessages.map(postMessage => new Document({
    pageContent: postMessage.message,
    metadata: {
      _id: postMessage._id,
      senderId: postMessage.senderId,
      timestamp: postMessage.timestamp
    },
    id: undefined
  }));
};

interface IFormattedBaseMessage {
  content: string;
  timestamp: any;
  postMessages: {
      content: any;
      timestamp: any;
  }[];
};

export async function getBaseAndPostMessages(baseMessages: DocumentInterface<Record<string, any>>[]) {
  try {
    await mongoClient.connect();

    let formattedBaseMessages: IFormattedBaseMessage[] = [];
    let baseAndPostMessages: Document[] = [];
    for (const baseMessage of baseMessages) {
      // Busca as 30 mensagens posteriores à mensagem base
      const postMessages = await mongoCollection
        .find({ timestamp: { $gt: baseMessage.metadata.timestamp } }) 
        .sort({ timestamp: 1 }) 
        .limit(30)
        .toArray();
  
      const formattedBaseMessage = getFormattedBaseMessage(baseMessage, postMessages);
      const baseAndPostMessage = {
        ...baseMessage,
        metadata: {
          ...baseMessage.metadata,
          postMessages: transformToDocument(postMessages)
        }
      };
  
      formattedBaseMessages.push(formattedBaseMessage);
      baseAndPostMessages.push(baseAndPostMessage);
    };
  
    // Agora você pode usar formattedBaseMessages e baseAndPostMessages
    //console.log("Formatted Base Messages:", formattedBaseMessages);
    //console.log("Base and Post Messages:", baseAndPostMessages);

    return {
      baseAndPostMessages, 
      formattedBaseMessages
    };
  } catch (error) {
    // Trata erros durante a busca
    console.error('Erro durante a busca das mensagens posteriores:', error);
  } finally {
    await mongoClient.close();
  };
};