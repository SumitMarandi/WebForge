import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/utils/supabase'
import { Plus, Globe, Edit, Trash2, ExternalLink, Sparkles, ArrowLeft, X } from 'lucide-react'
import { templates, getTemplatesByCategory, type Template } from '@/data/templates'
import TemplatePreview from '@/components/TemplatePreview'

interface Site {
  id: string
  name: string
  slug: string
  description: string | null
  is_published: boolean
  created_at: string
  updated_at: string
}

export default function DashboardPage() {
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [newSite, setNewSite] = useState({ name: '', description: '' })

  useEffect(() => {
    fetchSites()
  }, [])

  const fetchSites = async () => {
    try {
      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) throw error
      setSites(data || [])
    } catch (error) {
      console.error('Error fetching sites:', error)
    } finally {
      setLoading(false)
    }
  }

  const createSite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSite.name.trim()) return

    try {
      const slug = newSite.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('sites')
        .insert({
          name: newSite.name,
          slug,
          description: newSite.description,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) throw error

      // Use template blocks if selected, otherwise use default
      const blocks = selectedTemplate ? 
        selectedTemplate.blocks.map((block, index) => ({
          ...block,
          id: (Date.now() + index).toString(),
          content: block.content.replace(/Your Business|StartupName|Bistro Delicious|Creative Studio|My Blog/g, newSite.name)
        })) : 
        [
          {
            id: Date.now().toString(),
            type: 'heading',
            content: `Welcome to ${newSite.name}`,
            level: 1,
            style: {
              textAlign: 'left',
              fontWeight: 'bold',
              fontStyle: 'normal',
              textDecoration: 'none',
              backgroundColor: 'transparent',
              textColor: '#000000',
              padding: '8px',
              margin: '8px 0',
              fontFamily: 'inherit',
              fontSize: '2.25rem',
              lineHeight: '1.5',
              letterSpacing: 'normal'
            }
          },
          {
            id: (Date.now() + 1).toString(),
            type: 'paragraph',
            content: 'This is your new website. Start editing to make it your own!',
            style: {
              textAlign: 'left',
              fontWeight: 'normal',
              fontStyle: 'normal',
              textDecoration: 'none',
              backgroundColor: 'transparent',
              textColor: '#000000',
              padding: '8px',
              margin: '8px 0',
              fontFamily: 'inherit',
              fontSize: '1rem',
              lineHeight: '1.5',
              letterSpacing: 'normal'
            }
          }
        ]

      // Create home page with template or default content
      await supabase
        .from('pages')
        .insert({
          site_id: data.id,
          title: 'Home',
          slug: 'home',
          content: { blocks },
          is_home: true,
        })

      setNewSite({ name: '', description: '' })
      setSelectedTemplate(null)
      setShowCreateModal(false)
      setShowTemplates(false)
      fetchSites()
    } catch (error) {
      console.error('Error creating site:', error)
    }
  }

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template)
    setShowTemplates(false)
    setShowCreateModal(true)
  }

  const resetCreateFlow = () => {
    setShowCreateModal(false)
    setShowTemplates(false)
    setSelectedTemplate(null)
    setNewSite({ name: '', description: '' })
  }

  const categories = [
    { id: 'all', name: 'All Templates' },
    { id: 'business', name: 'Business' },
    { id: 'portfolio', name: 'Portfolio' },
    { id: 'blog', name: 'Blog' },
    { id: 'landing', name: 'Landing Page' },
    { id: 'ecommerce', name: 'E-commerce' }
  ]

  const filteredTemplates = selectedCategory === 'all' ? templates : getTemplatesByCategory(selectedCategory)

  const deleteSite = async (siteId: string) => {
    if (!confirm('Are you sure you want to delete this site?')) return

    try {
      const { error } = await supabase
        .from('sites')
        .delete()
        .eq('id', siteId)

      if (error) throw error
      fetchSites()
    } catch (error) {
      console.error('Error deleting site:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Websites</h1>
          <p className="text-gray-600 mt-2">Create and manage your websites</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowTemplates(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Use Template</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-secondary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Start Blank</span>
          </button>
        </div>
      </div>

      {sites.length === 0 ? (
        <div className="text-center py-12">
          <Globe className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No websites</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new website.</p>
          <div className="mt-6 flex justify-center space-x-4">
            <button
              onClick={() => setShowTemplates(true)}
              className="btn-primary flex items-center"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Use Template
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-secondary flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Start Blank
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sites.map((site) => (
            <div key={site.id} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 truncate">{site.name}</h3>
                  <div className="flex space-x-2">
                    <Link
                      to={`/editor/${site.id}`}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => deleteSite(site.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {site.description && (
                  <p className="mt-2 text-sm text-gray-500">{site.description}</p>
                )}
                <div className="mt-4 flex items-center justify-between">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    site.is_published 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {site.is_published ? 'Published' : 'Draft'}
                  </span>
                  {site.is_published && (
                    <a
                      href={`https://your-supabase-project.supabase.co/storage/v1/object/public/public-sites/${site.slug}/index.html`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Template Selection Modal */}
      {showTemplates && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-6 border max-w-6xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Choose a Template</h3>
              <button
                onClick={() => setShowTemplates(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {filteredTemplates.map((template) => (
                <TemplatePreview
                  key={template.id}
                  template={template}
                  onClick={() => handleTemplateSelect(template)}
                />
              ))}
            </div>

            <div className="mt-6 flex justify-between">
              <button
                onClick={() => setShowTemplates(false)}
                className="btn-secondary flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </button>
              <button
                onClick={() => {
                  setShowTemplates(false)
                  setShowCreateModal(true)
                }}
                className="btn-secondary"
              >
                Start Blank Instead
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Site Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedTemplate ? `Create with ${selectedTemplate.name}` : 'Create New Website'}
                </h3>
                {selectedTemplate && (
                  <button
                    onClick={() => {
                      setSelectedTemplate(null)
                      setShowTemplates(true)
                      setShowCreateModal(false)
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Change Template
                  </button>
                )}
              </div>

              {selectedTemplate && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <Sparkles className="w-4 h-4 inline mr-1" />
                    Using template: <strong>{selectedTemplate.name}</strong>
                  </p>
                  <p className="text-xs text-blue-600 mt-1">{selectedTemplate.description}</p>
                </div>
              )}

              <form onSubmit={createSite}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website Name
                  </label>
                  <input
                    type="text"
                    className="input w-full"
                    value={newSite.name}
                    onChange={(e) => setNewSite({ ...newSite, name: e.target.value })}
                    placeholder="My Awesome Website"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    className="input w-full h-20 resize-none"
                    value={newSite.description}
                    onChange={(e) => setNewSite({ ...newSite, description: e.target.value })}
                    placeholder="A brief description of your website"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={resetCreateFlow}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {selectedTemplate ? 'Create with Template' : 'Create Website'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}