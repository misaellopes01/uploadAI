import { Label } from '@radix-ui/react-label'
import { FileVideo, Upload } from 'lucide-react'
import { ChangeEvent, FormEvent, useMemo, useRef, useState } from 'react'
import { getFFmpeg } from '@/lib/ffmpeg'
import { fetchFile } from '@ffmpeg/util'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { api } from '@/lib/axios'

type Status =
  | 'waiting'
  | 'converting'
  | 'uploading'
  | 'generating'
  | 'success'
  | 'error'

const statusMessage = {
  converting: 'Convertendo...',
  generating: 'Transcrevendo...',
  uploading: 'Carregando...',
  success: 'Sucesso!',
  error: 'Ocorreu um erro',
}

interface VideoInputFormProps {
  onVideoUploaded: (id: string) => void
}

export function VideoInputForm({ onVideoUploaded }: VideoInputFormProps) {
  const [videoFIle, setVideoFile] = useState<File | null>(null)
  const [status, setStatus] = useState<Status>('waiting')
  const promptInputRef = useRef<HTMLTextAreaElement>(null)

  function handleFileSelected(event: ChangeEvent<HTMLInputElement>) {
    event.preventDefault()
    const { files } = event.currentTarget

    if (!files) {
      return
    }
    const selectedFile = files[0]

    setVideoFile(selectedFile)
  }

  async function convertVideoToAudio(video: File) {
    console.log('Conversion started!')

    const ffmpeg = await getFFmpeg()
    await ffmpeg.writeFile('input.mp4', await fetchFile(video))

    // ffmpeg.on('log', log => console.log(log))
    ffmpeg.on('progress', (progress) => {
      console.log('Conversion progress: ', Math.round(progress.progress * 100))
    })

    await ffmpeg.exec([
      '-i',
      'input.mp4',
      '-map',
      '0:a',
      '-b:a',
      '20k',
      '-acodec',
      'libmp3lame',
      'output.mp3',
    ])

    const data = await ffmpeg.readFile('output.mp3')

    const audioFileBlob = new Blob([data], { type: 'audio/mpeg' })
    const audioFile = new File([audioFileBlob], 'audio.mp3', {
      type: 'audio/mpeg',
    })

    console.log('Conversion finished!')
    return audioFile
  }

  async function handleUploadVideo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const prompt = promptInputRef.current?.value

    // put a prompt message here
    if (!videoFIle) {
      return
    }

    setStatus('converting')

    // convert video to audio
    const audioFile = await convertVideoToAudio(videoFIle)

    const data = new FormData()

    data.append('file', audioFile)
    setStatus('uploading')
    const response = await api.post('/videos', data)
    const videoId = response.data.id

    setStatus('generating')
    await api.post(`/videos/${videoId}/transcription`, {
      prompt,
    })

    setStatus('success')
    onVideoUploaded(videoId)
  }

  const previewURL = useMemo(() => {
    if (!videoFIle) {
      return null
    }
    return URL.createObjectURL(videoFIle)
  }, [videoFIle])

  return (
    <form className="space-y-6" onSubmit={handleUploadVideo}>
      <label
        htmlFor="video"
        className="relative cursor-pointer border flex rounded-md aspect-video border-dashed text-sm flex-col items-center justify-center text-muted-foreground gap-2 hover:bg-primary/5"
      >
        {previewURL ? (
          <video
            src={previewURL}
            controls={false}
            className="pointer-events-none absolute inset-0"
          />
        ) : (
          <>
            <FileVideo className="w-8 h-8" />
            Selecione um vídeo
          </>
        )}
      </label>
      <input
        type="file"
        id="video"
        accept="video/mp4"
        className="sr-only"
        onChange={handleFileSelected}
      />
      {/* <Separator /> */}

      <div className="space-y-2">
        <Label htmlFor="transcription_prompt">Prompt de transcrição</Label>
        <Textarea
          disabled={status !== 'waiting'}
          ref={promptInputRef}
          id="transcription_prompt"
          className="h-20 leading-relaxed resize-none"
          placeholder="...inclua palavras-chave mencionadas no video separadas por virgula (,)"
        />
      </div>

      <Button
        data-success={status === 'success'}
        disabled={status !== 'waiting'}
        type="submit"
        className="w-full data-[success=true]:bg-emerald-400 data-[success=true]:text-zinc-50"
        variant={'destructive'}
      >
        {status === 'waiting' ? (
          <>
            Carregar vídeo <Upload className="w-4 h-4 ml-2" />
          </>
        ) : (
          statusMessage[status]
        )}
      </Button>
    </form>
  )
}
