import React from 'react'
import { Template } from '@/data/templates'

interface TemplatePreviewProps {
  template: Template
  onClick: () => void
}

export default function TemplatePreview({ template, onClick }: TemplatePreviewProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'business':
        return 'bg-blue-100 text-blue-800'
      case 'portfolio':
        return 'bg-purple-100 text-purple-800'
      case 'blog':
        return 'bg-green-100 text-green-800'
      case 'landing':
        return 'bg-orange-100 text-orange-800'
      case 'ecommerce':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPreviewGradient = (category: string) => {
    switch (category) {
      case 'business':
        return 'from-blue-50 to-blue-100'
      case 'portfolio':
        return 'from-purple-50 to-purple-100'
      case 'blog':
        return 'from-green-50 to-green-100'
      case 'landing':
        return 'from-orange-50 to-orange-100'
      case 'ecommerce':
        return 'from-red-50 to-red-100'
      default:
        return 'from-gray-50 to-gray-100'
    }
  }

  return (
    <div
      className="border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:scale-105"
      onClick={onClick}
    >
      <div className={`aspect-video bg-gradient-to-br ${getPreviewGradient(template.category)} flex items-center justify-center relative`}>
        {/* Simple preview representation */}
        <div className="w-full h-full p-4 flex flex-col">
          {/* Header bar */}
          <div className="w-full h-2 bg-white/60 rounded mb-2"></div>
          
          {/* Title area */}
          <div className="flex-1 flex flex-col justify-center items-center space-y-2">
            <div className="w-3/4 h-3 bg-white/80 rounded"></div>
            <div className="w-1/2 h-2 bg-white/60 rounded"></div>
          </div>
          
          {/* Content blocks */}
          <div className="space-y-1">
            <div className="w-full h-1 bg-white/40 rounded"></div>
            <div className="w-4/5 h-1 bg-white/40 rounded"></div>
            <div className="w-3/5 h-1 bg-white/40 rounded"></div>
          </div>
        </div>
        
        {/* Category badge */}
        <div className="absolute top-2 right-2">
          <span className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${getCategoryColor(template.category)}`}>
            {template.category}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <h4 className="font-semibold text-gray-900 mb-1 text-sm">{template.name}</h4>
        <p className="text-xs text-gray-600 line-clamp-2">{template.description}</p>
        
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {template.blocks.length} blocks
          </span>
          <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
            Use Template →
          </button>
        </div>
      </div>
    </div>
  )
}