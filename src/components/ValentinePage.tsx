import { useEffect, useState, useRef, useLayoutEffect } from 'react'
import HeartButton from './HeartButton'
import '../styles/valentine.css'

const YES_GIF = 'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExNWtveXd0M2xpejg0NTF4b2NxdmgxMDF1aHhtZDJsOWx2ZzJrbW45cyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/OR5lQHqS0FkchvEqza/giphy.gif'
const NO_GIF = 'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExZGV4MmZyOGU2dW9hajh3M3dyNGNndGNpdTVjdzEyb3hlN3lidnAzMiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/kP3VObToocJos/giphy.gif'

export default function ValentinePage({
  gifYesUrl = YES_GIF,
  gifNoUrl = NO_GIF,
}: {
  gifYesUrl?: string
  gifNoUrl?: string
}) {
  const [activeGif, setActiveGif] = useState<string>(gifNoUrl)
  const [showResponse, setShowResponse] = useState(false)
  const [noCount, setNoCount] = useState<number>(0)
  const [isSmallScreen, setIsSmallScreen] = useState<boolean>(false)
  const cardRef = useRef<HTMLDivElement | null>(null)
  const yesRef = useRef<HTMLButtonElement | null>(null)
  const noRef = useRef<HTMLButtonElement | null>(null)
  const [measuredMaxScale, setMeasuredMaxScale] = useState<number | null>(null)

  useEffect(() => {
    setActiveGif(gifNoUrl)
  }, [gifNoUrl])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 420px)')
    const handler = (e: MediaQueryListEvent | MediaQueryList) => setIsSmallScreen(!!e.matches)
    handler(mq)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    if (showResponse) return
    const img = new Image()
    img.src = gifYesUrl
  }, [showResponse, gifYesUrl])

  useLayoutEffect(() => {
    // Utility to compute measuredMaxScale based on current DOM sizes
    const recompute = () => {
      const card = cardRef.current
      const yes = yesRef.current
      const no = noRef.current
      if (!card || !yes || !no) return

      const cardRect = card.getBoundingClientRect()
      const yesRect = yes.getBoundingClientRect()
      const noRect = no.getBoundingClientRect()

      // compute how much space to the right edge of the card remains after yes button's left edge
      const spaceToRight = cardRect.right - yesRect.left

      // desired width to cover the no button: distance from yes left to no right
      const desiredCoverWidth = noRect.right - yesRect.left

      const currentYesWidth = yesRect.width || 1
      const maxScaleBySpace = spaceToRight / currentYesWidth
      const maxScaleByCover = desiredCoverWidth / currentYesWidth

      // pick the minimal sensible max scale, guard NaN and set a lower bound
      let computed = Math.max(1.2, Math.min(maxScaleBySpace, maxScaleByCover))
      if (!isFinite(computed) || computed < 1.2) computed = 1.2
      setMeasuredMaxScale(computed)
    }

    // initial compute
    recompute()

    // observe resizes on card and buttons to keep computation accurate (mobile rotations etc.)
    const ro = new ResizeObserver(() => recompute())
    if (cardRef.current) ro.observe(cardRef.current)
    if (yesRef.current) ro.observe(yesRef.current)
    if (noRef.current) ro.observe(noRef.current)

    // also recalc on window resize
    const onResize = () => recompute()
    window.addEventListener('resize', onResize)

    return () => {
      ro.disconnect()
      window.removeEventListener('resize', onResize)
    }
  }, [isSmallScreen, noCount])

  function onYes() {
    setActiveGif(gifYesUrl)
    setShowResponse(true)
  }

  function onNo() {
    setNoCount((c: number) => c + 1)
  }

  // growth tuned so 'Tak' expands to the right and covers 'Nie' without leaving the card
  // scale grows faster but is capped to avoid going off-screen
  // responsive max scale: smaller max on mobile to avoid overflowing the card
  const defaultMax = isSmallScreen ? 1.8 : 3
  const safeMax = measuredMaxScale ? Math.min(defaultMax, measuredMaxScale) : defaultMax
  const yesScale = 1 + Math.min(0.6 * noCount, safeMax)

  // require multiple presses before 'Tak' is considered to be fully covering 'Nie'
  const minClicksToDisable = 3
  const isCovering = noCount >= minClicksToDisable

  // messages for repeated No presses (polite playful versions)
  const noMessages = [
    'Dlaczego to nacisnęłaś?',
    'Nieeee, przestań mycha',
    'No nie, serio?',
    'Ej, daj spokój!',
    'Okej, to chyba przesada...',
  ]

  const currentNoMessage = noMessages[Math.min(noCount - 1, noMessages.length - 1)]

  return (
    <main className="valentine-root">
      <div className="card" ref={cardRef}>
        <div className="gif-wrap">
          <img src={activeGif} alt="valentine gif" className="valentine-gif" />
        </div>

        {!showResponse && <h2 className="prompt">Czy zostaniesz moją walentynką?</h2>}

        {showResponse ? (
          <h2 className="response">Ooooo, tak! Wiedzialem!!!</h2>
        ) : (
          <div className="controls">
            <HeartButton
              onClick={onYes}
              aria-label="Tak, zostanę"
              buttonRef={yesRef}
              style={{
                marginRight: 12,
                transformOrigin: 'left center',
                pointerEvents: 'auto',
                ...(isCovering ? { zIndex: 3 } : {}),
              }}
              scale={yesScale}
            >
              Tak
            </HeartButton>

            <HeartButton
              onClick={onNo}
              aria-label="Nie"
              buttonRef={noRef}
              style={{ transformOrigin: 'center', pointerEvents: isCovering ? 'none' : 'auto', opacity: isCovering ? 0.6 : 1, transition: 'opacity 120ms' }}
            >
              Nie
            </HeartButton>
          </div>
        )}

        {!showResponse && noCount > 0 && (
          <p className="no-message">{currentNoMessage}</p>
        )}
      </div>
    </main>
  )
}
