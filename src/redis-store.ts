import { createClient } from "redis"
import { RedisVectorStore } from "@langchain/redis"
import { OpenAIEmbeddings } from "@langchain/openai"

import 'dotenv/config';

// Cria conexão com o Redis usando a porta padrão
export const redis = createClient({
  url: 'redis://127.0.0.1:6379'
})

// O primeiro parâmetro são os chunks e o segundo parâmetro é qual estrtégia utilizará para criar a representação semântica de cada chunk. Existem diversas opções de modelos pré treinados que podem ser utilizados para semântica (exemplos de modelos: sbert.net, hugging face..). Utilizaremos o modelo pago da open ai (melhor resultado)
export const redisVectorStore = new RedisVectorStore(
  new OpenAIEmbeddings({ openAIApiKey: process.env.OPEN_AI_KEY }),
  {
    indexName: 'test-embeddings', // índice para cada documento
    redisClient: redis, // cliente redis
    keyPrefix: 'test:' // todos os dados salvos no redis aqui serão salvos com esse prefixo
  }
)