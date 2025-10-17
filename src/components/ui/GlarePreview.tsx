import React, { useEffect, useRef } from 'react'

type Props = {
  src: string
  alt?: string
  width?: number
  height?: number
  className?: string
  placeholder?: string
}

export default function GlarePreview({
  src,
  alt = 'preview',
  width = 422,
  height = 326,
  className = '',
  placeholder = 'https://placehold.co/422x326/222/fff?text=Image+Not+Found'
}: Props) {
  const rootRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const glare = root.querySelector('.glare') as HTMLElement | null
    if (!glare) return

    let raf = 0
    let pending = false
    let lastX = 0, lastY = 0

    const setVars = (clientX: number, clientY: number) => {
      const rect = root.getBoundingClientRect()
      const x = ((clientX - rect.left) / rect.width) * 100
      const y = ((clientY - rect.top) / rect.height) * 100
      root.style.setProperty('--gx', x + '%')
      root.style.setProperty('--gy', y + '%')
      // translate em % relativo ao tamanho
      const tx = (x - 50) * 0.4
      const ty = (y - 50) * 0.4
      root.style.setProperty('--tx', tx + '%')
      root.style.setProperty('--ty', ty + '%')
    }

    const schedule = (x: number, y: number) => {
      lastX = x; lastY = y
      if (pending) return
      pending = true
      raf = requestAnimationFrame(() => {
        pending = false
        setVars(lastX, lastY)
      })
    }

    const onMouseMove = (e: MouseEvent) => {
      schedule(e.clientX, e.clientY)
      glare.style.opacity = '1'
    }
    const onMouseLeave = () => {
      glare.style.opacity = '0'
    }
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0]
      schedule(t.clientX, t.clientY)
      glare.style.opacity = '1'
    }
    const onTouchEnd = () => {
      glare.style.opacity = '0'
    }

    root.addEventListener('mousemove', onMouseMove)
    root.addEventListener('mouseleave', onMouseLeave)
    root.addEventListener('touchstart', onTouchStart, { passive: true })
    root.addEventListener('touchend', onTouchEnd)

    return () => {
      root.removeEventListener('mousemove', onMouseMove)
      root.removeEventListener('mouseleave', onMouseLeave)
      root.removeEventListener('touchstart', onTouchStart)
      root.removeEventListener('touchend', onTouchEnd)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div
      ref={rootRef}
      className={`preview ${className}`}
      style={{ width, height }}
    >
      <img src={src} alt={alt} onError={(e) => {
        const target = e.currentTarget as HTMLImageElement
        target.onerror = null
        target.src = placeholder
      }} />
      <div className="glare" />
    </div>
  )
}

