import * as React from "react";
import { cn } from "@/lib/utils";

interface PictureProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  webp?: string;
  avif?: string;
  blurDataUrl?: string;
  sizes?: string;
}

const Picture = React.forwardRef<HTMLImageElement, PictureProps>(
  ({ 
    src, 
    alt, 
    webp, 
    avif, 
    blurDataUrl, 
    sizes, 
    className, 
    loading = "lazy",
    decoding = "async",
    ...props 
  }, ref) => {
    const [isLoading, setIsLoading] = React.useState(true);
    const [currentSrc, setCurrentSrc] = React.useState(blurDataUrl || src);

    React.useEffect(() => {
      if (blurDataUrl) {
        setCurrentSrc(blurDataUrl);
        const img = new Image();
        img.onload = () => {
          setCurrentSrc(src);
          setIsLoading(false);
        };
        img.src = src;
      } else {
        setIsLoading(false);
      }
    }, [src, blurDataUrl]);

    const backgroundStyle = blurDataUrl ? {
      backgroundImage: `url(${blurDataUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      filter: isLoading ? 'blur(20px)' : 'none',
    } : undefined;

    return (
      <div className="relative overflow-hidden" style={backgroundStyle}>
        <picture>
          {avif && (
            <source 
              srcSet={avif} 
              type="image/avif" 
              sizes={sizes}
            />
          )}
          {webp && (
            <source 
              srcSet={webp} 
              type="image/webp" 
              sizes={sizes}
            />
          )}
          <img
            ref={ref}
            src={currentSrc}
            alt={alt}
            loading={loading}
            decoding={decoding}
            sizes={sizes}
            className={cn(
              "transition-all duration-700",
              isLoading && blurDataUrl ? "opacity-0" : "opacity-100",
              className
            )}
            {...props}
          />
        </picture>
      </div>
    );
  }
);
Picture.displayName = "Picture";

export { Picture };