import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/utils/supabase'
import { Save, Eye, Globe, Plus, Type, Image as ImageIcon, Layout } from 'lucide-react'

interface Site {
  id: string
  name: string
  slug: string
  is_published: boolean
}

interface Page {
  id: string
  title: string
  slug: string
  content: any
  is_home: boolean
}

interface Block {
  id: string
  type: 'heading' | 'paragraph' | 'image'
  content: string
  level?: number
}

export default function EditorPage() {
  const { siteId } = useParams()
  const navigate = useNavigate()
  const [site, setSite] = useState<Site | null>(null)
  const [pages, setPages] = useState<Page[]>([])
  const [currentPage, setCurrentPage] = useState<Page | null>(null)
  const [blocks, setBlocks] = useState<Block[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (siteId) {
      fetchSiteData()
    }
  }, [siteId])

  const fetchSiteData = async () => {
    try {
      // Fetch site info
      const { data: siteData, error: siteError } = await supabase
        .from('sites')
        .select('*')
        .eq('id', siteId)
        .single()

      if (siteError) throw siteError
      setSite(siteData)

      // Fetch pages
      const { data: pagesData, error: pagesError } = await supabase
        .from('pages')
        .select('*')
        .eq('site_id', siteId)
        .order('is_home', { ascending: false })

      if (pagesError) throw pagesError
      setPages(pagesData || [])

      // Set current page to home page or first page
      const homePage = pagesData?.find(p => p.is_home) || pagesData?.[0]
      if (homePage) {
        setCurrentPage(homePage)
        setBlocks(homePage.content?.blocks || [])
      }
    } catch (error) {
      console.error('Error fetching site data:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveContent = async () => {
    if (!currentPage) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('pages')
        .update({
          content: { blocks },
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentPage.id)

      if (error) throw error
    } catch (error) {
      console.error('Error saving content:', error)
    } finally {
      setSaving(false)
    }
  }

  const publishSite = async () => {
    if (!site) return

    try {
      // Call Supabase Edge Function to publish site
      const { data, error } = await supabase.functions.invoke('publish-site', {
        body: { siteId: site.id }
      })

      if (error) throw error

      // Update site status
      await supabase
        .from('sites')
        .update({ is_published: true })
        .eq('id', site.id)

      setSite({ ...site, is_published: true })
      alert('Site published successfully!')
    } catch (error) {
      console.error('Error publishing site:', error)
      alert('Error publishing site. Please try again.')
    }
  }

  const addBlock = (type: Block['type']) => {
    const newBlock: Block = {
      id: Date.now().toString(),
      type,
      content: type === 'heading' ? 'New Heading' : type === 'paragraph' ? 'New paragraph text...' : '',
      level: type === 'heading' ? 1 : undefined,
    }
    setBlocks([...blocks, newBlock])
  }

  const updateBlock = (id: string, updates: Partial<Block>) => {
    setBlocks(blocks.map(block => 
      block.id === id ? { ...block, ...updates } : block
    ))
  }

  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter(block => block.id !== id))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!site) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Site not found</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Editor Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-500 hover:text-gray-700"
              >
                ← Back
              </button>
              <h1 className="text-xl font-semibold text-gray-900">{site.name}</h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={saveContent}
                disabled={saving}
                className="btn-secondary flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save'}</span>
              </button>
              <button
                onClick={publishSite}
                className="btn-primary flex items-center space-x-2"
              >
                <Globe className="w-4 h-4" />
                <span>Publish</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="col-span-3">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Content</h3>
              <div className="space-y-2">
                <button
                  onClick={() => addBlock('heading')}
                  className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-md"
                >
                  <Type className="w-5 h-5 text-gray-400" />
                  <span>Heading</span>
                </button>
                <button
                  onClick={() => addBlock('paragraph')}
                  className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-md"
                >
                  <Layout className="w-5 h-5 text-gray-400" />
                  <span>Paragraph</span>
                </button>
                <button
                  onClick={() => addBlock('image')}
                  className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-md"
                >
                  <ImageIcon className="w-5 h-5 text-gray-400" />
                  <span>Image</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Editor */}
          <div className="col-span-9">
            <div className="bg-white rounded-lg shadow min-h-96">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {currentPage?.title || 'Untitled Page'}
                </h2>
                
                <div className="space-y-4">
                  {blocks.map((block) => (
                    <div key={block.id} className="group relative border border-transparent hover:border-gray-300 rounded-md p-4">
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => deleteBlock(block.id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Delete
                        </button>
                      </div>

                      {block.type === 'heading' && (
                        <div>
                          <select
                            value={block.level || 1}
                            onChange={(e) => updateBlock(block.id, { level: parseInt(e.target.value) })}
                            className="mb-2 text-sm border border-gray-300 rounded px-2 py-1"
                          >
                            <option value={1}>H1</option>
                            <option value={2}>H2</option>
                            <option value={3}>H3</option>
                          </select>
                          <input
                            type="text"
                            value={block.content}
                            onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                            className={`w-full border-none outline-none font-bold ${
                              block.level === 1 ? 'text-3xl' : 
                              block.level === 2 ? 'text-2xl' : 'text-xl'
                            }`}
                            placeholder="Enter heading..."
                          />
                        </div>
                      )}

                      {block.type === 'paragraph' && (
                        <textarea
                          value={block.content}
                          onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                          className="w-full border-none outline-none resize-none text-gray-700 leading-relaxed"
                          placeholder="Enter paragraph text..."
                          rows={3}
                        />
                      )}

                      {block.type === 'image' && (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                          <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                          <p className="mt-2 text-sm text-gray-500">
                            Image upload coming soon
                          </p>
                          <input
                            type="text"
                            value={block.content}
                            onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                            className="mt-2 input"
                            placeholder="Image URL (temporary)"
                          />
                        </div>
                      )}
                    </div>
                  ))}

                  {blocks.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <Layout className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2">Start building your page by adding content blocks</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}