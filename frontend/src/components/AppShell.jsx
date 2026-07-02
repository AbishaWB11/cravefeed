import { NavLink } from 'react-router-dom'
import { FiHome, FiBookmark, FiUser, FiLogOut, FiPlusSquare } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from './ThemeToggle'

const linkBase =
  'flex flex-col items-center justify-center gap-1 text-xs md:flex-row md:justify-start md:gap-3 md:text-sm md:px-4 md:py-3 md:rounded-xl transition-colors'
const linkActive = 'text-brand md:bg-ink-text/10 md:text-ink-text'
const linkInactive = 'text-ink-text/50 hover:text-ink-text/80 md:hover:bg-ink-text/5'

export default function AppShell({ children }) {
  const { role, profile, logout } = useAuth()

  const userLinks = [
    { to: '/feed', label: 'Feed', icon: FiHome },
    { to: '/saved', label: 'Saved', icon: FiBookmark },
  ]

  const partnerLinks = [
    { to: '/partner/dashboard', label: 'Dashboard', icon: FiPlusSquare },
  ]

  const links = role === 'partner' ? partnerLinks : userLinks

  return (
    <div className="min-h-screen bg-ink text-ink-text md:flex">
      <ThemeToggle className="fixed right-3 top-3 z-40 bg-ink-soft/80 backdrop-blur md:hidden" />

      <nav className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-ink-text/10 bg-ink-soft/95 px-2 py-2 backdrop-blur md:static md:h-screen md:w-56 md:flex-col md:items-stretch md:justify-start md:gap-1 md:border-r md:border-t-0 md:p-4">
        <div className="hidden items-center justify-between gap-2 px-2 pb-6 md:flex">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tight text-brand">Crave</span>
            <span className="text-2xl font-black tracking-tight">Feed</span>
          </div>
          <ThemeToggle />
        </div>

        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}
          >
            <Icon size={22} />
            <span>{label}</span>
          </NavLink>
        ))}

        {role === 'partner' && profile?._id && (
          <NavLink
            to={`/partner/${profile._id}`}
            className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}
          >
            <FiUser size={22} />
            <span>My Profile</span>
          </NavLink>
        )}

        <button onClick={logout} className={`${linkBase} ${linkInactive} md:mt-auto`}>
          <FiLogOut size={22} />
          <span>Logout</span>
        </button>
      </nav>

      <main className="flex-1 pb-16 md:pb-0">{children}</main>
    </div>
  )
}
