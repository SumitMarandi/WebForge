import React, { useState } from 'react'
import { GripVertical } from 'lucide-react'

interface TestItem {
  id: string
  content: string
}

export default function DragTest() {
  const [items, setItems] = useState<TestItem[]>([
    { id: '1', content: 'Item 1' },
    { id: '2', content: 'Item 2' },
    { id: '3', content: 'Item 3' }
  ])
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    console.log('🧪 Test drag started:', itemId)
    setDraggedId(itemId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', itemId)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    e.stopPropagation()

    if (!draggedId) return

    const draggedIndex = items.findIndex(item => item.id === draggedId)
    if (draggedIndex === -1) return

    const newItems = [...items]
    const draggedItem = newItems[draggedIndex]

    newItems.splice(draggedIndex, 1)
    
    let insertIndex = dropIndex
    if (draggedIndex < dropIndex) {
      insertIndex = dropIndex - 1
    }

    newItems.splice(insertIndex, 0, draggedItem)
    setItems(newItems)
    setDraggedId(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedId(null)
    setDragOverIndex(null)
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Drag & Drop Test</h3>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={item.id}>
            {/* Drop zone above */}
            {draggedId && (
              <div
                className={`h-2 rounded transition-colors ${
                  dragOverIndex === index ? 'bg-blue-500' : 'bg-gray-200'
                }`}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
              />
            )}
            
            {/* Item */}
            <div className="flex items-center p-3 border rounded-lg bg-gray-50">
              <button
                className="mr-3 p-1 cursor-grab hover:bg-gray-200 rounded"
                draggable
                onDragStart={(e) => handleDragStart(e, item.id)}
                onDragEnd={handleDragEnd}
              >
                <GripVertical className="w-4 h-4" />
              </button>
              <span>{item.content}</span>
            </div>
          </div>
        ))}
        
        {/* Final drop zone */}
        {draggedId && (
          <div
            className={`h-2 rounded transition-colors ${
              dragOverIndex === items.length ? 'bg-blue-500' : 'bg-gray-200'
            }`}
            onDragOver={(e) => handleDragOver(e, items.length)}
            onDrop={(e) => handleDrop(e, items.length)}
          />
        )}
      </div>
      
      <div className="mt-4 text-sm text-gray-500">
        Dragged: {draggedId || 'none'} | Over: {dragOverIndex ?? 'none'}
      </div>
    </div>
  )
}