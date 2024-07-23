import path from 'node:path';

// Forma para carregar arquivos para a aplicação, na documentação está em "Data connection/Document Loaders/Integrations/File Loaders": podemos baixar csv, docx, json, pdf, subtitles, pastas, página web...
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory'
import { JSONLoader } from 'langchain/document_loaders/fs/json'
import { TokenTextSplitter } from 'langchain/text_splitter'
import { RedisVectorStore } from "@langchain/redis";
import { OpenAIEmbeddings } from "@langchain/openai";
import { createClient } from 'redis';

import 'dotenv/config';

// Para cada arquivo no diretório "temp", carregar com o JSONLoader todos os arquivos que tiverem a extensão ".json". Porém, selecionar o valor da chave "text" para carregar em loader
const loader = new DirectoryLoader(
  path.resolve(__dirname, '../temp'),
  {
    '.json': path => new JSONLoader(path, '/text')
  }
)

async function load() {
  const docs = await loader.load()

  // Repartir um texto em chunks, sendo que cada chunk tem um tamanho de tokens definido. O método está explicado na documentação
  const splitter = new TokenTextSplitter({
    encodingName: 'cl100k_base', // algoritmo para calcular quantos tokens existem em um texto (utilizado pelo GPT 3.5 e 4.0)
    chunkSize: 680, // número de tokens em cada chunk
    chunkOverlap: 0, // conteúdo de um chunk não pode sobrepor outro
  })

  const splittedDocuments = await splitter.splitDocuments(docs)

  // Cria conexão com o Redis usando a porta padrão
  const redis = createClient({
    url: 'redis://127.0.0.1:6379'
  })

  redis.connect()

  // O primeiro parâmetro são os chunks e o segundo parâmetro é qual estrtégia utilizará para criar a representação semântica de cada chunk. Existem diversas opções de modelos pré treinados que podem ser utilizados para semântica (exemplos de modelos: sbert.net, hugging face..). Utilizaremos o modelo pago da open ai (melhor resultado)
  await RedisVectorStore.fromDocuments(
    splittedDocuments, 
    new OpenAIEmbeddings({ openAIApiKey: process.env.OPEN_AI_KEY }),
    {
      indexName: 'test-embeddings', // índice para cada documento
      redisClient: redis, // cliente redis
      keyPrefix: 'test:' // todos os dados salvos no redis aqui serão salvos com esse prefixo
    }
  )

  await redis.disconnect()
}

load()