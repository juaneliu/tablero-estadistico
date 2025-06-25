import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'circular' | 'rectangular' | 'text'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'wave' | 'none'
}

function Skeleton({
  className,
  variant = 'default',
  width,
  height,
  animation = 'pulse',
  ...props
}: SkeletonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'circular':
        return 'rounded-full'
      case 'rectangular':
        return 'rounded-none'
      case 'text':
        return 'rounded h-4'
      default:
        return 'rounded-md'
    }
  }

  const getAnimationStyles = () => {
    switch (animation) {
      case 'wave':
        return 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700'
      case 'none':
        return 'bg-gray-200 dark:bg-gray-700'
      default:
        return 'animate-pulse bg-muted'
    }
  }

  const style = {
    ...(width && { width: typeof width === 'number' ? `${width}px` : width }),
    ...(height && { height: typeof height === 'number' ? `${height}px` : height }),
  }

  return (
    <div
      className={cn(
        getVariantStyles(),
        getAnimationStyles(),
        className
      )}
      style={style}
      {...props}
    />
  )
}

// Componentes específicos para diferentes casos de uso
const TableSkeleton = ({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) => (
  <div className="space-y-4">
    {/* Header */}
    <div className="flex space-x-4">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-6 flex-1" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex space-x-4">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={colIndex} className="h-10 flex-1" />
        ))}
      </div>
    ))}
  </div>
)

const CardSkeleton = () => (
  <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4">
    <div className="flex items-center space-x-4">
      <Skeleton variant="circular" width={48} height={48} />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-4 w-3/5" />
    </div>
  </div>
)

const StatCardSkeleton = () => (
  <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-6">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-16" />
      </div>
      <Skeleton variant="circular" width={40} height={40} />
    </div>
  </div>
)

const MunicipioIconSkeleton = ({ className = "h-6 w-6" }: { className?: string }) => (
  <Skeleton 
    variant="rectangular" 
    className={cn(
      className,
      "bg-blue-200 dark:bg-blue-700 border-2 border-blue-300 dark:border-blue-600 rounded-lg shadow-md"
    )} 
  />
)

export { Skeleton, TableSkeleton, CardSkeleton, StatCardSkeleton, MunicipioIconSkeleton }
