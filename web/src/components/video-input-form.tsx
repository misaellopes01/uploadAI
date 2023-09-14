import { Label } from '@radix-ui/react-label'
import { FileVideo, Upload } from 'lucide-react'
import { ChangeEvent, FormEvent, useMemo, useRef, useState } from 'react'
import { getFFmpeg } from '@/lib/ffmpeg'
import { fetchFile } from '@ffmpeg/util'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'

export function VideoInputForm() {
  const [videoFIle, setVideoFile] = useState<File | null>(null)
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

    // convert video to audio
    const audioFile = await convertVideoToAudio(videoFIle)
    console.log(prompt)

    console.log(audioFile)
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
          ref={promptInputRef}
          id="transcription_prompt"
          className="h-20 leading-relaxed resize-none"
          placeholder="...inclua palavras-chave mencionadas no video separadas por virgula (,)"
        />
      </div>

      <Button type="submit" className="w-full" variant={'destructive'}>
        Carregar vídeo <Upload className="w-4 h-4 ml-2" />
      </Button>
    </form>
  )
}
