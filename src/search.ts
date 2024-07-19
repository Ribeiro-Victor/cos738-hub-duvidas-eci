import { redis, redisVectorStore } from "./redis-store";


async function search() {
  await redis.connect()

  // Os parâmetros são o prompt e o número de chunks que podem responder o prompt. O retorno é dado pelos chunks que podem responder o prompt e um score é uma medição da diferença entre o prompt / chunk, ou seja, quanto menor o score, mais próximos semanticamente o chunk e a pergunta do usuário são 
  const response = await redisVectorStore.similaritySearchWithScore(
    'Quais bibliotecas o react suporta integração de gerenciamento de estado externas?',
    2 
  )

  console.log(response)

  await redis.disconnect()
}

search()