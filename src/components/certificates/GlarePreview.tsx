import React, { useEffect, useRef } from 'react'

type GlarePreviewProps = {
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}

/**
 * GlarePreview
 * Wrapper com um overlay de brilho (glare) animado que reage ao mouse/touch.
 * Útil para pré-visualização de certificados/imagens com efeito de destaque.
 */
export default function GlarePreview({ className, style, children }: GlarePreviewProps) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const glareRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const root = rootRef.current
    const glare = glareRef.current
    if (!root || !glare) return

    let raf = 0
    let tx = 0
    let ty = 0

    const update = (x: number, y: number) => {
      const rect = root.getBoundingClientRect()
      const nx = (x - rect.left) / Math.max(1, rect.width)
      const ny = (y - rect.top) / Math.max(1, rect.height)
      tx = (nx - 0.5) * 40
      ty = (ny - 0.5) * 40
      if (!raf) raf = requestAnimationFrame(() => {
        glare.style.transform = `translate(${tx}%, ${ty}%) rotate(15deg)`
        raf = 0
      })
    }

    const onMove = (e: MouseEvent | TouchEvent) => {
      if (e instanceof MouseEvent) {
        update(e.clientX, e.clientY)
      } else {
        const t = e.touches[0]
        if (t) update(t.clientX, t.clientY)
      }
    }

    const onEnter = () => {
      glare.style.opacity = '1'
      glare.style.animation = 'none'
    }
    const onLeave = () => {
      glare.style.opacity = '0'
      glare.style.animation = 'float-glare 4s ease-in-out infinite'
    }

    root.addEventListener('mousemove', onMove)
    root.addEventListener('mouseenter', onEnter)
    root.addEventListener('mouseleave', onLeave)
    root.addEventListener('touchstart', onEnter, { passive: true })
    root.addEventListener('touchmove', onMove, { passive: true })
    root.addEventListener('touchend', onLeave)

    return () => {
      root.removeEventListener('mousemove', onMove)
      root.removeEventListener('mouseenter', onEnter)
      root.removeEventListener('mouseleave', onLeave)
      root.removeEventListener('touchstart', onEnter)
      root.removeEventListener('touchmove', onMove as any)
      root.removeEventListener('touchend', onLeave)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div
      ref={rootRef}
      className={`preview relative overflow-hidden ${className || ''}`}
      style={style}
    >
      {children}
      <div
        ref={glareRef}
        className="glare pointer-events-none"
        style={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          opacity: 0,
          transition: 'opacity 300ms ease',
          mixBlendMode: 'screen' as any,
          background:
            'radial-gradient(circle at center, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.15) 30%, rgba(255,255,255,0.0) 60%)',
          transform: 'translate(0,0) rotate(15deg)',
        }}
      />
      <style>{`
        @keyframes float-glare {
          0% { transform: translate(0,0) rotate(15deg); }
          50% { transform: translate(5%, -5%) rotate(15deg); }
          100% { transform: translate(0,0) rotate(15deg); }
        }
      `}</style>
    </div>
  )
}

