import { fastify } from 'fastify'
import { fastifyCors } from '@fastify/cors'
import { getAllPromptsRoute } from './routes/getAllPrompts'
import { uploadVideoRoute } from './routes/uploadVideo'
import { createTranscriptionRoute } from './routes/createTranscription'
import { generateAICompletionRoute } from './routes/generateAICompletion'

const server = fastify()

server.register(fastifyCors, {
  origin: '*',
})

server.register(getAllPromptsRoute)
server.register(uploadVideoRoute)
server.register(createTranscriptionRoute)
server.register(generateAICompletionRoute)

server
  .listen({
    port: 3333,
  })
  .then(() => console.log('server running...'))
