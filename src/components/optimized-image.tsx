import Image from 'next/image'
import { useState, useCallback } from 'react'

// Configuración para optimización de imágenes
export const IMAGE_CONFIGS = {
  avatar: {
    sizes: '(max-width: 768px) 32px, 40px',
    quality: 85,
    priority: false
  },
  logo: {
    sizes: '(max-width: 768px) 120px, 180px',
    quality: 90,
    priority: true
  },
  chart: {
    sizes: '(max-width: 768px) 100vw, 50vw',
    quality: 80,
    priority: false
  },
  thumbnail: {
    sizes: '(max-width: 768px) 100px, 150px',
    quality: 75,
    priority: false
  },
  hero: {
    sizes: '100vw',
    quality: 85,
    priority: true
  }
} as const

type ImageConfig = keyof typeof IMAGE_CONFIGS

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  config?: ImageConfig
  className?: string
  fill?: boolean
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  onLoad?: () => void
  onError?: () => void
}

// Componente de imagen optimizada
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  config = 'thumbnail',
  className = '',
  fill = false,
  placeholder = 'empty',
  blurDataURL,
  onLoad,
  onError
}: OptimizedImageProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  
  const imageConfig = IMAGE_CONFIGS[config]
  
  const handleLoad = useCallback(() => {
    setLoading(false)
    onLoad?.()
  }, [onLoad])
  
  const handleError = useCallback(() => {
    setLoading(false)
    setError(true)
    onError?.()
  }, [onError])

  if (error) {
    return (
      <div 
        className={`bg-muted flex items-center justify-center text-muted-foreground ${className}`}
        style={{ width, height }}
      >
        <span className="text-xs">Error al cargar imagen</span>
      </div>
    )
  }

  return (
    <div className={`relative ${loading ? 'animate-pulse bg-muted' : ''} ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        sizes={imageConfig.sizes}
        quality={imageConfig.quality}
        priority={imageConfig.priority}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        onLoad={handleLoad}
        onError={handleError}
        className={fill ? 'object-cover' : ''}
      />
    </div>
  )
}

// Hook para generar placeholder blur base64
export function useBlurDataURL() {
  const generateBlurDataURL = useCallback((width: number = 10, height: number = 10, color: string = '#f3f4f6') => {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return ''
    
    ctx.fillStyle = color
    ctx.fillRect(0, 0, width, height)
    
    return canvas.toDataURL()
  }, [])
  
  return { generateBlurDataURL }
}

// Función para optimizar URLs de imágenes externas
export function optimizeImageUrl(url: string, options: {
  width?: number
  height?: number
  quality?: number
  format?: 'webp' | 'avif' | 'jpeg' | 'png'
} = {}) {
  const { width, height, quality = 80, format = 'webp' } = options
  
  // Para imágenes locales de Next.js no necesitamos modificar la URL
  if (url.startsWith('/') || url.startsWith('./')) {
    return url
  }
  
  // Para servicios externos como Cloudinary, Vercel, etc.
  // Esto se podría expandir según el servicio usado
  try {
    const imageUrl = new URL(url)
    
    // Ejemplo para Cloudinary
    if (imageUrl.hostname.includes('cloudinary.com')) {
      const params = []
      if (width) params.push(`w_${width}`)
      if (height) params.push(`h_${height}`)
      params.push(`q_${quality}`)
      params.push(`f_${format}`)
      
      const transformations = params.join(',')
      return url.replace('/upload/', `/upload/${transformations}/`)
    }
    
    // Para otros servicios, devolver URL original
    return url
  } catch {
    return url
  }
}

// Componente para lazy loading de imágenes con intersection observer
export function LazyImage({
  src,
  alt,
  width,
  height,
  className = '',
  rootMargin = '50px',
  threshold = 0.1,
  ...props
}: OptimizedImageProps & {
  rootMargin?: string
  threshold?: number
}) {
  const [inView, setInView] = useState(false)
  const [imgRef, setImgRef] = useState<HTMLDivElement | null>(null)

  // Intersection Observer
  useState(() => {
    if (!imgRef || typeof window === 'undefined') return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      {
        rootMargin,
        threshold
      }
    )

    observer.observe(imgRef)

    return () => observer.disconnect()
  })

  return (
    <div
      ref={setImgRef}
      className={className}
      style={{ width, height }}
    >
      {inView ? (
        <OptimizedImage
          src={src}
          alt={alt}
          width={width}
          height={height}
          {...props}
        />
      ) : (
        <div 
          className="bg-muted animate-pulse"
          style={{ width, height }}
        />
      )}
    </div>
  )
}
