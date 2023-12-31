import { FastifyInstance } from 'fastify'
import { fastifyMultipart } from '@fastify/multipart'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import fs from 'node:fs'
import util from 'node:util'
import { pipeline } from 'node:stream'
import { prisma } from '../lib/prisma'

// pump = pipeline upload multipart
const pump = util.promisify(pipeline)

export async function uploadVideoRoute(app: FastifyInstance) {
  app.register(fastifyMultipart, {
    limits: {
      fileSize: 1_048_576 * 25, // 25Mb
    },
  })
  app.post('/videos', async (req, res) => {
    const data = await req.file()

    if (!data) {
      return res.status(400).send({ error: 'Missing file input.' })
    }
    const extension = path.extname(data.filename)

    if (extension !== '.mp3') {
      return res
        .status(400)
        .send({ error: 'Invalid filetype, please upload a MP3.' })
    }

    const fileBaseName = path.basename(data.filename, extension)
    const fileUploadName = `${fileBaseName}-${randomUUID()}${extension}`
    const uploadDestination = path.resolve(
      __dirname,
      '../../tmp',
      fileUploadName,
    )

    await pump(data.file, fs.createWriteStream(uploadDestination))

    const video = await prisma.video.create({
      data: {
        name: data.filename,
        path: uploadDestination,
      },
    })

    return res.status(200).send(video)
  })
}
