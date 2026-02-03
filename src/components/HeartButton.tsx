import type { ButtonHTMLAttributes, CSSProperties, Ref } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  scale?: number
  layoutScale?: number
  buttonRef?: Ref<HTMLButtonElement>
}

export default function HeartButton({ scale = 1, layoutScale, style, children, buttonRef, ...rest }: Props) {
  const basePaddingY = 12
  const basePaddingX = 22
  const baseFontSize = 16

  const mergedStyle: CSSProperties = layoutScale && layoutScale !== 1
    ? {
        padding: `${Math.round(basePaddingY * layoutScale)}px ${Math.round(basePaddingX * layoutScale)}px`,
        fontSize: `${Math.round(baseFontSize * layoutScale)}px`,
        transition: 'padding 140ms cubic-bezier(.2,.8,.2,1), font-size 140ms cubic-bezier(.2,.8,.2,1)',
        ...style,
      }
    : {
        transform: `scale(${scale})`,
        transition: 'transform 120ms cubic-bezier(.2,.8,.2,1)',
        ...style,
      }

  return (
    <button ref={buttonRef} className="heart-btn" style={mergedStyle} {...rest}>
      {children}
    </button>
  )
}
