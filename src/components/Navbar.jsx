import { AnimatePresence, m as Motion } from 'framer-motion'
import { Menu, Moon, Search, ShoppingBag, Sun, X } from 'lucide-react'
import { memo, useState } from 'react'

const links = ['New in', 'Shop', 'Collections', 'Journal']

export const Navbar = memo(function Navbar({ dark, onTheme, cartCount, onNotice, onCartOpen }) {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between rounded-2xl border border-black/5 bg-white/80 px-4 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-[#101114]/80 sm:px-6">
        <a href="#" className="font-display text-xl font-extrabold tracking-[-0.06em]" aria-label="Aether home">
          ÆTHER<span className="text-aether">.</span>
        </a>
        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => <a key={link} href={`#${link.toLowerCase().replace(' ', '-')}`} className="text-sm font-medium text-black/65 transition hover:text-black dark:text-white/65 dark:hover:text-white">{link}</a>)}
        </div>
        <div className="flex items-center gap-1">
          <button type="button" className="icon-button" onClick={() => onNotice('Search is ready for the full-store build')} aria-label="Search"><Search size={18} /></button>
          <button type="button" className="icon-button" onClick={onTheme} aria-label={`Switch to ${dark ? 'light' : 'dark'} theme`}>
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button type="button" className="icon-button relative" onClick={onCartOpen || (() => onNotice(cartCount ? `${cartCount} item${cartCount > 1 ? 's' : ''} in your bag` : 'Your bag is currently empty'))} aria-label={`Cart with ${cartCount} items`}>
            <ShoppingBag size={18} />
            {cartCount > 0 && <span className="absolute right-0 top-0 grid size-4 place-items-center rounded-full bg-aether text-[9px] font-bold text-white">{cartCount}</span>}
          </button>
          <button
            type="button"
            className="icon-button md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            {open ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </nav>
      <AnimatePresence>
        {open && (
          <Motion.div id="mobile-menu" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mx-auto mt-2 max-w-7xl rounded-2xl border border-black/5 bg-white p-4 shadow-float dark:border-white/10 dark:bg-[#17181d] md:hidden">
            {links.map((link) => <a onClick={() => setOpen(false)} key={link} href={`#${link.toLowerCase().replace(' ', '-')}`} className="block rounded-xl px-4 py-3 font-medium hover:bg-black/5 dark:hover:bg-white/5">{link}</a>)}
          </Motion.div>
        )}
      </AnimatePresence>
    </header>
  )
})
