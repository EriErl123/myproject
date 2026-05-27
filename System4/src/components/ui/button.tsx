import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>

export function Button({ className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.7)] transition hover:border-white/20 hover:bg-white/10',
        className,
      )}
      {...props}
    />
  )
}
