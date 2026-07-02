import { Link } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'

export default function Landing() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-ink via-ink to-ink-soft px-6 py-12 text-center">
      <ThemeToggle className="absolute right-4 top-4" />

      <h1 className="text-5xl font-black tracking-tight sm:text-6xl">
        Crave<span className="text-brand">Feed</span>
      </h1>
      <p className="mt-4 max-w-md text-balance text-ink-text/60">
        Bite-sized food videos from local kitchens. Scroll, like, save the ones you'll actually cook or crave.
      </p>

      <p className="mt-10 text-sm font-medium text-ink-text/50">Continue as</p>

      <div className="mt-4 grid w-full max-w-2xl gap-4 sm:grid-cols-2">
        <div className="flex flex-col items-center rounded-2xl border border-ink-text/10 bg-ink-soft p-6 text-center shadow-xl">
          <h2 className="text-lg font-bold">I'm hungry</h2>
          <p className="mt-1 text-sm text-ink-text/50">Browse and save food videos from local kitchens.</p>
          <div className="mt-5 grid w-full gap-2">
            <Link
              to="/login"
              className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="rounded-lg border border-ink-text/15 px-4 py-2.5 text-sm font-semibold text-ink-text/90 transition hover:bg-ink-text/5"
            >
              Create an account
            </Link>
          </div>
        </div>

        <div className="flex flex-col items-center rounded-2xl border border-ink-text/10 bg-ink-soft p-6 text-center shadow-xl">
          <h2 className="text-lg font-bold">I run a food business</h2>
          <p className="mt-1 text-sm text-ink-text/50">Upload videos and reach hungry customers nearby.</p>
          <div className="mt-5 grid w-full gap-2">
            <Link
              to="/partner/login"
              className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
            >
              Sign in
            </Link>
            <Link
              to="/partner/register"
              className="rounded-lg border border-ink-text/15 px-4 py-2.5 text-sm font-semibold text-ink-text/90 transition hover:bg-ink-text/5"
            >
              Register your business
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
