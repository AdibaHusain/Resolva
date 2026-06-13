import { useRef, useEffect } from 'react'

export default function FloatingLines({
  linesGradient = ['#1309b2', '#00B4D8', '#8d74f5', '#00E5FF'],
  animationSpeed = 0.35,
  interactive = true,
  bendRadius = 3.5,
  bendStrength = -0.9,
  mouseDamping = 0.03,
  parallax = true,
  parallaxStrength = 0.15,
}) {
  const canvasRef  = useRef(null)
  const mouse      = useRef({ x: -9999, y: -9999 })
  const smoothMouse = useRef({ x: -9999, y: -9999 })
  const frameRef   = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let W, H

    const resize = () => {
      W = canvas.width  = canvas.offsetWidth
      H = canvas.height = canvas.offsetHeight
    }
    resize()

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const onMove = (e) => {
      mouse.current.x = e.clientX
      mouse.current.y = e.clientY
    }
    if (interactive) window.addEventListener('mousemove', onMove)

    // Build color stops from gradient array
    const buildGrad = (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, w, 0)
      linesGradient.forEach((c, i) => {
        g.addColorStop(i / Math.max(linesGradient.length - 1, 1), c)
      })
      return g
    }

    let t = 0
    const LINE_COUNT  = 22
    const LINE_GROUPS = [
      { yFrac: 0.35, amp: 80,  freq: 0.006, phase: 0,   speed: 1.0, alpha: 0.6,  width: 1.2 },
      { yFrac: 0.50, amp: 60,  freq: 0.008, phase: 1.8,  speed: 1.3, alpha: 0.45, width: 0.8 },
      { yFrac: 0.65, amp: 100, freq: 0.005, phase: 3.5,  speed: 0.8, alpha: 0.35, width: 0.6 },
    ]

    const render = () => {
      frameRef.current = requestAnimationFrame(render)
      if (!W || !H) return

      // Smooth mouse
      smoothMouse.current.x += (mouse.current.x - smoothMouse.current.x) * mouseDamping
      smoothMouse.current.y += (mouse.current.y - smoothMouse.current.y) * mouseDamping

      ctx.clearRect(0, 0, W, H)

      LINE_GROUPS.forEach(grp => {
        const linesPerGroup = Math.floor(LINE_COUNT / LINE_GROUPS.length)

        for (let li = 0; li < linesPerGroup; li++) {
          const spread  = (li - linesPerGroup / 2) * 18
          const baseY   = grp.yFrac * H + spread

          // Parallax offset
          const pxOff = parallax
            ? ((smoothMouse.current.x / W) - 0.5) * parallaxStrength * 40
            : 0
          const pyOff = parallax
            ? ((smoothMouse.current.y / H) - 0.5) * parallaxStrength * 30
            : 0

          ctx.beginPath()

          const steps = Math.ceil(W / 4)
          for (let xi = 0; xi <= steps; xi++) {
            const x    = (xi / steps) * W
            const xNorm = x / W

            // Wave
            const wave1 = Math.sin(xNorm * grp.freq * W + t * grp.speed + grp.phase + li * 0.5) * grp.amp
            const wave2 = Math.sin(xNorm * grp.freq * 0.5 * W + t * grp.speed * 0.7 + li) * grp.amp * 0.35

            // Mouse bend
            let bend = 0
            if (interactive && smoothMouse.current.x > -1000) {
              const dx       = x - smoothMouse.current.x
              const dy       = baseY - smoothMouse.current.y
              const distSq   = dx * dx + dy * dy
              const radius   = bendRadius * 120
              const influence = Math.exp(-distSq / (radius * radius))
              bend = influence * bendStrength * 120
            }

            const y = baseY + wave1 + wave2 + bend + pyOff

            if (xi === 0) ctx.moveTo(x + pxOff, y)
            else ctx.lineTo(x + pxOff, y)
          }

          // Per-line alpha variation
          ctx.globalAlpha = grp.alpha

          const g = buildGrad(ctx, W, H)
          ctx.strokeStyle = g
          ctx.lineWidth   = grp.width

          // Fade edges
          const edgeGrad = ctx.createLinearGradient(0, 0, W, 0)
          edgeGrad.addColorStop(0,    'rgba(0,0,0,0)')
          edgeGrad.addColorStop(0.08, 'rgba(255,255,255,1)')
          edgeGrad.addColorStop(0.92, 'rgba(255,255,255,1)')
          edgeGrad.addColorStop(1,    'rgba(0,0,0,0)')

          ctx.save()
          ctx.globalCompositeOperation = 'source-over'
          ctx.stroke()
          ctx.restore()

          // Glow for thicker lines
          if (grp.width > 1) {
            ctx.globalAlpha = grp.alpha 
            ctx.lineWidth   = grp.width * 4
            ctx.stroke()
          }
        }
      })

      ctx.globalAlpha = 1
      t += 0.008 * animationSpeed
    }

    frameRef.current = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(frameRef.current)
      ro.disconnect()
      if (interactive) window.removeEventListener('mousemove', onMove)
    }
  }, [linesGradient, animationSpeed, interactive, bendRadius, bendStrength, mouseDamping, parallax, parallaxStrength])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        display: 'block', pointerEvents: 'none',
      }}
    />
  )
}