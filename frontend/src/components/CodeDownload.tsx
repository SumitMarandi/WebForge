import { useState } from 'react'
import { Download, Code, FileText, Palette, Package, Eye, ExternalLink, Copy, Monitor, Smartphone, Tablet, Check, Globe } from 'lucide-react'
import { generateHTML, generateCSS, generateJavaScript, downloadAsZip, downloadIndividualFile } from '@/utils/codeGenerator'
import { useSubscription } from '@/contexts/SubscriptionContext'
import { canDownloadCode } from '@/utils/subscription'
import { DownloadPrompt } from './UpgradePrompt'

interface Site {
  id: string
  name: string
  slug: string
  description: string | null
  is_published: boolean
  created_at: string
  updated_at: string
}

interface Page {
  id: string
  title: string
  slug: string
  content: { blocks: any[] }
  is_home: boolean
}

interface CodeDownloadProps {
  site: Site
  pages: Page[]
  onClose: () => void
}

export default function CodeDownload({ site, pages, onClose }: CodeDownloadProps) {
  const [downloading, setDownloading] = useState(false)
  const [previewType, setPreviewType] = useState<'html' | 'css' | 'js' | 'live' | null>(null)
  const [previewContent, setPreviewContent] = useState('')
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [copied, setCopied] = useState(false)
  
  const { subscription } = useSubscription()
  const hasDownloadAccess = subscription ? canDownloadCode(subscription) : false

  const handleDownloadAll = async () => {
    setDownloading(true)
    try {
      await downloadAsZip(site, pages)
    } catch (error) {
      console.error('Error downloading files:', error)
      alert('Error creating download. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  const handleDownloadIndividual = (type: 'html' | 'css' | 'js') => {
    let content = ''
    let filename = ''
    let mimeType = ''

    switch (type) {
      case 'html':
        content = generateHTML(site, pages)
        filename = 'index.html'
        mimeType = 'text/html'
        break
      case 'css':
        content = generateCSS(site, pages)
        filename = 'styles.css'
        mimeType = 'text/css'
        break
      case 'js':
        content = generateJavaScript(site, pages)
        filename = 'script.js'
        mimeType = 'text/javascript'
        break
    }

    downloadIndividualFile(content, filename, mimeType)
  }

  const handlePreview = (type: 'html' | 'css' | 'js' | 'live') => {
    if (type === 'live') {
      setPreviewType('live')
      return
    }

    let content = ''

    switch (type) {
      case 'html':
        content = generateHTML(site, pages)
        break
      case 'css':
        content = generateCSS(site, pages)
        break
      case 'js':
        content = generateJavaScript(site, pages)
        break
    }

    setPreviewContent(content)
    setPreviewType(type)
  }

  const handleCopyCode = async () => {
    if (!previewContent) return

    try {
      await navigator.clipboard.writeText(previewContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy code:', error)
    }
  }

  const generateLivePreview = () => {
    const html = generateHTML(site, pages)
    const css = generateCSS(site, pages)
    const js = generateJavaScript(site, pages)

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${site.name}</title>
    <style>
${css}
    </style>
</head>
<body>
    ${html.match(/<body[^>]*>([\s\S]*)<\/body>/)?.[1] || ''}
    <script>
${js}
    </script>
</body>
</html>`
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'html':
        return <FileText className="w-5 h-5 text-orange-600" />
      case 'css':
        return <Palette className="w-5 h-5 text-blue-600" />
      case 'js':
        return <Code className="w-5 h-5 text-yellow-600" />
      default:
        return <FileText className="w-5 h-5 text-gray-600" />
    }
  }

  const getFileSize = (type: 'html' | 'css' | 'js') => {
    let content = ''
    switch (type) {
      case 'html':
        content = generateHTML(site, pages)
        break
      case 'css':
        content = generateCSS(site, pages)
        break
      case 'js':
        content = generateJavaScript(site, pages)
        break
    }
    return `${Math.round(new Blob([content]).size / 1024)} KB`
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Download Code</h2>
            <p className="text-gray-600 mt-1">Export your website as HTML, CSS & JavaScript</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ExternalLink className="w-6 h-6 rotate-45" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Left Panel - Download Options */}
          <div className="w-1/2 p-6 border-r border-gray-200">
            {!hasDownloadAccess && subscription && (
              <div className="mb-6">
                <DownloadPrompt currentPlan={subscription.plan} />
              </div>
            )}
            <div className="space-y-6">
              {/* Download All */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <Package className="w-6 h-6 text-blue-600 mr-3" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Complete Package</h3>
                      <p className="text-sm text-gray-600">All files in a ZIP archive</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleDownloadAll}
                  disabled={downloading || !hasDownloadAccess}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {downloading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  {downloading ? 'Creating ZIP...' : 'Download ZIP'}
                </button>
              </div>

              {/* Live Preview */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Preview Options</h3>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <Globe className="w-6 h-6 text-green-600 mr-3" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Live Preview</h4>
                        <p className="text-sm text-gray-600">See how your website looks</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handlePreview('live')}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                  >
                    <Monitor className="w-4 h-4 mr-2" />
                    Open Live Preview
                  </button>
                </div>
              </div>

              {/* Individual Files */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Individual Files</h3>
                <div className="space-y-3">
                  {[
                    { type: 'html' as const, name: 'HTML', desc: 'Main structure file', filename: 'index.html' },
                    { type: 'css' as const, name: 'CSS', desc: 'Styles and layout', filename: 'styles.css' },
                    { type: 'js' as const, name: 'JavaScript', desc: 'Interactive functionality', filename: 'script.js' }
                  ].map((file) => (
                    <div key={file.type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        {getFileIcon(file.type)}
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">{file.filename}</p>
                          <p className="text-sm text-gray-600">{file.desc} • {getFileSize(file.type)}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handlePreview(file.type)}
                          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadIndividual(file.type)}
                          disabled={!hasDownloadAccess}
                          className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title={hasDownloadAccess ? "Download" : "Upgrade to download"}
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Info */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2">📋 What's included:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Responsive HTML structure</li>
                  <li>• Complete CSS styling</li>
                  <li>• Interactive JavaScript</li>
                  <li>• Mobile-friendly design</li>
                  <li>• README with instructions</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="w-1/2 p-6">
            {previewType === 'live' ? (
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Globe className="w-5 h-5 text-green-600 mr-2" />
                    <h3 className="font-semibold text-gray-900">Live Preview</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* Device Toggle */}
                    <div className="flex bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => setPreviewDevice('desktop')}
                        className={`p-1 rounded ${previewDevice === 'desktop' ? 'bg-white shadow-sm' : ''}`}
                        title="Desktop"
                      >
                        <Monitor className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setPreviewDevice('tablet')}
                        className={`p-1 rounded ${previewDevice === 'tablet' ? 'bg-white shadow-sm' : ''}`}
                        title="Tablet"
                      >
                        <Tablet className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setPreviewDevice('mobile')}
                        className={`p-1 rounded ${previewDevice === 'mobile' ? 'bg-white shadow-sm' : ''}`}
                        title="Mobile"
                      >
                        <Smartphone className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => setPreviewType(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <div className="flex-1 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                  <div className={`bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 ${
                    previewDevice === 'mobile' ? 'w-80 h-[600px]' :
                    previewDevice === 'tablet' ? 'w-[600px] h-[450px]' :
                    'w-full h-full'
                  }`}>
                    <iframe
                      srcDoc={generateLivePreview()}
                      className="w-full h-full border-0"
                      title="Live Preview"
                    />
                  </div>
                </div>
              </div>
            ) : previewType && previewContent ? (
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    {getFileIcon(previewType)}
                    <h3 className="font-semibold text-gray-900 ml-2">
                      {previewType.toUpperCase()} Preview
                    </h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleCopyCode}
                      className={`p-2 rounded transition-colors ${
                        copied 
                          ? 'bg-green-100 text-green-600' 
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                      }`}
                      title={copied ? 'Copied!' : 'Copy code'}
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => setPreviewType(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <div className="flex-1 bg-gray-900 rounded-lg overflow-hidden relative">
                  <pre className="h-full overflow-auto p-4 text-sm">
                    <code className="text-green-400 whitespace-pre-wrap font-mono">
                      {previewContent}
                    </code>
                  </pre>
                  {/* Line numbers */}
                  <div className="absolute top-0 left-0 p-4 text-gray-500 text-sm font-mono pointer-events-none">
                    {previewContent.split('\n').map((_, index) => (
                      <div key={index} className="leading-5">
                        {index + 1}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-center">
                <div>
                  <div className="flex justify-center space-x-4 mb-6">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <Code className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <Globe className="w-8 h-8 text-green-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Preview Your Code</h3>
                  <p className="text-gray-600 mb-4">
                    View generated code or see a live preview of your website
                  </p>
                  <div className="space-y-2 text-sm text-gray-500">
                    <p>• Click preview buttons to see code</p>
                    <p>• Use live preview for visual testing</p>
                    <p>• Copy code directly to clipboard</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}