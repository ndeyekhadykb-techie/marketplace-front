export function Spinner({ size = 'md', className = '' }) {
    const sizes = {
      sm: 'w-4 h-4',
      md: 'w-8 h-8',
      lg: 'w-12 h-12',
    }
  
    return (
      <div
        className={`${sizes[size]} border-2 border-gray-200 border-t-amber-400 rounded-full animate-spin ${className}`}
      />
    )
  }
  
  export function PageLoader() {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    )
  }