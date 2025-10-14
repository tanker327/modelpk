import { cn } from '@/lib/utils'

interface ModelTagProps {
  modelName: string
  isSelected: boolean
  onToggle: () => void
}

export function ModelTag({ modelName, isSelected, onToggle }: ModelTagProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onToggle()
    }
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      onKeyDown={handleKeyDown}
      aria-pressed={isSelected}
      aria-label={`${isSelected ? 'Deselect' : 'Select'} model ${modelName}`}
      className={cn(
        'px-2 py-1 text-xs rounded cursor-pointer transition-colors duration-150',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
        isSelected
          ? 'bg-blue-500 text-white hover:bg-blue-600'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      )}
    >
      {modelName}
    </button>
  )
}
