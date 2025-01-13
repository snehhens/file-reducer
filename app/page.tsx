import { FileText, Image, Scissors, Upload } from 'lucide-react'
import ToolCard from '@/components/ToolCard'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-400 to-indigo-600 p-6 md:p-24">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">File Reducer</h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            Reduce your file size instantly in your browser. 
            We don't store any data - everything happens locally and securely on your device.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ToolCard
            title="Image Reducer"
            description="Compress images while maintaining quality"
            icon={<Image className="w-6 h-6" />}
            type="image"
          />
          <ToolCard
            title="PDF Reducer"
            description="Reduce PDF file size efficiently"
            icon={<FileText className="w-6 h-6" />}
            type="pdf"
            comingSoon
          />
          <ToolCard
            title="Background Remover"
            description="Remove image backgrounds instantly"
            icon={<Scissors className="w-6 h-6" />}
            type="background"
            comingSoon
          />
          <ToolCard
            title="Bulk Reducer"
            description="Process multiple files at once"
            icon={<Upload className="w-6 h-6" />}
            type="bulk"
            comingSoon
          />
        </div>
      </div>
    </main>
  )
}

