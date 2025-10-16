import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/utils/supabase'
import DragTest from '@/components/DragTest'
import {
  Save, Eye, Globe, Plus, Type, Image as ImageIcon, Layout,
  List, Link2, Video, Code, Palette, Undo, Redo,
  FileText, Trash2, Copy, AlignLeft,
  AlignCenter, AlignRight, Bold, Italic, Underline,
  Smartphone, Tablet, Monitor, ChevronDown, Home,
  Edit3, X, Check, GripVertical, Menu
} from 'lucide-react'

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
  type: 'heading' | 'paragraph' | 'image' | 'list' | 'link' | 'video' | 'code' | 'divider' | 'button' | 'navigation'
  content: string
  level?: number
  style?: {
    textAlign?: 'left' | 'center' | 'right'
    fontWeight?: 'normal' | 'bold'
    fontStyle?: 'normal' | 'italic'
    textDecoration?: 'none' | 'underline'
    backgroundColor?: string
    textColor?: string
    padding?: string
    margin?: string
    fontFamily?: string
    fontSize?: string
    lineHeight?: string
    letterSpacing?: string
  }
  settings?: {
    buttonText?: string
    buttonUrl?: string
    buttonStyle?: 'primary' | 'secondary' | 'outline'
    listType?: 'bullet' | 'numbered'
    videoUrl?: string
    linkUrl?: string
    linkText?: string
    imageSize?: 'small' | 'medium' | 'large' | 'full' | 'custom'
    imageWidth?: string
    imageHeight?: string
    imageAlignment?: 'left' | 'center' | 'right'
    imageAlt?: string
    navigationItems?: Array<{
      id: string
      text: string
      url: string
      isExternal?: boolean
    }>
    navigationStyle?: 'horizontal' | 'vertical'
    navigationAlignment?: 'left' | 'center' | 'right'
    showLogo?: boolean
    logoText?: string
    logoUrl?: string
    headerBackgroundColor?: string
    headerTextColor?: string
    headerBorderColor?: string
    headerPadding?: string
    headerShadow?: boolean
    headerRounded?: boolean
    logoSize?: 'small' | 'medium' | 'large'
    menuItemSpacing?: 'tight' | 'normal' | 'loose'
    hoverColor?: string
    activeColor?: string
  }
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
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')

  const [history, setHistory] = useState<Block[][]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [previewMode, setPreviewMode] = useState(false)
  const [showPageManager, setShowPageManager] = useState(false)
  const [newPageTitle, setNewPageTitle] = useState('')
  const [editingPageId, setEditingPageId] = useState<string | null>(null)
  const [editingPageTitle, setEditingPageTitle] = useState('')
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')

  useEffect(() => {
    if (siteId) {
      fetchSiteData()
    }
  }, [siteId])

  // Helper function to ensure blocks have all required style properties
  const migrateBlockStyles = (blocks: Block[]): Block[] => {
    return blocks.map(block => ({
      ...block,
      id: block.id || Date.now().toString() + Math.random(),
      style: {
        textAlign: 'left',
        fontWeight: block.type === 'heading' ? 'bold' : 'normal',
        fontStyle: 'normal',
        textDecoration: 'none',
        backgroundColor: 'transparent',
        textColor: '#000000',
        padding: '8px',
        margin: '8px 0',
        fontFamily: 'inherit',
        fontSize: block.type === 'heading' ?
          (block.level === 1 ? '2.25rem' : block.level === 2 ? '1.875rem' : '1.5rem') : '1rem',
        lineHeight: '1.5',
        letterSpacing: 'normal',
        ...block.style // Preserve any existing styles
      }
    }))
  }

  const fetchSiteData = async () => {
    try {
      console.log('Fetching site data for ID:', siteId)

      // Fetch site info
      const { data: siteData, error: siteError } = await supabase
        .from('sites')
        .select('*')
        .eq('id', siteId)
        .single()

      if (siteError) {
        console.error('Site fetch error:', siteError)
        throw siteError
      }

      console.log('Site data:', siteData)
      setSite(siteData)

      // Fetch pages
      const { data: pagesData, error: pagesError } = await supabase
        .from('pages')
        .select('*')
        .eq('site_id', siteId)
        .order('is_home', { ascending: false })

      if (pagesError) {
        console.error('Pages fetch error:', pagesError)
        throw pagesError
      }

      console.log('Pages data:', pagesData)
      setPages(pagesData || [])

      // Set current page to home page or first page
      const homePage = pagesData?.find(p => p.is_home) || pagesData?.[0]
      if (homePage) {
        setCurrentPage(homePage)
        // Migrate blocks to ensure they have all style properties
        const migratedBlocks = migrateBlockStyles(homePage.content?.blocks || [])
        setBlocks(migratedBlocks)
      }
    } catch (error) {
      console.error('Error fetching site data:', error)
      // Set a fallback state so the page doesn't stay loading forever
      setSite(null)
      setPages([])
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
      const { error } = await supabase.functions.invoke('publish-site', {
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
      content: getDefaultContent(type),
      level: type === 'heading' ? 1 : undefined,
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
        fontSize: type === 'heading' ? '2rem' : '1rem',
        lineHeight: '1.5',
        letterSpacing: 'normal'
      },
      settings: getDefaultSettings(type)
    }
    saveToHistory()
    setBlocks([...blocks, newBlock])
    setSelectedBlockId(newBlock.id)
  }

  const getDefaultContent = (type: Block['type']): string => {
    switch (type) {
      case 'heading': return '' // Empty content for placeholder
      case 'paragraph': return '' // Empty content for placeholder
      case 'list': return 'List item 1\nList item 2\nList item 3'
      case 'link': return 'Click here'
      case 'video': return ''
      case 'code': return '// Your code here\nconsole.log("Hello World");'
      case 'divider': return ''
      case 'button': return 'Click Me'
      case 'navigation': return ''
      case 'image': return ''
      default: return ''
    }
  }

  const getDefaultSettings = (type: Block['type']) => {
    switch (type) {
      case 'button':
        return {
          buttonText: 'Click Me',
          buttonUrl: '#',
          buttonStyle: 'primary' as const
        }
      case 'list':
        return {
          listType: 'bullet' as const
        }
      case 'link':
        return {
          linkUrl: '#',
          linkText: 'Click here'
        }
      case 'video':
        return {
          videoUrl: ''
        }
      case 'image':
        return {
          imageSize: 'medium' as const,
          imageWidth: '400px',
          imageHeight: 'auto',
          imageAlignment: 'center' as const,
          imageAlt: ''
        }
      case 'navigation':
        return {
          navigationItems: [
            { id: '1', text: 'Home', url: '/', isExternal: false },
            { id: '2', text: 'About', url: '/about', isExternal: false },
            { id: '3', text: 'Services', url: '/services', isExternal: false },
            { id: '4', text: 'Contact', url: '/contact', isExternal: false }
          ],
          navigationStyle: 'horizontal' as const,
          navigationAlignment: 'center' as const,
          showLogo: true,
          logoText: 'Your Logo',
          logoUrl: '/',
          headerBackgroundColor: '#ffffff',
          headerTextColor: '#374151',
          headerBorderColor: '#e5e7eb',
          headerPadding: '16px',
          headerShadow: true,
          headerRounded: true,
          logoSize: 'medium' as const,
          menuItemSpacing: 'normal' as const,
          hoverColor: '#2563eb',
          activeColor: '#1d4ed8'
        }
      default:
        return {}
    }
  }

  const saveToHistory = () => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push([...blocks])
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setBlocks([...history[historyIndex - 1]])
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setBlocks([...history[historyIndex + 1]])
    }
  }

  const duplicateBlock = (id: string) => {
    const blockToDuplicate = blocks.find(block => block.id === id)
    if (blockToDuplicate) {
      const newBlock = {
        ...blockToDuplicate,
        id: Date.now().toString()
      }
      const blockIndex = blocks.findIndex(block => block.id === id)
      const newBlocks = [...blocks]
      newBlocks.splice(blockIndex + 1, 0, newBlock)
      saveToHistory()
      setBlocks(newBlocks)
    }
  }

  const moveBlock = (id: string, direction: 'up' | 'down') => {
    const blockIndex = blocks.findIndex(block => block.id === id)
    if (
      (direction === 'up' && blockIndex > 0) ||
      (direction === 'down' && blockIndex < blocks.length - 1)
    ) {
      const newBlocks = [...blocks]
      const targetIndex = direction === 'up' ? blockIndex - 1 : blockIndex + 1
        ;[newBlocks[blockIndex], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[blockIndex]]
      saveToHistory()
      setBlocks(newBlocks)
    }
  }

  // Drag and Drop Functions
  const handleDragStart = (e: React.DragEvent, blockId: string) => {
    console.log('🎯 Drag started for block:', blockId)
    console.log('🎯 Event type:', e.type)
    console.log('🎯 DataTransfer available:', !!e.dataTransfer)
    console.log('🎯 Current blocks:', blocks.map(b => b.id))
    
    // Ensure we have a valid block
    const block = blocks.find(b => b.id === blockId)
    if (!block) {
      console.error('❌ Block not found:', blockId)
      return
    }
    
    setDraggedBlockId(blockId)
    
    // Set up data transfer
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/plain', blockId)
      e.dataTransfer.setData('application/json', JSON.stringify({ blockId, type: 'block-reorder' }))
    }

    // Add visual feedback - simplified version
    try {
      const dragImage = document.createElement('div')
      dragImage.textContent = `Moving ${block.type} block`
      dragImage.style.cssText = `
        position: absolute;
        top: -1000px;
        left: -1000px;
        padding: 8px 12px;
        background: #3b82f6;
        color: white;
        border-radius: 6px;
        font-size: 14px;
        z-index: 9999;
        pointer-events: none;
      `
      document.body.appendChild(dragImage)
      e.dataTransfer.setDragImage(dragImage, 50, 25)
      
      // Clean up drag image
      requestAnimationFrame(() => {
        if (document.body.contains(dragImage)) {
          document.body.removeChild(dragImage)
        }
      })
    } catch (error) {
      console.error('Error setting drag image:', error)
    }
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Check if this is our block drag operation
    const data = e.dataTransfer.getData('text/plain')
    const isBlockDrag = draggedBlockId && data === draggedBlockId
    
    if (isBlockDrag) {
      e.dataTransfer.dropEffect = 'move'
      console.log('🎯 Drag over index:', index, 'dragged block:', draggedBlockId)
      setDragOverIndex(index)
    } else {
      e.dataTransfer.dropEffect = 'none'
      console.log('⚠️ Drag over but invalid drag operation')
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if we're actually leaving the drop zone
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverIndex(null)
    }
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    e.stopPropagation()

    console.log('🎯 Drop at index:', dropIndex, 'dragged block:', draggedBlockId)
    console.log('🎯 Current blocks count:', blocks.length)

    // Validate the drop operation
    const droppedData = e.dataTransfer.getData('text/plain')
    if (!draggedBlockId || droppedData !== draggedBlockId) {
      console.log('❌ Invalid drop operation')
      setDraggedBlockId(null)
      setDragOverIndex(null)
      return
    }

    const draggedIndex = blocks.findIndex(block => block.id === draggedBlockId)
    if (draggedIndex === -1) {
      console.log('❌ Dragged block not found')
      setDraggedBlockId(null)
      setDragOverIndex(null)
      return
    }

    console.log('🎯 Dragged from index:', draggedIndex, 'to index:', dropIndex)

    // Don't do anything if dropping in the same position
    if (draggedIndex === dropIndex || (draggedIndex === dropIndex - 1 && dropIndex !== blocks.length)) {
      console.log('⚠️ Dropping in same position, ignoring')
      setDraggedBlockId(null)
      setDragOverIndex(null)
      return
    }

    try {
      const newBlocks = [...blocks]
      const draggedBlock = newBlocks[draggedIndex]

      // Remove the dragged block
      newBlocks.splice(draggedIndex, 1)

      // Calculate the correct insertion index
      let insertIndex = dropIndex
      if (draggedIndex < dropIndex) {
        insertIndex = dropIndex - 1
      }

      // Ensure insertIndex is within bounds
      insertIndex = Math.max(0, Math.min(insertIndex, newBlocks.length))

      // Insert at new position
      newBlocks.splice(insertIndex, 0, draggedBlock)

      console.log('✅ Reordered blocks:', newBlocks.map(b => `${b.type}-${b.id.slice(-4)}`))

      saveToHistory()
      setBlocks(newBlocks)
    } catch (error) {
      console.error('❌ Error during drop operation:', error)
    } finally {
      setDraggedBlockId(null)
      setDragOverIndex(null)
    }
  }

  const handleDragEnd = () => {
    console.log('Drag ended')
    setDraggedBlockId(null)
    setDragOverIndex(null)
  }

  // Render block for preview mode (no editing controls)
  const renderPreviewBlock = (block: Block) => {
    const blockStyle = {
      textAlign: block.style?.textAlign || 'left',
      fontWeight: block.style?.fontWeight || 'normal',
      fontStyle: block.style?.fontStyle || 'normal',
      textDecoration: block.style?.textDecoration || 'none',
      backgroundColor: block.style?.backgroundColor || 'transparent',
      color: block.style?.textColor || '#000000',
      padding: block.style?.padding || '8px',
      margin: block.style?.margin || '8px 0',
      fontFamily: block.style?.fontFamily || 'inherit',
      fontSize: block.style?.fontSize || (block.type === 'heading' ?
        (block.level === 1 ? '2.25rem' : block.level === 2 ? '1.875rem' : '1.5rem') : '1rem'),
      lineHeight: block.style?.lineHeight || '1.5',
      letterSpacing: block.style?.letterSpacing || 'normal'
    }

    switch (block.type) {
      case 'heading':
        return (
          <div style={blockStyle} className="font-bold">
            {block.content || 'Untitled Heading'}
          </div>
        )

      case 'paragraph':
        return (
          <div style={blockStyle} className="leading-relaxed">
            {block.content || 'Empty paragraph'}
          </div>
        )

      case 'image':
        if (!block.content) return null
        const imageSize = {
          small: { width: '200px', height: 'auto' },
          medium: { width: '400px', height: 'auto' },
          large: { width: '600px', height: 'auto' },
          full: { width: '100%', height: 'auto' },
          custom: {
            width: block.settings?.imageWidth || '400px',
            height: block.settings?.imageHeight || 'auto'
          }
        }[block.settings?.imageSize || 'medium']

        return (
          <div style={blockStyle} className={`flex ${block.settings?.imageAlignment === 'left' ? 'justify-start' :
            block.settings?.imageAlignment === 'right' ? 'justify-end' : 'justify-center'
            }`}>
            <img
              src={block.content}
              alt={block.settings?.imageAlt || "Image"}
              className="rounded-lg shadow-sm border border-gray-200"
              style={{
                ...imageSize,
                maxWidth: '100%',
                objectFit: 'cover'
              }}
            />
          </div>
        )

      case 'button':
        return (
          <div style={blockStyle} className={`flex ${block.style?.textAlign === 'left' ? 'justify-start' :
            block.style?.textAlign === 'right' ? 'justify-end' : 'justify-center'
            }`}>
            <a
              href={block.settings?.buttonUrl || '#'}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${block.settings?.buttonStyle === 'primary' ? 'bg-blue-600 text-white hover:bg-blue-700' :
                block.settings?.buttonStyle === 'secondary' ? 'bg-gray-600 text-white hover:bg-gray-700' :
                  'border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
                }`}
              target={block.settings?.buttonUrl?.startsWith('http') ? '_blank' : '_self'}
              rel={block.settings?.buttonUrl?.startsWith('http') ? 'noopener noreferrer' : undefined}
            >
              {block.settings?.buttonText || block.content || 'Button'}
            </a>
          </div>
        )

      case 'navigation':
        const navStyles = {
          backgroundColor: block.settings?.headerBackgroundColor || '#ffffff',
          color: block.settings?.headerTextColor || '#374151',
          borderColor: block.settings?.headerBorderColor || '#e5e7eb',
          padding: block.settings?.headerPadding || '16px',
          borderRadius: block.settings?.headerRounded ? '8px' : '0px',
          boxShadow: block.settings?.headerShadow ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
        }

        const logoSizeClass = {
          small: 'text-lg',
          medium: 'text-xl',
          large: 'text-2xl'
        }[block.settings?.logoSize || 'medium']

        const menuSpacingClass = {
          tight: block.settings?.navigationStyle === 'vertical' ? 'space-y-1' : 'space-x-3',
          normal: block.settings?.navigationStyle === 'vertical' ? 'space-y-2' : 'space-x-6',
          loose: block.settings?.navigationStyle === 'vertical' ? 'space-y-4' : 'space-x-8'
        }[block.settings?.menuItemSpacing || 'normal']

        return (
          <nav
            className={`${block.settings?.navigationStyle === 'vertical' ? 'flex-col' : 'flex-row'
              } flex items-center justify-${block.settings?.navigationAlignment === 'left' ? 'start' :
                block.settings?.navigationAlignment === 'right' ? 'end' : 'center'
              } border`}
            style={navStyles}
          >
            {block.settings?.showLogo && (
              <div
                className={`${block.settings?.navigationStyle === 'vertical' ? 'mb-4' : 'mr-6'
                  } font-bold ${logoSizeClass}`}
                style={{ color: block.settings?.headerTextColor || '#374151' }}
              >
                {block.settings?.logoText || 'Your Logo'}
              </div>
            )}
            <div className={`${block.settings?.navigationStyle === 'vertical' ? 'flex-col' : 'flex-row'
              } flex ${menuSpacingClass}`}>
              {(block.settings?.navigationItems || []).map((item) => (
                <a
                  key={item.id}
                  href={item.url}
                  className="transition-colors font-medium hover:opacity-80"
                  style={{
                    color: block.settings?.headerTextColor || '#374151',
                    textDecoration: 'none'
                  }}
                  target={item.isExternal ? '_blank' : '_self'}
                  rel={item.isExternal ? 'noopener noreferrer' : undefined}
                >
                  {item.text}
                </a>
              ))}
            </div>
          </nav>
        )

      case 'list':
        return (
          <div style={blockStyle}>
            {block.settings?.listType === 'numbered' ? (
              <ol className="list-decimal list-inside space-y-1">
                {block.content.split('\n').filter(item => item.trim()).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ol>
            ) : (
              <ul className="list-disc list-inside space-y-1">
                {block.content.split('\n').filter(item => item.trim()).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        )

      case 'link':
        return (
          <div style={blockStyle}>
            <a
              href={block.settings?.linkUrl || '#'}
              className="text-blue-600 hover:text-blue-800 underline"
              target={block.settings?.linkUrl?.startsWith('http') ? '_blank' : '_self'}
              rel={block.settings?.linkUrl?.startsWith('http') ? 'noopener noreferrer' : undefined}
            >
              {block.settings?.linkText || block.content || 'Link'}
            </a>
          </div>
        )

      case 'video':
        const getEmbedUrl = (url: string) => {
          if (!url) return null
          const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
          const youtubeMatch = url.match(youtubeRegex)
          if (youtubeMatch) {
            return `https://www.youtube.com/embed/${youtubeMatch[1]}?rel=0&modestbranding=1`
          }
          const vimeoRegex = /(?:vimeo\.com\/)([0-9]+)/
          const vimeoMatch = url.match(vimeoRegex)
          if (vimeoMatch) {
            return `https://player.vimeo.com/video/${vimeoMatch[1]}`
          }
          if (url.includes('embed') || url.includes('player')) {
            return url
          }
          return null
        }

        const embedUrl = getEmbedUrl(block.settings?.videoUrl || '')
        if (!embedUrl) return null

        return (
          <div style={blockStyle}>
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <iframe
                src={embedUrl}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Video Player"
              />
            </div>
          </div>
        )

      case 'code':
        return (
          <div style={blockStyle}>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
              <code>{block.content}</code>
            </pre>
          </div>
        )

      case 'divider':
        return (
          <div style={blockStyle}>
            <hr className="border-t-2 border-gray-300 my-4" />
          </div>
        )

      default:
        return null
    }
  }

  const updateBlock = (id: string, updates: Partial<Block>) => {
    setBlocks(blocks.map(block =>
      block.id === id ? { ...block, ...updates } : block
    ))
  }

  const updateBlockStyle = (id: string, styleUpdates: Partial<Block['style']>) => {
    setBlocks(blocks.map(block =>
      block.id === id ? {
        ...block,
        style: { ...block.style, ...styleUpdates }
      } : block
    ))
  }

  const updateBlockSettings = (id: string, settingsUpdates: Partial<Block['settings']>) => {
    setBlocks(blocks.map(block =>
      block.id === id ? {
        ...block,
        settings: { ...block.settings, ...settingsUpdates }
      } : block
    ))
  }

  const deleteBlock = (id: string) => {
    saveToHistory()
    setBlocks(blocks.filter(block => block.id !== id))
    setSelectedBlockId(null)
  }

  const createNewPage = async () => {
    if (!newPageTitle.trim() || !site) return

    try {
      const slug = newPageTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

      const { data, error } = await supabase
        .from('pages')
        .insert({
          site_id: site.id,
          title: newPageTitle,
          slug,
          content: {
            blocks: [
              {
                id: Date.now().toString(),
                type: 'heading',
                content: newPageTitle,
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
              }
            ]
          },
          is_home: false,
        })
        .select()
        .single()

      if (error) throw error

      // Refresh pages list
      await fetchSiteData()

      // Switch to the new page
      setCurrentPage(data)
      setBlocks(data.content?.blocks || [])
      setNewPageTitle('')
      setShowPageManager(false)
    } catch (error) {
      console.error('Error creating page:', error)
    }
  }

  const switchToPage = async (page: Page) => {
    // Save current page content before switching
    if (currentPage) {
      await saveContent()
    }

    setCurrentPage(page)
    // Migrate blocks to ensure they have all style properties
    const migratedBlocks = migrateBlockStyles(page.content?.blocks || [])
    setBlocks(migratedBlocks)
    setSelectedBlockId(null)
  }

  const updatePageTitle = async (pageId: string, newTitle: string) => {
    if (!newTitle.trim()) return

    try {
      const newSlug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

      const { error } = await supabase
        .from('pages')
        .update({
          title: newTitle,
          slug: newSlug,
          updated_at: new Date().toISOString(),
        })
        .eq('id', pageId)

      if (error) throw error

      // Update local state
      setPages(pages.map(page =>
        page.id === pageId
          ? { ...page, title: newTitle, slug: newSlug }
          : page
      ))

      if (currentPage?.id === pageId) {
        setCurrentPage({ ...currentPage, title: newTitle, slug: newSlug })
      }

      setEditingPageId(null)
      setEditingPageTitle('')
    } catch (error) {
      console.error('Error updating page title:', error)
    }
  }

  const deletePage = async (pageId: string) => {
    if (pages.length <= 1) {
      alert('Cannot delete the last page')
      return
    }

    if (!confirm('Are you sure you want to delete this page?')) return

    try {
      const { error } = await supabase
        .from('pages')
        .delete()
        .eq('id', pageId)

      if (error) throw error

      // If we're deleting the current page, switch to another page
      if (currentPage?.id === pageId) {
        const remainingPages = pages.filter(p => p.id !== pageId)
        const nextPage = remainingPages.find(p => p.is_home) || remainingPages[0]
        setCurrentPage(nextPage)
        setBlocks(nextPage.content?.blocks || [])
      }

      // Update pages list
      setPages(pages.filter(p => p.id !== pageId))
    } catch (error) {
      console.error('Error deleting page:', error)
    }
  }

  const renderBlock = (block: Block) => {
    const isSelected = selectedBlockId === block.id
    const blockStyle = {
      textAlign: block.style?.textAlign || 'left',
      fontWeight: block.style?.fontWeight || 'normal',
      fontStyle: block.style?.fontStyle || 'normal',
      textDecoration: block.style?.textDecoration || 'none',
      backgroundColor: block.style?.backgroundColor || 'transparent',
      color: block.style?.textColor || '#000000',
      padding: block.style?.padding || '8px',
      margin: block.style?.margin || '8px 0',
      fontFamily: block.style?.fontFamily || 'inherit',
      fontSize: block.style?.fontSize || (block.type === 'heading' ?
        (block.level === 1 ? '2.25rem' : block.level === 2 ? '1.875rem' : '1.5rem') : '1rem'),
      lineHeight: block.style?.lineHeight || '1.5',
      letterSpacing: block.style?.letterSpacing || 'normal'
    }

    const commonProps = {
      style: blockStyle,
      className: `w-full border-none outline-none resize-none ${isSelected ? 'ring-2 ring-blue-500' : ''}`,
      onClick: () => setSelectedBlockId(block.id)
    }

    switch (block.type) {
      case 'heading':
        return (
          <div>
            {/* Font preview info */}
            {selectedBlockId === block.id && (
              <div className="mb-2 text-xs text-gray-500 bg-gray-100 p-2 rounded">
                Font: {block.style?.fontFamily || 'Default'} |
                Size: {block.style?.fontSize || 'Auto'} |
                Weight: {block.style?.fontWeight || 'Normal'}
              </div>
            )}
            <input
              {...commonProps}
              type="text"
              value={block.content}
              onChange={(e) => updateBlock(block.id, { content: e.target.value })}
              className={`${commonProps.className} ${!block.content ? 'text-gray-400' : ''}`}
              style={{
                ...blockStyle,
                fontWeight: block.style?.fontWeight || (block.level === 1 ? 'bold' : 'normal')
              }}
              placeholder={
                block.level === 1 ? "Main heading - grab attention with your key message" :
                  block.level === 2 ? "Section heading - organize your content" :
                    "Sub-heading - add structure to your page"
              }
            />
          </div>
        )

      case 'paragraph':
        return (
          <div>
            {/* Font preview info */}
            {selectedBlockId === block.id && (
              <div className="mb-2 text-xs text-gray-500 bg-gray-100 p-2 rounded">
                Font: {block.style?.fontFamily || 'Default'} |
                Size: {block.style?.fontSize || 'Auto'} |
                Line Height: {block.style?.lineHeight || '1.5'}
              </div>
            )}
            <textarea
              {...commonProps}
              value={block.content}
              onChange={(e) => updateBlock(block.id, { content: e.target.value })}
              className={`${commonProps.className} min-h-[80px] ${!block.content ? 'text-gray-400' : ''}`}
              style={blockStyle}
              placeholder="Start typing your paragraph here... You can write about your business, services, or any content you'd like to share with your visitors."
              rows={3}
            />
          </div>
        )

      case 'list':
        return (
          <div style={blockStyle} onClick={() => setSelectedBlockId(block.id)}>
            {block.settings?.listType === 'numbered' ? (
              <ol className="list-decimal list-inside space-y-1">
                {block.content.split('\n').map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ol>
            ) : (
              <ul className="list-disc list-inside space-y-1">
                {block.content.split('\n').map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            )}
            <textarea
              value={block.content}
              onChange={(e) => updateBlock(block.id, { content: e.target.value })}
              className="w-full mt-2 p-2 border border-gray-300 rounded"
              placeholder="Enter list items (one per line)&#10;• First item&#10;• Second item&#10;• Third item"
              rows={3}
            />
          </div>
        )

      case 'button':
        return (
          <div style={blockStyle} onClick={() => setSelectedBlockId(block.id)}>
            <button
              className={`px-6 py-3 rounded-lg font-medium ${block.settings?.buttonStyle === 'primary' ? 'bg-blue-600 text-white hover:bg-blue-700' :
                block.settings?.buttonStyle === 'secondary' ? 'bg-gray-600 text-white hover:bg-gray-700' :
                  'border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
                }`}
            >
              {block.settings?.buttonText || block.content}
            </button>
            <div className="mt-2 space-y-2">
              <input
                type="text"
                value={block.settings?.buttonText || ''}
                onChange={(e) => updateBlockSettings(block.id, { buttonText: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Button text (e.g., Get Started, Learn More, Contact Us)"
              />
              <input
                type="url"
                value={block.settings?.buttonUrl || ''}
                onChange={(e) => updateBlockSettings(block.id, { buttonUrl: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Button URL (e.g., https://example.com, /contact, #section)"
              />
            </div>
          </div>
        )

      case 'link':
        return (
          <div style={blockStyle} onClick={() => setSelectedBlockId(block.id)}>
            <a
              href={block.settings?.linkUrl || '#'}
              className="text-blue-600 hover:text-blue-800 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {block.settings?.linkText || block.content}
            </a>
            <div className="mt-2 space-y-2">
              <input
                type="text"
                value={block.settings?.linkText || ''}
                onChange={(e) => updateBlockSettings(block.id, { linkText: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Link text (e.g., Visit our website, Read more, Download)"
              />
              <input
                type="url"
                value={block.settings?.linkUrl || ''}
                onChange={(e) => updateBlockSettings(block.id, { linkUrl: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Link URL"
              />
            </div>
          </div>
        )

      case 'video':
        const getEmbedUrl = (url: string) => {
          if (!url) return null

          // YouTube URL patterns
          const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
          const youtubeMatch = url.match(youtubeRegex)
          if (youtubeMatch) {
            return `https://www.youtube.com/embed/${youtubeMatch[1]}?rel=0&modestbranding=1`
          }

          // Vimeo URL patterns
          const vimeoRegex = /(?:vimeo\.com\/)([0-9]+)/
          const vimeoMatch = url.match(vimeoRegex)
          if (vimeoMatch) {
            return `https://player.vimeo.com/video/${vimeoMatch[1]}`
          }

          // If it's already an embed URL, use it
          if (url.includes('embed') || url.includes('player')) {
            return url
          }

          return null
        }

        const embedUrl = getEmbedUrl(block.settings?.videoUrl || '')

        return (
          <div style={blockStyle} onClick={() => setSelectedBlockId(block.id)}>
            {embedUrl ? (
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <iframe
                  src={embedUrl}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Video Player"
                />
              </div>
            ) : block.settings?.videoUrl ? (
              <div className="aspect-video bg-red-50 border-2 border-red-200 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Video className="mx-auto h-12 w-12 text-red-400 mb-2" />
                  <p className="text-red-600 text-sm font-medium">Invalid video URL</p>
                  <p className="text-red-500 text-xs mt-1">Please use a YouTube or Vimeo link</p>
                </div>
              </div>
            ) : (
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <Video className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-gray-500 text-sm font-medium">Add a video</p>
                  <p className="text-gray-400 text-xs mt-1">Paste a YouTube or Vimeo URL below</p>
                </div>
              </div>
            )}
            <div className="mt-3 space-y-2">
              <input
                type="url"
                value={block.settings?.videoUrl || ''}
                onChange={(e) => updateBlockSettings(block.id, { videoUrl: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Paste YouTube or Vimeo URL here..."
              />
              {block.settings?.videoUrl && !embedUrl && (
                <div className="text-xs text-gray-500">
                  <p className="font-medium mb-1">Supported formats:</p>
                  <ul className="space-y-1">
                    <li>• https://www.youtube.com/watch?v=VIDEO_ID</li>
                    <li>• https://youtu.be/VIDEO_ID</li>
                    <li>• https://vimeo.com/VIDEO_ID</li>
                  </ul>
                </div>
              )}
              {embedUrl && (
                <div className="flex items-center text-xs text-green-600 bg-green-50 p-2 rounded">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Video loaded successfully
                </div>
              )}
            </div>
          </div>
        )

      case 'code':
        return (
          <div style={blockStyle} onClick={() => setSelectedBlockId(block.id)}>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
              <code>{block.content}</code>
            </pre>
            <textarea
              value={block.content}
              onChange={(e) => updateBlock(block.id, { content: e.target.value })}
              className="w-full mt-2 p-2 border border-gray-300 rounded font-mono text-sm"
              placeholder="Enter your code here...&#10;&#10;Examples:&#10;• HTML: <div>Hello World</div>&#10;• CSS: .class { color: blue; }&#10;• JavaScript: console.log('Hello');"
              rows={4}
            />
          </div>
        )

      case 'divider':
        return (
          <div style={blockStyle} onClick={() => setSelectedBlockId(block.id)}>
            <hr className="border-t-2 border-gray-300 my-4" />
          </div>
        )

      case 'image':
        const getImageSize = () => {
          const size = block.settings?.imageSize || 'medium'
          switch (size) {
            case 'small': return { width: '200px', height: 'auto' }
            case 'medium': return { width: '400px', height: 'auto' }
            case 'large': return { width: '600px', height: 'auto' }
            case 'full': return { width: '100%', height: 'auto' }
            case 'custom': return {
              width: block.settings?.imageWidth || '400px',
              height: block.settings?.imageHeight || 'auto'
            }
            default: return { width: '400px', height: 'auto' }
          }
        }

        const imageSize = getImageSize()
        const alignment = block.settings?.imageAlignment || 'center'

        return (
          <div style={blockStyle} onClick={() => setSelectedBlockId(block.id)} data-block-id={block.id}>
            <div className={`flex ${alignment === 'left' ? 'justify-start' :
              alignment === 'right' ? 'justify-end' : 'justify-center'
              }`}>
              {block.content ? (
                <img
                  src={block.content}
                  alt={block.settings?.imageAlt || "Image"}
                  className="rounded-lg shadow-sm border border-gray-200"
                  style={{
                    width: imageSize.width,
                    height: imageSize.height,
                    maxWidth: '100%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50"
                  style={{
                    width: imageSize.width,
                    maxWidth: '100%',
                    minHeight: '200px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 font-medium">Add an image</p>
                  <p className="text-xs text-gray-400 mt-1">Size: {block.settings?.imageSize || 'medium'}</p>
                </div>
              )}
            </div>

            <div className="mt-3 space-y-3">
              {/* Image URL Input */}
              <input
                type="url"
                value={block.content}
                onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Image URL (e.g., https://example.com/image.jpg or upload to a service like Imgur)"
              />

              {/* Image Controls */}
              <div className="grid grid-cols-2 gap-3">
                {/* Size Selection */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Size</label>
                  <select
                    value={block.settings?.imageSize || 'medium'}
                    onChange={(e) => updateBlockSettings(block.id, { imageSize: e.target.value as any })}
                    className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="small">Small (200px)</option>
                    <option value="medium">Medium (400px)</option>
                    <option value="large">Large (600px)</option>
                    <option value="full">Full Width</option>
                    <option value="custom">Custom Size</option>
                  </select>
                </div>

                {/* Alignment */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Alignment</label>
                  <select
                    value={block.settings?.imageAlignment || 'center'}
                    onChange={(e) => updateBlockSettings(block.id, { imageAlignment: e.target.value as any })}
                    className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
              </div>

              {/* Custom Size Inputs */}
              {block.settings?.imageSize === 'custom' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Width</label>
                    <input
                      type="text"
                      value={block.settings?.imageWidth || '400px'}
                      onChange={(e) => updateBlockSettings(block.id, { imageWidth: e.target.value })}
                      className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 300px, 50%, auto"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Height</label>
                    <input
                      type="text"
                      value={block.settings?.imageHeight || 'auto'}
                      onChange={(e) => updateBlockSettings(block.id, { imageHeight: e.target.value })}
                      className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 200px, auto"
                    />
                  </div>
                </div>
              )}

              {/* Alt Text */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Alt Text (for accessibility)</label>
                <input
                  type="text"
                  value={block.settings?.imageAlt || ''}
                  onChange={(e) => updateBlockSettings(block.id, { imageAlt: e.target.value })}
                  className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe the image for screen readers"
                />
              </div>

              {/* Quick Size Buttons */}
              <div className="flex space-x-2">
                <span className="text-xs text-gray-500 self-center">Quick resize:</span>
                {['small', 'medium', 'large', 'full'].map((size) => (
                  <button
                    key={size}
                    onClick={() => updateBlockSettings(block.id, { imageSize: size as any })}
                    className={`px-2 py-1 text-xs rounded transition-colors ${block.settings?.imageSize === size
                      ? 'bg-blue-100 text-blue-700 border border-blue-300'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
                      }`}
                  >
                    {size.charAt(0).toUpperCase() + size.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )

      case 'navigation':
        const navStyles = {
          backgroundColor: block.settings?.headerBackgroundColor || '#ffffff',
          color: block.settings?.headerTextColor || '#374151',
          borderColor: block.settings?.headerBorderColor || '#e5e7eb',
          padding: block.settings?.headerPadding || '16px',
          borderRadius: block.settings?.headerRounded ? '8px' : '0px',
          boxShadow: block.settings?.headerShadow ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
        }

        const logoSizeClass = {
          small: 'text-lg',
          medium: 'text-xl',
          large: 'text-2xl'
        }[block.settings?.logoSize || 'medium']

        const menuSpacingClass = {
          tight: block.settings?.navigationStyle === 'vertical' ? 'space-y-1' : 'space-x-3',
          normal: block.settings?.navigationStyle === 'vertical' ? 'space-y-2' : 'space-x-6',
          loose: block.settings?.navigationStyle === 'vertical' ? 'space-y-4' : 'space-x-8'
        }[block.settings?.menuItemSpacing || 'normal']

        return (
          <div style={blockStyle} onClick={() => setSelectedBlockId(block.id)}>
            <nav
              className={`${block.settings?.navigationStyle === 'vertical' ? 'flex-col' : 'flex-row'
                } flex items-center justify-${block.settings?.navigationAlignment === 'left' ? 'start' :
                  block.settings?.navigationAlignment === 'right' ? 'end' : 'center'
                } border`}
              style={navStyles}
            >

              {/* Logo */}
              {block.settings?.showLogo && (
                <div
                  className={`${block.settings?.navigationStyle === 'vertical' ? 'mb-4' : 'mr-6'
                    } font-bold ${logoSizeClass}`}
                  style={{ color: block.settings?.headerTextColor || '#374151' }}
                >
                  {block.settings?.logoText || 'Your Logo'}
                </div>
              )}

              {/* Navigation Items */}
              <div className={`${block.settings?.navigationStyle === 'vertical' ? 'flex-col' : 'flex-row'
                } flex ${menuSpacingClass}`}>
                {(block.settings?.navigationItems || []).map((item) => (
                  <a
                    key={item.id}
                    href={item.url}
                    className="transition-colors font-medium"
                    style={{
                      color: block.settings?.headerTextColor || '#374151',
                      textDecoration: 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = block.settings?.hoverColor || '#2563eb'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = block.settings?.headerTextColor || '#374151'
                    }}
                    target={item.isExternal ? '_blank' : '_self'}
                    rel={item.isExternal ? 'noopener noreferrer' : undefined}
                  >
                    {item.text}
                  </a>
                ))}
              </div>
            </nav>

            {/* Navigation Editor */}
            <div className="mt-4 space-y-4 bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900">Navigation Settings</h4>

              {/* Logo Settings */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={block.settings?.showLogo || false}
                      onChange={(e) => updateBlockSettings(block.id, { showLogo: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm">Show Logo</span>
                  </label>
                </div>
                {block.settings?.showLogo && (
                  <input
                    type="text"
                    value={block.settings?.logoText || ''}
                    onChange={(e) => updateBlockSettings(block.id, { logoText: e.target.value })}
                    className="p-2 border border-gray-300 rounded text-sm"
                    placeholder="Logo text"
                  />
                )}
              </div>

              {/* Style Settings */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Style</label>
                  <select
                    value={block.settings?.navigationStyle || 'horizontal'}
                    onChange={(e) => updateBlockSettings(block.id, { navigationStyle: e.target.value as any })}
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                  >
                    <option value="horizontal">Horizontal</option>
                    <option value="vertical">Vertical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alignment</label>
                  <select
                    value={block.settings?.navigationAlignment || 'center'}
                    onChange={(e) => updateBlockSettings(block.id, { navigationAlignment: e.target.value as any })}
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
              </div>

              {/* Header Appearance */}
              <div className="border-t border-gray-200 pt-4">
                <h5 className="font-medium text-gray-900 mb-3">Header Appearance</h5>

                {/* Colors */}
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Background</label>
                    <input
                      type="color"
                      value={block.settings?.headerBackgroundColor || '#ffffff'}
                      onChange={(e) => updateBlockSettings(block.id, { headerBackgroundColor: e.target.value })}
                      className="w-full h-8 rounded border border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Text Color</label>
                    <input
                      type="color"
                      value={block.settings?.headerTextColor || '#374151'}
                      onChange={(e) => updateBlockSettings(block.id, { headerTextColor: e.target.value })}
                      className="w-full h-8 rounded border border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Border</label>
                    <input
                      type="color"
                      value={block.settings?.headerBorderColor || '#e5e7eb'}
                      onChange={(e) => updateBlockSettings(block.id, { headerBorderColor: e.target.value })}
                      className="w-full h-8 rounded border border-gray-300"
                    />
                  </div>
                </div>

                {/* Hover & Active Colors */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Hover Color</label>
                    <input
                      type="color"
                      value={block.settings?.hoverColor || '#2563eb'}
                      onChange={(e) => updateBlockSettings(block.id, { hoverColor: e.target.value })}
                      className="w-full h-8 rounded border border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Active Color</label>
                    <input
                      type="color"
                      value={block.settings?.activeColor || '#1d4ed8'}
                      onChange={(e) => updateBlockSettings(block.id, { activeColor: e.target.value })}
                      className="w-full h-8 rounded border border-gray-300"
                    />
                  </div>
                </div>

                {/* Spacing & Size */}
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Padding</label>
                    <select
                      value={block.settings?.headerPadding || '16px'}
                      onChange={(e) => updateBlockSettings(block.id, { headerPadding: e.target.value })}
                      className="w-full p-1 text-xs border border-gray-300 rounded"
                    >
                      <option value="8px">Small</option>
                      <option value="16px">Medium</option>
                      <option value="24px">Large</option>
                      <option value="32px">Extra Large</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Logo Size</label>
                    <select
                      value={block.settings?.logoSize || 'medium'}
                      onChange={(e) => updateBlockSettings(block.id, { logoSize: e.target.value as any })}
                      className="w-full p-1 text-xs border border-gray-300 rounded"
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Menu Spacing</label>
                    <select
                      value={block.settings?.menuItemSpacing || 'normal'}
                      onChange={(e) => updateBlockSettings(block.id, { menuItemSpacing: e.target.value as any })}
                      className="w-full p-1 text-xs border border-gray-300 rounded"
                    >
                      <option value="tight">Tight</option>
                      <option value="normal">Normal</option>
                      <option value="loose">Loose</option>
                    </select>
                  </div>
                </div>

                {/* Style Options */}
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={block.settings?.headerShadow || false}
                      onChange={(e) => updateBlockSettings(block.id, { headerShadow: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-xs">Drop Shadow</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={block.settings?.headerRounded || false}
                      onChange={(e) => updateBlockSettings(block.id, { headerRounded: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-xs">Rounded Corners</span>
                  </label>
                </div>
              </div>

              {/* Header Style Presets */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Header Style Presets</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => updateBlockSettings(block.id, {
                      headerBackgroundColor: '#ffffff',
                      headerTextColor: '#374151',
                      headerBorderColor: '#e5e7eb',
                      hoverColor: '#2563eb',
                      headerShadow: true,
                      headerRounded: true
                    })}
                    className="p-2 text-xs border border-gray-300 rounded hover:bg-gray-50 text-left"
                  >
                    Clean White
                  </button>
                  <button
                    onClick={() => updateBlockSettings(block.id, {
                      headerBackgroundColor: '#1f2937',
                      headerTextColor: '#ffffff',
                      headerBorderColor: '#374151',
                      hoverColor: '#60a5fa',
                      headerShadow: true,
                      headerRounded: false
                    })}
                    className="p-2 text-xs border border-gray-300 rounded hover:bg-gray-50 text-left"
                  >
                    Dark Theme
                  </button>
                  <button
                    onClick={() => updateBlockSettings(block.id, {
                      headerBackgroundColor: '#2563eb',
                      headerTextColor: '#ffffff',
                      headerBorderColor: '#1d4ed8',
                      hoverColor: '#93c5fd',
                      headerShadow: true,
                      headerRounded: true
                    })}
                    className="p-2 text-xs border border-gray-300 rounded hover:bg-gray-50 text-left"
                  >
                    Blue Brand
                  </button>
                  <button
                    onClick={() => updateBlockSettings(block.id, {
                      headerBackgroundColor: 'transparent',
                      headerTextColor: '#374151',
                      headerBorderColor: 'transparent',
                      hoverColor: '#2563eb',
                      headerShadow: false,
                      headerRounded: false
                    })}
                    className="p-2 text-xs border border-gray-300 rounded hover:bg-gray-50 text-left"
                  >
                    Minimal
                  </button>
                </div>
              </div>

              {/* Navigation Items */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Menu Items</label>
                  <button
                    onClick={() => {
                      const currentItems = block.settings?.navigationItems || []
                      const newItem = {
                        id: Date.now().toString(),
                        text: 'New Item',
                        url: '#',
                        isExternal: false
                      }
                      updateBlockSettings(block.id, {
                        navigationItems: [...currentItems, newItem]
                      })
                    }}
                    className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                  >
                    Add Item
                  </button>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {(block.settings?.navigationItems || []).map((item, index) => (
                    <div key={item.id} className="flex space-x-2 items-center bg-white p-2 rounded border">
                      <input
                        type="text"
                        value={item.text}
                        onChange={(e) => {
                          const items = [...(block.settings?.navigationItems || [])]
                          items[index] = { ...item, text: e.target.value }
                          updateBlockSettings(block.id, { navigationItems: items })
                        }}
                        className="flex-1 p-1 border border-gray-300 rounded text-xs"
                        placeholder="Menu text"
                      />
                      <input
                        type="text"
                        value={item.url}
                        onChange={(e) => {
                          const items = [...(block.settings?.navigationItems || [])]
                          items[index] = { ...item, url: e.target.value }
                          updateBlockSettings(block.id, { navigationItems: items })
                        }}
                        className="flex-1 p-1 border border-gray-300 rounded text-xs"
                        placeholder="URL"
                      />
                      <label className="flex items-center text-xs">
                        <input
                          type="checkbox"
                          checked={item.isExternal || false}
                          onChange={(e) => {
                            const items = [...(block.settings?.navigationItems || [])]
                            items[index] = { ...item, isExternal: e.target.checked }
                            updateBlockSettings(block.id, { navigationItems: items })
                          }}
                          className="mr-1"
                        />
                        External
                      </label>
                      <button
                        onClick={() => {
                          const items = (block.settings?.navigationItems || []).filter((_, i) => i !== index)
                          updateBlockSettings(block.id, { navigationItems: items })
                        }}
                        className="text-red-500 hover:text-red-700 text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Presets */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quick Presets</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => updateBlockSettings(block.id, {
                      navigationItems: [
                        { id: '1', text: 'Home', url: '/', isExternal: false },
                        { id: '2', text: 'About', url: '/about', isExternal: false },
                        { id: '3', text: 'Services', url: '/services', isExternal: false },
                        { id: '4', text: 'Contact', url: '/contact', isExternal: false }
                      ]
                    })}
                    className="p-2 text-xs border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Business Menu
                  </button>
                  <button
                    onClick={() => updateBlockSettings(block.id, {
                      navigationItems: [
                        { id: '1', text: 'Home', url: '/', isExternal: false },
                        { id: '2', text: 'Portfolio', url: '/portfolio', isExternal: false },
                        { id: '3', text: 'Blog', url: '/blog', isExternal: false },
                        { id: '4', text: 'Contact', url: '/contact', isExternal: false }
                      ]
                    })}
                    className="p-2 text-xs border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Portfolio Menu
                  </button>
                  <button
                    onClick={() => updateBlockSettings(block.id, {
                      navigationItems: [
                        { id: '1', text: 'Shop', url: '/shop', isExternal: false },
                        { id: '2', text: 'Categories', url: '/categories', isExternal: false },
                        { id: '3', text: 'Cart', url: '/cart', isExternal: false },
                        { id: '4', text: 'Account', url: '/account', isExternal: false }
                      ]
                    })}
                    className="p-2 text-xs border border-gray-300 rounded hover:bg-gray-50"
                  >
                    E-commerce Menu
                  </button>
                  <button
                    onClick={() => updateBlockSettings(block.id, {
                      navigationItems: [
                        { id: '1', text: 'Facebook', url: 'https://facebook.com', isExternal: true },
                        { id: '2', text: 'Twitter', url: 'https://twitter.com', isExternal: true },
                        { id: '3', text: 'Instagram', url: 'https://instagram.com', isExternal: true },
                        { id: '4', text: 'LinkedIn', url: 'https://linkedin.com', isExternal: true }
                      ]
                    })}
                    className="p-2 text-xs border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Social Links
                  </button>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
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

              {/* Page Navigation */}
              <div className="flex items-center space-x-2 ml-8">
                <span className="text-sm text-gray-500">Pages:</span>
                {pages.map((page) => (
                  <button
                    key={page.id}
                    onClick={() => switchToPage(page)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center space-x-1 ${currentPage?.id === page.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                  >
                    {page.is_home && <Home className="w-3 h-3" />}
                    <span>{page.title}</span>
                  </button>
                ))}
                <button
                  onClick={() => setShowPageManager(true)}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                  title="Manage Pages"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* Undo/Redo */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={undo}
                  disabled={historyIndex <= 0}
                  className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Undo"
                >
                  <Undo className="w-4 h-4" />
                </button>
                <button
                  onClick={redo}
                  disabled={historyIndex >= history.length - 1}
                  className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Redo"
                >
                  <Redo className="w-4 h-4" />
                </button>
              </div>

              {/* View Mode Selector */}
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('desktop')}
                  className={`p-2 rounded ${viewMode === 'desktop' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
                  title="Desktop View"
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('tablet')}
                  className={`p-2 rounded ${viewMode === 'tablet' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
                  title="Tablet View"
                >
                  <Tablet className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('mobile')}
                  className={`p-2 rounded ${viewMode === 'mobile' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
                  title="Mobile View"
                >
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>

              {/* Preview Toggle */}
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${previewMode ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <Eye className="w-4 h-4" />
                <span>{previewMode ? 'Edit' : 'Preview'}</span>
              </button>

              {/* Full Preview Modal */}
              <button
                onClick={() => setShowPreviewModal(true)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                <Monitor className="w-4 h-4" />
                <span>Full Preview</span>
              </button>

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
          <div className="col-span-3 space-y-6">
            {/* Global Spacing Control */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Page Spacing</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Block Spacing</label>
                <select
                  onChange={(e) => {
                    const spacing = e.target.value
                    // Apply spacing to all blocks
                    const updatedBlocks = blocks.map(block => ({
                      ...block,
                      style: {
                        ...block.style,
                        margin: `${spacing} 0`
                      }
                    }))
                    setBlocks(updatedBlocks)
                  }}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="">Select spacing for all blocks</option>
                  <option value="4px">Tight (4px)</option>
                  <option value="8px">Normal (8px)</option>
                  <option value="16px">Relaxed (16px)</option>
                  <option value="24px">Loose (24px)</option>
                  <option value="32px">Extra Loose (32px)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Apply consistent spacing between all blocks on this page
                </p>
              </div>
            </div>

            {/* Content Blocks */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Content</h3>
              <div className="space-y-2">
                <button
                  onClick={() => addBlock('heading')}
                  className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-md transition-colors"
                >
                  <Type className="w-5 h-5 text-gray-400" />
                  <span>Heading</span>
                </button>
                <button
                  onClick={() => addBlock('paragraph')}
                  className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-md transition-colors"
                >
                  <FileText className="w-5 h-5 text-gray-400" />
                  <span>Paragraph</span>
                </button>
                <button
                  onClick={() => addBlock('image')}
                  className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-md transition-colors"
                >
                  <ImageIcon className="w-5 h-5 text-gray-400" />
                  <span>Image</span>
                </button>
                <button
                  onClick={() => addBlock('button')}
                  className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-md transition-colors"
                >
                  <Layout className="w-5 h-5 text-gray-400" />
                  <span>Button</span>
                </button>
                <button
                  onClick={() => addBlock('list')}
                  className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-md transition-colors"
                >
                  <List className="w-5 h-5 text-gray-400" />
                  <span>List</span>
                </button>
                <button
                  onClick={() => addBlock('link')}
                  className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-md transition-colors"
                >
                  <Link2 className="w-5 h-5 text-gray-400" />
                  <span>Link</span>
                </button>
                <button
                  onClick={() => addBlock('video')}
                  className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-md transition-colors"
                >
                  <Video className="w-5 h-5 text-gray-400" />
                  <span>Video</span>
                </button>
                <button
                  onClick={() => addBlock('code')}
                  className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-md transition-colors"
                >
                  <Code className="w-5 h-5 text-gray-400" />
                  <span>Code Block</span>
                </button>
                <button
                  onClick={() => addBlock('divider')}
                  className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-md transition-colors"
                >
                  <Layout className="w-5 h-5 text-gray-400" />
                  <span>Divider</span>
                </button>
                <button
                  onClick={() => addBlock('navigation')}
                  className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-md transition-colors"
                >
                  <Menu className="w-5 h-5 text-gray-400" />
                  <span>Navigation Menu</span>
                </button>
              </div>
            </div>

            {/* Style Panel */}
            {selectedBlockId && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Palette className="w-5 h-5 mr-2" />
                  Style Options
                </h3>
                <div className="space-y-4">
                  {/* Text Alignment */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Text Align</label>
                    <div className="flex space-x-1">
                      {['left', 'center', 'right'].map((align) => (
                        <button
                          key={align}
                          onClick={() => updateBlockStyle(selectedBlockId, { textAlign: align as any })}
                          className={`p-2 rounded ${blocks.find(b => b.id === selectedBlockId)?.style?.textAlign === align
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-500 hover:bg-gray-100'
                            }`}
                        >
                          {align === 'left' && <AlignLeft className="w-4 h-4" />}
                          {align === 'center' && <AlignCenter className="w-4 h-4" />}
                          {align === 'right' && <AlignRight className="w-4 h-4" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Text Style */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Text Style</label>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => {
                          const currentBlock = blocks.find(b => b.id === selectedBlockId)
                          const isBold = currentBlock?.style?.fontWeight === 'bold'
                          updateBlockStyle(selectedBlockId, { fontWeight: isBold ? 'normal' : 'bold' })
                        }}
                        className={`p-2 rounded ${blocks.find(b => b.id === selectedBlockId)?.style?.fontWeight === 'bold'
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-500 hover:bg-gray-100'
                          }`}
                      >
                        <Bold className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          const currentBlock = blocks.find(b => b.id === selectedBlockId)
                          const isItalic = currentBlock?.style?.fontStyle === 'italic'
                          updateBlockStyle(selectedBlockId, { fontStyle: isItalic ? 'normal' : 'italic' })
                        }}
                        className={`p-2 rounded ${blocks.find(b => b.id === selectedBlockId)?.style?.fontStyle === 'italic'
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-500 hover:bg-gray-100'
                          }`}
                      >
                        <Italic className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          const currentBlock = blocks.find(b => b.id === selectedBlockId)
                          const isUnderlined = currentBlock?.style?.textDecoration === 'underline'
                          updateBlockStyle(selectedBlockId, { textDecoration: isUnderlined ? 'none' : 'underline' })
                        }}
                        className={`p-2 rounded ${blocks.find(b => b.id === selectedBlockId)?.style?.textDecoration === 'underline'
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-500 hover:bg-gray-100'
                          }`}
                      >
                        <Underline className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Colors */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
                    <input
                      type="color"
                      value={blocks.find(b => b.id === selectedBlockId)?.style?.textColor || '#000000'}
                      onChange={(e) => updateBlockStyle(selectedBlockId, { textColor: e.target.value })}
                      className="w-full h-10 rounded border border-gray-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
                    <input
                      type="color"
                      value={blocks.find(b => b.id === selectedBlockId)?.style?.backgroundColor || '#ffffff'}
                      onChange={(e) => updateBlockStyle(selectedBlockId, { backgroundColor: e.target.value })}
                      className="w-full h-10 rounded border border-gray-300"
                    />
                  </div>

                  {/* Font Customization - Only for text blocks */}
                  {(blocks.find(b => b.id === selectedBlockId)?.type === 'heading' ||
                    blocks.find(b => b.id === selectedBlockId)?.type === 'paragraph') && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Font Family</label>
                          <select
                            value={blocks.find(b => b.id === selectedBlockId)?.style?.fontFamily || 'inherit'}
                            onChange={(e) => updateBlockStyle(selectedBlockId, { fontFamily: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded"
                          >
                            <option value="inherit">Default</option>
                            <option value="Arial, sans-serif">Arial</option>
                            <option value="Helvetica, sans-serif">Helvetica</option>
                            <option value="'Times New Roman', serif">Times New Roman</option>
                            <option value="Georgia, serif">Georgia</option>
                            <option value="'Courier New', monospace">Courier New</option>
                            <option value="Verdana, sans-serif">Verdana</option>
                            <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
                            <option value="'Comic Sans MS', cursive">Comic Sans MS</option>
                            <option value="Impact, sans-serif">Impact</option>
                            <option value="'Lucida Console', monospace">Lucida Console</option>
                            <option value="'Palatino Linotype', serif">Palatino</option>
                            <option value="Tahoma, sans-serif">Tahoma</option>
                            <option value="'Century Gothic', sans-serif">Century Gothic</option>
                            <option value="'Book Antiqua', serif">Book Antiqua</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
                          <div className="flex space-x-2">
                            <select
                              value={blocks.find(b => b.id === selectedBlockId)?.style?.fontSize || 'auto'}
                              onChange={(e) => updateBlockStyle(selectedBlockId, { fontSize: e.target.value })}
                              className="flex-1 p-2 border border-gray-300 rounded"
                            >
                              <option value="auto">Auto</option>
                              <option value="0.75rem">12px (Small)</option>
                              <option value="0.875rem">14px (Normal)</option>
                              <option value="1rem">16px (Medium)</option>
                              <option value="1.125rem">18px (Large)</option>
                              <option value="1.25rem">20px (X-Large)</option>
                              <option value="1.5rem">24px (XX-Large)</option>
                              <option value="1.875rem">30px (Huge)</option>
                              <option value="2.25rem">36px (Giant)</option>
                              <option value="3rem">48px (Massive)</option>
                            </select>
                            <input
                              type="text"
                              placeholder="Custom"
                              className="w-20 p-2 border border-gray-300 rounded text-xs"
                              onBlur={(e) => {
                                if (e.target.value) {
                                  updateBlockStyle(selectedBlockId, { fontSize: e.target.value })
                                }
                              }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Line Height</label>
                            <select
                              value={blocks.find(b => b.id === selectedBlockId)?.style?.lineHeight || '1.5'}
                              onChange={(e) => updateBlockStyle(selectedBlockId, { lineHeight: e.target.value })}
                              className="w-full p-2 border border-gray-300 rounded"
                            >
                              <option value="1">Tight (1.0)</option>
                              <option value="1.25">Snug (1.25)</option>
                              <option value="1.5">Normal (1.5)</option>
                              <option value="1.75">Relaxed (1.75)</option>
                              <option value="2">Loose (2.0)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Letter Spacing</label>
                            <select
                              value={blocks.find(b => b.id === selectedBlockId)?.style?.letterSpacing || 'normal'}
                              onChange={(e) => updateBlockStyle(selectedBlockId, { letterSpacing: e.target.value })}
                              className="w-full p-2 border border-gray-300 rounded"
                            >
                              <option value="-0.05em">Tighter</option>
                              <option value="-0.025em">Tight</option>
                              <option value="normal">Normal</option>
                              <option value="0.025em">Wide</option>
                              <option value="0.05em">Wider</option>
                              <option value="0.1em">Widest</option>
                            </select>
                          </div>
                        </div>

                        {/* Font Weight Slider */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Font Weight</label>
                          <div className="flex items-center space-x-3">
                            <span className="text-xs text-gray-500">Light</span>
                            <input
                              type="range"
                              min="100"
                              max="900"
                              step="100"
                              value={
                                blocks.find(b => b.id === selectedBlockId)?.style?.fontWeight === 'bold' ? '700' :
                                  blocks.find(b => b.id === selectedBlockId)?.style?.fontWeight === 'normal' ? '400' : '400'
                              }

                              onChange={(e) => {
                                const weight = e.target.value
                                updateBlockStyle(selectedBlockId, {
                                  fontWeight: weight === '400' ? 'normal' : 'bold'
                                })
                              }}

                              className="flex-1"
                            />
                            <span className="text-xs text-gray-500">Bold</span>
                          </div>
                          <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>100</span>
                            <span>300</span>
                            <span>400</span>
                            <span>600</span>
                            <span>700</span>
                            <span>900</span>
                          </div>
                        </div>

                        {/* Spacing Controls */}
                        <div className="border-t border-gray-200 pt-4 mt-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-3">Spacing</h4>

                          {/* Margin Controls */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Margin (Space Around Block)</label>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Top & Bottom</label>
                                <select
                                  value={(() => {
                                    const margin = blocks.find(b => b.id === selectedBlockId)?.style?.margin || '8px 0'
                                    const parts = margin.split(' ')
                                    return parts[0] || '8px'
                                  })()}
                                  onChange={(e) => {
                                    const currentMargin = blocks.find(b => b.id === selectedBlockId)?.style?.margin || '8px 0'
                                    const parts = currentMargin.split(' ')
                                    const horizontal = parts[1] || '0'
                                    updateBlockStyle(selectedBlockId, { margin: `${e.target.value} ${horizontal}` })
                                  }}
                                  className="w-full p-1 text-xs border border-gray-300 rounded"
                                >
                                  <option value="0">None (0)</option>
                                  <option value="4px">XS (4px)</option>
                                  <option value="8px">SM (8px)</option>
                                  <option value="12px">MD (12px)</option>
                                  <option value="16px">LG (16px)</option>
                                  <option value="24px">XL (24px)</option>
                                  <option value="32px">2XL (32px)</option>
                                  <option value="48px">3XL (48px)</option>
                                  <option value="64px">4XL (64px)</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Left & Right</label>
                                <select
                                  value={(() => {
                                    const margin = blocks.find(b => b.id === selectedBlockId)?.style?.margin || '8px 0'
                                    const parts = margin.split(' ')
                                    return parts[1] || '0'
                                  })()}
                                  onChange={(e) => {
                                    const currentMargin = blocks.find(b => b.id === selectedBlockId)?.style?.margin || '8px 0'
                                    const parts = currentMargin.split(' ')
                                    const vertical = parts[0] || '8px'
                                    updateBlockStyle(selectedBlockId, { margin: `${vertical} ${e.target.value}` })
                                  }}
                                  className="w-full p-1 text-xs border border-gray-300 rounded"
                                >
                                  <option value="0">None (0)</option>
                                  <option value="4px">XS (4px)</option>
                                  <option value="8px">SM (8px)</option>
                                  <option value="12px">MD (12px)</option>
                                  <option value="16px">LG (16px)</option>
                                  <option value="24px">XL (24px)</option>
                                  <option value="32px">2XL (32px)</option>
                                  <option value="auto">Auto</option>
                                </select>
                              </div>
                            </div>
                          </div>

                          {/* Padding Controls */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Padding (Space Inside Block)</label>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Top & Bottom</label>
                                <select
                                  value={(() => {
                                    const padding = blocks.find(b => b.id === selectedBlockId)?.style?.padding || '8px'
                                    const parts = padding.split(' ')
                                    return parts[0] || '8px'
                                  })()}
                                  onChange={(e) => {
                                    const currentPadding = blocks.find(b => b.id === selectedBlockId)?.style?.padding || '8px'
                                    const parts = currentPadding.split(' ')
                                    const horizontal = parts[1] || parts[0] || '8px'
                                    updateBlockStyle(selectedBlockId, { padding: `${e.target.value} ${horizontal}` })
                                  }}
                                  className="w-full p-1 text-xs border border-gray-300 rounded"
                                >
                                  <option value="0">None (0)</option>
                                  <option value="4px">XS (4px)</option>
                                  <option value="8px">SM (8px)</option>
                                  <option value="12px">MD (12px)</option>
                                  <option value="16px">LG (16px)</option>
                                  <option value="24px">XL (24px)</option>
                                  <option value="32px">2XL (32px)</option>
                                  <option value="48px">3XL (48px)</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Left & Right</label>
                                <select
                                  value={(() => {
                                    const padding = blocks.find(b => b.id === selectedBlockId)?.style?.padding || '8px'
                                    const parts = padding.split(' ')
                                    return parts[1] || parts[0] || '8px'
                                  })()}
                                  onChange={(e) => {
                                    const currentPadding = blocks.find(b => b.id === selectedBlockId)?.style?.padding || '8px'
                                    const parts = currentPadding.split(' ')
                                    const vertical = parts[0] || '8px'
                                    updateBlockStyle(selectedBlockId, { padding: `${vertical} ${e.target.value}` })
                                  }}
                                  className="w-full p-1 text-xs border border-gray-300 rounded"
                                >
                                  <option value="0">None (0)</option>
                                  <option value="4px">XS (4px)</option>
                                  <option value="8px">SM (8px)</option>
                                  <option value="12px">MD (12px)</option>
                                  <option value="16px">LG (16px)</option>
                                  <option value="24px">XL (24px)</option>
                                  <option value="32px">2XL (32px)</option>
                                  <option value="48px">3XL (48px)</option>
                                </select>
                              </div>
                            </div>
                          </div>

                          {/* Quick Spacing Presets */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Quick Spacing Presets</label>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => updateBlockStyle(selectedBlockId, {
                                  margin: '4px 0',
                                  padding: '4px 8px'
                                })}
                                className="p-2 text-xs border border-gray-300 rounded hover:bg-gray-50 text-left"
                              >
                                Tight Spacing
                              </button>
                              <button
                                onClick={() => updateBlockStyle(selectedBlockId, {
                                  margin: '8px 0',
                                  padding: '8px 12px'
                                })}
                                className="p-2 text-xs border border-gray-300 rounded hover:bg-gray-50 text-left"
                              >
                                Normal Spacing
                              </button>
                              <button
                                onClick={() => updateBlockStyle(selectedBlockId, {
                                  margin: '16px 0',
                                  padding: '16px 20px'
                                })}
                                className="p-2 text-xs border border-gray-300 rounded hover:bg-gray-50 text-left"
                              >
                                Loose Spacing
                              </button>
                              <button
                                onClick={() => updateBlockStyle(selectedBlockId, {
                                  margin: '32px 0',
                                  padding: '24px 32px'
                                })}
                                className="p-2 text-xs border border-gray-300 rounded hover:bg-gray-50 text-left"
                              >
                                Wide Spacing
                              </button>
                            </div>
                          </div>

                          {/* Visual Spacing Indicator */}
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <div className="text-xs text-gray-600 mb-2">Current Spacing Preview:</div>
                            <div className="flex items-center justify-center">
                              <div className="relative">
                                <div
                                  className="bg-blue-100 border-2 border-dashed border-blue-300 rounded text-center text-xs text-blue-600 flex items-center justify-center"
                                  style={{
                                    margin: blocks.find(b => b.id === selectedBlockId)?.style?.margin || '8px 0',
                                    padding: blocks.find(b => b.id === selectedBlockId)?.style?.padding || '8px',
                                    minWidth: '80px',
                                    minHeight: '40px'
                                  }}
                                >
                                  Block Content
                                </div>
                                <div className="absolute -top-2 -left-2 text-xs text-gray-500">Margin</div>
                                <div className="absolute top-1 left-1 text-xs text-blue-500">Padding</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Quick Font Presets */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Quick Presets</label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => updateBlockStyle(selectedBlockId, {
                                fontFamily: 'Georgia, serif',
                                fontSize: '1.125rem',
                                lineHeight: '1.75',
                                letterSpacing: 'normal'
                              })}
                              className="p-2 text-xs border border-gray-300 rounded hover:bg-gray-50 text-left"
                              style={{ fontFamily: 'Georgia, serif' }}
                            >
                              Elegant Serif
                            </button>
                            <button
                              onClick={() => updateBlockStyle(selectedBlockId, {
                                fontFamily: 'Arial, sans-serif',
                                fontSize: '1rem',
                                lineHeight: '1.5',
                                letterSpacing: 'normal'
                              })}
                              className="p-2 text-xs border border-gray-300 rounded hover:bg-gray-50 text-left"
                              style={{ fontFamily: 'Arial, sans-serif' }}
                            >
                              Clean Sans
                            </button>
                            <button
                              onClick={() => updateBlockStyle(selectedBlockId, {
                                fontFamily: 'Impact, sans-serif',
                                fontSize: '1.25rem',
                                lineHeight: '1.25',
                                letterSpacing: '0.025em',
                                fontWeight: 'bold'
                              })}
                              className="p-2 text-xs border border-gray-300 rounded hover:bg-gray-50 text-left"
                              style={{ fontFamily: 'Impact, sans-serif', fontWeight: 'bold' }}
                            >
                              Bold Impact
                            </button>
                            <button
                              onClick={() => updateBlockStyle(selectedBlockId, {
                                fontFamily: "'Courier New', monospace",
                                fontSize: '0.875rem',
                                lineHeight: '1.5',
                                letterSpacing: 'normal'
                              })}
                              className="p-2 text-xs border border-gray-300 rounded hover:bg-gray-50 text-left"
                              style={{ fontFamily: "'Courier New', monospace" }}
                            >
                              Code Style
                            </button>
                          </div>
                        </div>
                      </>
                    )}

                  {/* Image-specific options */}
                  {blocks.find(b => b.id === selectedBlockId)?.type === 'image' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Border Radius</label>
                        <select
                          onChange={(e) => {
                            const borderRadius = e.target.value
                            const currentBlock = blocks.find(b => b.id === selectedBlockId)
                            if (currentBlock) {
                              // Update the image element style directly
                              const imgElement = document.querySelector(`[data-block-id="${selectedBlockId}"] img`) as HTMLImageElement
                              if (imgElement) {
                                imgElement.style.borderRadius = borderRadius
                              }
                            }
                          }}
                          className="w-full p-2 border border-gray-300 rounded"
                        >
                          <option value="0">No Radius</option>
                          <option value="4px">Small (4px)</option>
                          <option value="8px">Medium (8px)</option>
                          <option value="12px">Large (12px)</option>
                          <option value="50%">Circle</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Shadow</label>
                        <select
                          onChange={(e) => {
                            const shadow = e.target.value
                            const currentBlock = blocks.find(b => b.id === selectedBlockId)
                            if (currentBlock) {
                              const imgElement = document.querySelector(`[data-block-id="${selectedBlockId}"] img`) as HTMLImageElement
                              if (imgElement) {
                                imgElement.style.boxShadow = shadow
                              }
                            }
                          }}
                          className="w-full p-2 border border-gray-300 rounded"
                        >
                          <option value="none">No Shadow</option>
                          <option value="0 1px 3px rgba(0,0,0,0.12)">Small</option>
                          <option value="0 4px 6px rgba(0,0,0,0.1)">Medium</option>
                          <option value="0 10px 15px rgba(0,0,0,0.1)">Large</option>
                          <option value="0 20px 25px rgba(0,0,0,0.15)">Extra Large</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Main Editor */}
          <div className="col-span-9">
            <div className={`bg-white rounded-lg shadow min-h-96 transition-all duration-300 ${viewMode === 'mobile' ? 'max-w-sm mx-auto' :
              viewMode === 'tablet' ? 'max-w-2xl mx-auto' : 'w-full'
              }`}>
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {currentPage?.title || 'Untitled Page'}
                </h2>

                <div className={`space-y-4 ${draggedBlockId ? 'bg-blue-50 rounded-lg p-4' : ''}`}>
                  {draggedBlockId && (
                    <div className="text-center text-blue-600 text-sm font-medium mb-4 p-2 bg-blue-100 rounded-lg">
                      🎯 Drag the block to reorder your content - Currently dragging: {blocks.find(b => b.id === draggedBlockId)?.type}
                    </div>
                  )}
                  
                  {/* Debug info */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="mb-4">
                      <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded mb-4">
                        Debug: Dragged ID: {draggedBlockId || 'none'} | Drag Over Index: {dragOverIndex ?? 'none'} | Blocks: {blocks.length}
                      </div>
                      <DragTest />
                    </div>
                  )}
                  {blocks.map((block, index) => (
                    <div key={block.id}>
                      {/* Drop Zone Above Block */}
                      {!previewMode && draggedBlockId && (
                        <div
                          className={`transition-all duration-200 ${dragOverIndex === index
                            ? 'h-6 bg-blue-500 rounded-lg mx-2 mb-3 opacity-90 shadow-lg border-2 border-blue-300'
                            : 'h-4 bg-gray-200 rounded mx-2 mb-2 opacity-50 hover:opacity-70'
                            }`}
                          onDragOver={(e) => handleDragOver(e, index)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, index)}
                          style={{ minHeight: '16px' }}
                        >
                          {dragOverIndex === index && (
                            <div className="flex items-center justify-center h-full text-white text-xs font-medium">
                              Drop here
                            </div>
                          )}
                        </div>
                      )}

                      <div
                        className={`group relative rounded-md transition-all duration-200 ${selectedBlockId === block.id
                          ? 'ring-2 ring-blue-500 bg-blue-50'
                          : previewMode
                            ? ''
                            : 'border border-transparent hover:border-gray-300 hover:bg-gray-50'
                          } ${previewMode ? 'p-0' : 'p-4'} ${draggedBlockId === block.id ? 'opacity-50 transform rotate-1 scale-105' : ''
                          }`}
                        onClick={() => !previewMode && setSelectedBlockId(block.id)}
                      >
                        {!previewMode && (
                          <>
                            {/* Drag Handle */}
                            <button
                              className="absolute top-2 left-2 opacity-60 group-hover:opacity-100 transition-opacity z-10 p-2 rounded-md shadow-md cursor-grab active:cursor-grabbing border border-gray-200 drag-handle bg-white hover:bg-blue-50 hover:shadow-lg"
                              draggable
                              onDragStart={(e) => {
                                console.log('🎯 Drag handle clicked for block:', block.id)
                                e.stopPropagation()
                                handleDragStart(e, block.id)
                              }}
                              onDragEnd={(e) => {
                                console.log('🎯 Drag ended for block:', block.id)
                                e.stopPropagation()
                                handleDragEnd()
                              }}
                              onClick={(e) => {
                                e.stopPropagation()
                                e.preventDefault()
                              }}
                              onMouseDown={(e) => {
                                e.stopPropagation()
                              }}
                              title="Drag to reorder"
                              style={{ 
                                cursor: 'grab',
                                userSelect: 'none'
                              }}
                            >
                              <GripVertical className={`w-4 h-4 ${draggedBlockId === block.id ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
                                }`} />
                            </button>

                            {/* Block Controls */}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1 z-10">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  moveBlock(block.id, 'up')
                                }}
                                className="p-1 text-gray-400 hover:text-gray-600 bg-white rounded shadow"
                                title="Move Up"
                              >
                                <ChevronDown className="w-3 h-3 rotate-180" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  moveBlock(block.id, 'down')
                                }}
                                className="p-1 text-gray-400 hover:text-gray-600 bg-white rounded shadow"
                                title="Move Down"
                              >
                                <ChevronDown className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  duplicateBlock(block.id)
                                }}
                                className="p-1 text-gray-400 hover:text-gray-600 bg-white rounded shadow"
                                title="Duplicate"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteBlock(block.id)
                                }}
                                className="p-1 text-red-400 hover:text-red-600 bg-white rounded shadow"
                                title="Delete"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </>
                        )}

                        {block.type === 'heading' && !previewMode && (
                          <div className="mb-2">
                            <select
                              value={block.level || 1}
                              onChange={(e) => updateBlock(block.id, { level: parseInt(e.target.value) })}
                              className="text-sm border border-gray-300 rounded px-2 py-1"
                            >
                              <option value={1}>H1</option>
                              <option value={2}>H2</option>
                              <option value={3}>H3</option>
                            </select>
                          </div>
                        )}

                        {renderBlock(block)}
                      </div>
                    </div>
                  ))}

                  {/* Final Drop Zone */}
                  {!previewMode && blocks.length > 0 && draggedBlockId && (
                    <div
                      className={`transition-all duration-200 ${dragOverIndex === blocks.length
                        ? 'h-6 bg-blue-500 rounded-lg mx-2 mt-3 opacity-90 shadow-lg border-2 border-blue-300'
                        : 'h-4 bg-gray-200 rounded mx-2 mt-2 opacity-50 hover:opacity-70'
                        }`}
                      onDragOver={(e) => handleDragOver(e, blocks.length)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, blocks.length)}
                      style={{ minHeight: '16px' }}
                    >
                      {dragOverIndex === blocks.length && (
                        <div className="flex items-center justify-center h-full text-white text-xs font-medium">
                          Drop at end
                        </div>
                      )}
                    </div>
                  )}

                  {blocks.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <Layout className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2">Start building your page by adding content blocks</p>
                      <p className="text-sm mt-1">Use the sidebar to add headings, paragraphs, images, and more!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Page Manager Modal */}
      {showPageManager && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-2xl mx-4">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900">Manage Pages</h3>
                <button
                  onClick={() => setShowPageManager(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Create New Page */}
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-900 mb-3">Create New Page</h4>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={newPageTitle}
                    onChange={(e) => setNewPageTitle(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter page title (e.g., About Us, Contact)"
                    onKeyPress={(e) => e.key === 'Enter' && createNewPage()}
                  />
                  <button
                    onClick={createNewPage}
                    disabled={!newPageTitle.trim()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Create
                  </button>
                </div>
              </div>

              {/* Existing Pages */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">Existing Pages</h4>
                <div className="space-y-3">
                  {pages.map((page) => (
                    <div
                      key={page.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-3">
                        {page.is_home && (
                          <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            <Home className="w-3 h-3" />
                            <span>Home</span>
                          </div>
                        )}

                        {editingPageId === page.id ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={editingPageTitle}
                              onChange={(e) => setEditingPageTitle(e.target.value)}
                              className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  updatePageTitle(page.id, editingPageTitle)
                                }
                                if (e.key === 'Escape') {
                                  setEditingPageId(null)
                                  setEditingPageTitle('')
                                }
                              }}
                              autoFocus
                            />
                            <button
                              onClick={() => updatePageTitle(page.id, editingPageTitle)}
                              className="p-1 text-green-600 hover:text-green-700"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingPageId(null)
                                setEditingPageTitle('')
                              }}
                              className="p-1 text-gray-400 hover:text-gray-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">{page.title}</span>
                            <span className="text-sm text-gray-500">/{page.slug}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => switchToPage(page)}
                          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                        >
                          Edit
                        </button>

                        {editingPageId !== page.id && (
                          <button
                            onClick={() => {
                              setEditingPageId(page.id)
                              setEditingPageTitle(page.title)
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600"
                            title="Rename Page"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}

                        {!page.is_home && pages.length > 1 && (
                          <button
                            onClick={() => deletePage(page.id)}
                            className="p-1 text-red-400 hover:text-red-600"
                            title="Delete Page"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h5 className="font-medium text-blue-900 mb-2">Tips:</h5>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• The home page cannot be deleted</li>
                  <li>• Page URLs are automatically generated from titles</li>
                  <li>• Use descriptive titles for better SEO</li>
                  <li>• You can switch between pages using the tabs in the editor</li>
                </ul>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowPageManager(false)}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full h-full max-w-7xl max-h-full flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Preview: {currentPage?.title || 'Untitled Page'}
                </h3>

                {/* Device Selector */}
                <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setPreviewDevice('desktop')}
                    className={`p-2 rounded ${previewDevice === 'desktop' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
                    title="Desktop View"
                  >
                    <Monitor className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPreviewDevice('tablet')}
                    className={`p-2 rounded ${previewDevice === 'tablet' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
                    title="Tablet View"
                  >
                    <Tablet className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPreviewDevice('mobile')}
                    className={`p-2 rounded ${previewDevice === 'mobile' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
                    title="Mobile View"
                  >
                    <Smartphone className="w-4 h-4" />
                  </button>
                </div>

                <span className="text-sm text-gray-500">
                  {previewDevice === 'desktop' && '1200px'}
                  {previewDevice === 'tablet' && '768px'}
                  {previewDevice === 'mobile' && '375px'}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                {/* Page Navigation in Preview */}
                {pages.length > 1 && (
                  <select
                    value={currentPage?.id || ''}
                    onChange={(e) => {
                      const selectedPage = pages.find(p => p.id === e.target.value)
                      if (selectedPage) {
                        switchToPage(selectedPage)
                      }
                    }}
                    className="px-3 py-1 border border-gray-300 rounded text-sm"
                  >
                    {pages.map(page => (
                      <option key={page.id} value={page.id}>
                        {page.title} {page.is_home ? '(Home)' : ''}
                      </option>
                    ))}
                  </select>
                )}

                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Preview Content */}
            <div className="flex-1 overflow-auto bg-gray-100 p-8">
              <div className="flex justify-center">
                <div
                  className={`bg-white shadow-lg transition-all duration-300 ${previewDevice === 'mobile' ? 'w-full max-w-sm' :
                    previewDevice === 'tablet' ? 'w-full max-w-2xl' : 'w-full max-w-6xl'
                    } min-h-full`}
                  style={{
                    minHeight: previewDevice === 'mobile' ? '667px' :
                      previewDevice === 'tablet' ? '1024px' : '800px'
                  }}
                >
                  {/* Preview Header */}
                  <div className="bg-gray-50 border-b border-gray-200 p-3 text-center">
                    <div className="text-sm text-gray-600">
                      {site?.name} - {currentPage?.title}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Preview Mode • {previewDevice.charAt(0).toUpperCase() + previewDevice.slice(1)} View
                    </div>
                  </div>

                  {/* Preview Body */}
                  <div className="p-6">
                    {blocks.length > 0 ? (
                      <div className="space-y-4">
                        {blocks.map((block) => (
                          <div key={block.id}>
                            {renderPreviewBlock(block)}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <Layout className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2">No content to preview</p>
                        <p className="text-sm mt-1">Add some blocks to see your page preview</p>
                      </div>
                    )}
                  </div>

                  {/* Preview Footer */}
                  <div className="border-t border-gray-200 p-4 text-center text-xs text-gray-500">
                    Built with WebForge
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  This is how your page will look when published
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowPreviewModal(false)}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Close Preview
                  </button>
                  <button
                    onClick={() => {
                      setShowPreviewModal(false)
                      publishSite()
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Publish Site
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}