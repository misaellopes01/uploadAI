import { Github, Wand2 } from 'lucide-react'
import { Button } from './components/ui/button'
import { Separator } from './components/ui/separator'
import { Textarea } from './components/ui/textarea'
import { Label } from './components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './components/ui/select'
import { Slider } from './components/ui/slider'
import logo from '@/assets/vite.png'
import { VideoInputForm } from './components/video-input-form'

export function App() {
  return (
    <div className="min-h-screen flex flex-col font-poppins">
      <header className="px-6 py-3 flex items-center justify-between border-b">
        <h1 className="text-xl font-normal flex items-center justify-center">
          <img src={logo} alt="" className="w-6 h-6 mr-2" />
          upload.<em className="text-red-500 font-bold">ai</em>
        </h1>
        <nav className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            Desenvolvido com 💕 no NLW da Rocketseat
          </span>
          <Separator orientation="vertical" className="h-6" />
          <Button variant="outline">
            <Github className="w-4 h-4 mr-2" /> GitHub
          </Button>
        </nav>
      </header>
      <main className="flex-1 p-6 flex gap-6">
        <section className="flex flex-col flex-1 gap-4">
          <div className="grid grid-rows-2 gap-4 flex-1">
            <Textarea
              placeholder="inclua o prompt para IA..."
              className="resize-none p-4 leading-relaxed"
            />
            <Textarea
              placeholder="Resultado gerado pela IA..."
              className="resize-none p-4 leading-relaxed"
              readOnly
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Lembre-se: você pode utilizar a variável transcription no seu prompt
            para adicionar o conteúdo da{' '}
            <code className="text-violet-400">{'{transcrição}'}</code> do video
          </p>
        </section>
        <aside className="w-80 space-y-6">
          <VideoInputForm />
          <Separator />
          <form className="space-y-6">
            <div className="space-y-2">
              <Label>Prompt</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um prompt..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="title">Título do YouTube</SelectItem>
                  <SelectItem value="description">
                    Descrição do YouTube
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Modelo</Label>
              <Select disabled defaultValue="gpt3.5">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt3.5">GPT 3.5-turbo 16k</SelectItem>
                </SelectContent>
              </Select>
              <span className="block text-xs text-muted-foreground italic">
                Você poderá customizar essa opção em breve
              </span>
            </div>
            <Separator />
            <div className="space-y-4">
              <Label>Temperatura</Label>
              <Slider min={0} max={1} step={0.1} />
              <span className="block text-xs text-muted-foreground italic leading-relaxed">
                Valores mais altos tendem a deixar o resultado mais criativo e
                menos precisão
              </span>
            </div>

            <Button className="w-full" type="submit" variant="outline">
              Executar <Wand2 className="w-4 h-4 ml-2" />{' '}
            </Button>
          </form>
        </aside>
      </main>
    </div>
  )
}
