import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { ModelTag } from '@/components/config/ModelTag'

interface ModelTypeaheadProps {
  availableModels: string[]
  selectedModels: string[]
  onModelToggle: (model: string) => void
  placeholder?: string
}

export function ModelTypeahead({
  availableModels,
  selectedModels,
  onModelToggle,
  placeholder = 'Type to search models...',
}: ModelTypeaheadProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Filter models based on search term
  const filteredModels = availableModels.filter(
    (model) =>
      model.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !selectedModels.includes(model)
  )

  // Limit to 50 results for performance
  const displayedModels = filteredModels.slice(0, 50)

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Reset highlighted index when filtered models change
  useEffect(() => {
    setHighlightedIndex(0)
  }, [searchTerm])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setIsDropdownOpen(true)
  }

  const handleInputFocus = () => {
    setIsDropdownOpen(true)
  }

  const handleModelSelect = (model: string) => {
    onModelToggle(model)
    setSearchTerm('')
    setIsDropdownOpen(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isDropdownOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsDropdownOpen(true)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex((prev) =>
          prev < displayedModels.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0))
        break
      case 'Enter':
        e.preventDefault()
        if (displayedModels.length > 0 && highlightedIndex < displayedModels.length) {
          handleModelSelect(displayedModels[highlightedIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        setIsDropdownOpen(false)
        setSearchTerm('')
        break
    }
  }

  return (
    <div className="space-y-3">
      {/* Selected Models */}
      {selectedModels.length > 0 && (
        <div>
          <div className="text-sm text-gray-600 mb-2">
            Selected models ({selectedModels.length}):
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedModels.map((model) => (
              <ModelTag
                key={model}
                modelName={model}
                isSelected={true}
                onToggle={() => onModelToggle(model)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full"
        />

        {/* Dropdown */}
        {isDropdownOpen && (
          <div
            ref={dropdownRef}
            className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
          >
            {displayedModels.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">
                {searchTerm ? 'No models found' : 'Start typing to search...'}
              </div>
            ) : (
              <div className="py-1">
                {displayedModels.map((model, index) => (
                  <button
                    key={model}
                    onClick={() => handleModelSelect(model)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                      index === highlightedIndex
                        ? 'bg-blue-50 text-blue-900'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="truncate" title={model}>
                      {model}
                    </div>
                  </button>
                ))}
                {filteredModels.length > 50 && (
                  <div className="px-3 py-2 text-xs text-gray-500 border-t">
                    Showing first 50 of {filteredModels.length} results. Keep typing to refine...
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Helper Text */}
      <div className="text-xs text-gray-500">
        {availableModels.length > 0 ? (
          <>
            {availableModels.length.toLocaleString()} models available. Type to search and click to select.
          </>
        ) : (
          <>No models available. Test the connection first.</>
        )}
      </div>
    </div>
  )
}
