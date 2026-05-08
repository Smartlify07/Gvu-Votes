import { useState } from "react"
import { cn } from "@/lib/utils"

type OptimizedImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  containerClassName?: string
  fallback?: React.ReactNode
}

export function OptimizedImage({
  src,
  alt,
  className,
  containerClassName,
  fallback,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  return (
    <div className={cn("relative overflow-hidden", containerClassName)}>
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-muted animate-pulse" aria-hidden="true" />
      )}
      {hasError ? (
        fallback ?? <div className="absolute inset-0 bg-muted" aria-hidden="true" />
      ) : (
        <img
          src={src}
          alt={alt}
          className={cn(
            className,
            "transition-opacity duration-500",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          loading="lazy"
          {...props}
        />
      )}
    </div>
  )
}
