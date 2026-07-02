import { Link } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-ink px-4 py-10">
      <ThemeToggle className="absolute right-4 top-4" />

      <div className="w-full max-w-sm">
        <Link to="/" className="mb-8 block text-center text-2xl font-black tracking-tight">
          Crave<span className="text-brand">Feed</span>
        </Link>

        <div className="rounded-2xl border border-ink-text/10 bg-ink-soft p-6 shadow-xl sm:p-8">
          <h1 className="text-xl font-bold">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-ink-text/50">{subtitle}</p>}

          <div className="mt-6">{children}</div>
        </div>

        {footer && <div className="mt-6 text-center text-sm text-ink-text/50">{footer}</div>}
      </div>
    </div>
  )
}
