import { lazy, memo, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, LazyMotion, MotionConfig, domAnimation, m as Motion } from 'framer-motion'
import { ArrowRight, Check, ChevronLeft, ChevronRight, Globe2, Headphones, PackageCheck, Plus, ShieldCheck, ShoppingBag, Sparkles, Star, X } from 'lucide-react'
import { Navbar } from './components/Navbar'
import { ProductCard } from './components/ProductCard'
import { categories, products, testimonials } from './data'

const Assistant = lazy(() => import('./components/Assistant').then((module) => ({ default: module.Assistant })))

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: .65, ease: [0.22, 1, 0.36, 1] },
}

const SectionHeading = memo(function SectionHeading({ eyebrow, title, action }) {
  return (
    <Motion.div {...reveal} className="mb-9 flex items-end justify-between gap-5 sm:mb-12">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="section-title">{title}</h2>
      </div>
      {action && <a href="#featured" className="hidden items-center gap-2 text-sm font-semibold sm:flex">{action} <ArrowRight size={16} /></a>}
    </Motion.div>
  )
})

function useCountdown() {
  const [seconds, setSeconds] = useState(8 * 3600 + 42 * 60 + 16)
  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => s > 0 ? s - 1 : 24 * 3600), 1000)
    return () => clearInterval(timer)
  }, [])
  return [
    Math.floor(seconds / 3600),
    Math.floor((seconds % 3600) / 60),
    seconds % 60,
  ].map((n) => String(n).padStart(2, '0'))
}

function FlashSaleCountdown() {
  const [hours, minutes, seconds] = useCountdown()

  return (
    <div className="mt-8 flex items-center gap-2 sm:gap-3" aria-label={`${hours} hours, ${minutes} minutes, ${seconds} seconds remaining`}>
      {[hours, minutes, seconds].map((time, index) => (
        <div key={index} className="flex items-center gap-2 sm:gap-3">
          <span className="grid size-14 place-items-center rounded-2xl bg-ink font-display text-xl font-bold text-white sm:size-16 sm:text-2xl">{time}</span>
          {index < 2 && <span className="font-display text-xl font-bold">:</span>}
        </div>
      ))}
    </div>
  )
}

function readThemePreference() {
  if (typeof window === 'undefined') {
    return false
  }

  return window.localStorage.getItem('aether-theme') === 'dark'
}

function readRecentProducts() {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    return JSON.parse(window.localStorage.getItem('aether-recent') || '[]')
      .map((item) => (typeof item === 'object' && item !== null ? item.id : item))
      .filter(Boolean)
  } catch {
    return []
  }
}

function readCartItems() {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const storedItems = JSON.parse(window.localStorage.getItem('aether-cart') || '[]')
    return Array.isArray(storedItems) ? storedItems : []
  } catch {
    return []
  }
}

export default function App() {
  const [dark, setDark] = useState(readThemePreference)
  const [toast, setToast] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [recentIds, setRecentIds] = useState(readRecentProducts)
  const [cartItems, setCartItems] = useState(readCartItems)
  const [cartOpen, setCartOpen] = useState(false)
  const [activeProduct, setActiveProduct] = useState(null)
  const toastTimerRef = useRef(null)

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', dark)
    }

    window.localStorage.setItem('aether-theme', dark ? 'dark' : 'light')
  }, [dark])

  useEffect(() => {
    window.localStorage.setItem('aether-cart', JSON.stringify(cartItems.map(({ id, quantity }) => ({ id, quantity }))))
  }, [cartItems])

  useEffect(() => () => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current)
    }
  }, [])

  const scheduleToastClear = useCallback(() => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current)
    }

    toastTimerRef.current = window.setTimeout(() => setToast(''), 2500)
  }, [])

  const addToCart = useCallback((product) => {
    setCartItems((current) => {
      const existing = current.find((item) => item.id === product.id)

      if (existing) {
        return current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      }

      return [...current, { id: product.id, quantity: 1 }]
    })
    setToast(`${product.name} added to your bag`)
    scheduleToastClear()
  }, [scheduleToastClear])

  const showNotice = useCallback((message) => {
    setToast(message)
    scheduleToastClear()
  }, [scheduleToastClear])

  const viewProduct = useCallback((product) => {
    setActiveProduct(product)
    setRecentIds((current) => {
      const next = [product.id, ...current.filter((id) => id !== product.id)].slice(0, 3)
      window.localStorage.setItem('aether-recent', JSON.stringify(next))
      return next
    })
  }, [])

  const openCart = useCallback(() => {
    setCartOpen(true)
  }, [])

  const closeCart = useCallback(() => {
    setCartOpen(false)
  }, [])

  const closeQuickView = useCallback(() => {
    setActiveProduct(null)
  }, [])

  const updateCartQuantity = useCallback((productId, delta) => {
    setCartItems((current) => current
      .map((item) => item.id === productId ? { ...item, quantity: item.quantity + delta } : item)
      .filter((item) => item.quantity > 0))
  }, [])

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0)
  const cartProducts = cartItems.map((item) => {
    const product = products.find((entry) => entry.id === item.id)
    return product ? { ...product, quantity: item.quantity } : null
  }).filter(Boolean)
  const cartTotal = cartProducts.reduce((total, item) => total + (item.price * item.quantity), 0)

  const toggleTheme = useCallback(() => {
    setDark((current) => !current)
  }, [])

  const featureProducts = products.slice(0, 6)
  const recent = recentIds
    .map((id) => products.find((product) => product.id === id))
    .filter(Boolean)

  return (
    <LazyMotion features={domAnimation}>
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen overflow-hidden bg-paper text-ink transition-colors duration-300 dark:bg-[#0d0e11] dark:text-white">
        <a href="#main-content" className="fixed left-4 top-3 z-[100] -translate-y-20 rounded-full bg-ink px-4 py-2 text-sm font-bold text-white transition focus:translate-y-0 dark:bg-white dark:text-ink">
          Skip to content
        </a>
        <Navbar dark={dark} onTheme={toggleTheme} cartCount={cartCount} onNotice={showNotice} onCartOpen={openCart} />

        <main id="main-content">
        <section className="relative px-4 pb-14 pt-28 sm:px-6 sm:pb-20 sm:pt-32">
          <div className="pointer-events-none absolute left-[-10%] top-16 size-[38rem] rounded-full bg-[#cad6ff]/35 blur-3xl dark:bg-[#263e9d]/20" />
          <div className="relative mx-auto grid min-h-[680px] max-w-7xl overflow-hidden rounded-[2rem] bg-[#101522] text-white md:grid-cols-[.9fr_1.1fr] lg:min-h-[720px] lg:rounded-[2.75rem]">
            <Motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .8 }} className="relative z-10 flex flex-col justify-center px-6 pb-8 pt-12 sm:px-12 md:py-16 lg:px-16">
              <div className="mb-7 flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-2 text-xs font-semibold backdrop-blur">
                <Sparkles size={14} className="text-acid" /> The new Aether Arc One
              </div>
              <h1 className="max-w-xl font-display text-[3.25rem] font-semibold leading-[.95] tracking-[-.065em] sm:text-6xl lg:text-[5.25rem]">
                Sound,<br />reimagined.
              </h1>
              <p className="mt-6 max-w-md text-base leading-relaxed text-white/60 sm:text-lg">
                Spatial clarity. All-day comfort. A listening experience engineered to disappear.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <a href="#featured" className="button-primary bg-white text-ink hover:bg-acid">Shop Arc One <ArrowRight size={17} /></a>
                <a href="#why-aether" className="button-secondary border-white/20 bg-white/5 text-white hover:bg-white/10">Explore the story</a>
              </div>
              <div className="mt-12 flex items-center gap-6 text-sm text-white/55">
                <span><strong className="block text-lg text-white">40 hr</strong> battery</span>
                <span className="h-9 w-px bg-white/15" />
                <span><strong className="block text-lg text-white">218 g</strong> weight</span>
                <span className="h-9 w-px bg-white/15" />
                <span><strong className="block text-lg text-white">Hi-Res</strong> wireless</span>
              </div>
            </Motion.div>
            <Motion.div initial={{ opacity: 0, scale: 1.08 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.1, ease: 'easeOut' }} className="relative min-h-[340px] overflow-hidden md:min-h-full">
              <img src="/hero-aether-arc.webp" alt="Aether Arc One silver over-ear headphones" width="1536" height="1024" fetchPriority="high" loading="eager" decoding="async" sizes="(min-width: 768px) 52vw, 100vw" className="absolute inset-0 h-full w-full object-cover object-center md:object-[58%_center]" />
              <div className="absolute inset-0 bg-gradient-to-b from-[#101522] via-transparent to-[#101522]/40 md:bg-gradient-to-r md:from-[#101522] md:via-transparent md:to-transparent" />
              <Motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} className="absolute bottom-6 right-6 rounded-2xl border border-white/15 bg-black/25 px-4 py-3 backdrop-blur-xl sm:bottom-10 sm:right-10">
                <span className="text-xs text-white/55">Starting at</span>
                <strong className="block font-display text-xl">$349</strong>
              </Motion.div>
            </Motion.div>
          </div>
        </section>

        <section id="collections" className="section-shell">
          <SectionHeading eyebrow="Find your orbit" title="Trending categories" action="View all categories" />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
            {categories.map((category, i) => (
              <Motion.a {...reveal} transition={{ ...reveal.transition, delay: i * .08 }} href="#featured" key={category.name} className={`${category.color} group relative flex min-h-52 flex-col justify-between overflow-hidden rounded-[1.75rem] p-5 text-ink sm:min-h-64 sm:p-7`}>
                <span className="text-xs font-semibold uppercase tracking-wider text-black/50">{category.count}</span>
                <span className="absolute right-[-8%] top-[18%] text-[7rem] font-light opacity-20 transition duration-500 group-hover:rotate-12 group-hover:scale-110 sm:text-[9rem]">{category.icon}</span>
                <div className="relative flex items-end justify-between">
                  <h3 className="font-display text-xl font-bold sm:text-2xl">{category.name}</h3>
                  <span className="grid size-9 place-items-center rounded-full bg-ink text-white transition group-hover:translate-x-1"><ArrowRight size={16} /></span>
                </div>
              </Motion.a>
            ))}
          </div>
        </section>

        <section id="featured" className="section-shell !pt-10 sm:!pt-12">
          <SectionHeading eyebrow="Objects of desire" title="The Aether edit" action="Shop all products" />
          <div className="grid grid-cols-2 gap-x-3 gap-y-10 lg:grid-cols-3 lg:gap-x-6 lg:gap-y-14">
            {featureProducts.map((product) => <ProductCard key={product.id} product={product} onView={viewProduct} onAdd={addToCart} />)}
          </div>
        </section>

        <section className="section-shell">
          <Motion.div {...reveal} className="relative overflow-hidden rounded-[2rem] bg-[#d9ff64] p-6 text-ink sm:p-10 lg:grid lg:grid-cols-[1fr_.85fr] lg:p-14">
            <div className="relative z-10">
              <p className="eyebrow text-black/50">One day only</p>
              <h2 className="mt-4 max-w-xl font-display text-4xl font-bold leading-[1.03] tracking-[-.055em] sm:text-6xl">Make room for better sound.</h2>
              <p className="mt-5 max-w-md text-black/60">Save 30% on selected audio essentials until the signal fades.</p>
              <FlashSaleCountdown />
              <a href="#featured" className="button-primary mt-8">Shop flash sale <ArrowRight size={17} /></a>
            </div>
            <div className="relative mt-10 flex min-h-64 items-center justify-center lg:mt-0">
              <div className="absolute size-64 rounded-full border border-black/10 sm:size-80" />
              <div className="absolute size-48 rounded-full border border-black/10 sm:size-60" />
              <Motion.img src="/products/arc-one.webp" alt="" aria-hidden="true" width="1024" height="1024" loading="lazy" decoding="async" animate={{ rotate: [0, 3, -2, 0], y: [0, -8, 0] }} transition={{ duration: 6, repeat: Infinity }} className="relative size-60 rounded-full object-cover shadow-2xl sm:size-72" />
              <span className="absolute right-[5%] top-[5%] grid size-20 rotate-12 place-items-center rounded-full bg-aether font-display text-lg font-bold text-white shadow-glow sm:size-24">−30%</span>
            </div>
          </Motion.div>
        </section>

        <section id="why-aether" className="section-shell">
          <SectionHeading eyebrow="The Aether standard" title="Better, by design." />
          <div className="grid gap-px overflow-hidden rounded-[2rem] border border-black/5 bg-black/5 dark:border-white/10 dark:bg-white/10 md:grid-cols-2 lg:grid-cols-4">
            {[
              [PackageCheck, 'Curated, never crowded', 'Every object is tested for quality, utility, and staying power.'],
              [Globe2, 'Planet considered', 'Carbon-neutral delivery and lower-impact packaging, standard.'],
              [ShieldCheck, 'Two-year promise', 'Extra coverage on every product, with no hidden fine print.'],
              [Headphones, 'Human support', 'Real product experts, ready when you need a second opinion.'],
            ].map(([Icon, title, text], i) => (
              <Motion.div {...reveal} transition={{ ...reveal.transition, delay: i * .08 }} key={title} className="bg-paper p-7 dark:bg-[#121317] sm:p-9">
                <div className="mb-10 grid size-11 place-items-center rounded-xl bg-black text-white dark:bg-white dark:text-black"><Icon size={20} /></div>
                <h3 className="font-display text-xl font-bold">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-black/55 dark:text-white/50">{text}</p>
              </Motion.div>
            ))}
          </div>
        </section>

        <section className="section-shell">
          <SectionHeading eyebrow="In good company" title="Loved in the real world." />
          <div className="grid gap-4 lg:grid-cols-3">
            {testimonials.map((item, i) => (
              <Motion.figure {...reveal} transition={{ ...reveal.transition, delay: i * .1 }} key={item.name} className="flex min-h-80 flex-col justify-between rounded-[1.75rem] bg-white p-7 shadow-sm dark:bg-[#17181d] sm:p-9">
                <div>
                  <div className="mb-6 flex gap-1 text-aether">{[1,2,3,4,5].map((x) => <Star key={x} size={14} fill="currentColor" />)}</div>
                  <blockquote className="font-display text-xl font-semibold leading-relaxed tracking-tight">“{item.quote}”</blockquote>
                </div>
                <figcaption className="mt-8 flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-full bg-[#e8e1ff] text-xs font-bold text-ink">{item.initials}</span>
                  <span><strong className="block text-sm">{item.name}</strong><span className="text-xs text-black/45 dark:text-white/45">{item.role}</span></span>
                </figcaption>
              </Motion.figure>
            ))}
          </div>
        </section>

        {recent.length > 0 && (
          <section className="section-shell !pt-4">
            <SectionHeading eyebrow="Your trail" title="Recently viewed" />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:max-w-4xl">
              {recent.map((product) => <ProductCard key={product.id} product={product} onAdd={addToCart} />)}
            </div>
          </section>
        )}

        <section className="section-shell">
          <Motion.div {...reveal} className="relative overflow-hidden rounded-[2rem] bg-aether px-6 py-14 text-center text-white sm:px-12 sm:py-20">
            <div className="absolute -left-20 -top-24 size-72 rounded-full border-[50px] border-white/5" />
            <div className="absolute -bottom-40 -right-20 size-96 rounded-full border-[70px] border-white/5" />
            <p className="eyebrow text-white/60">Stay in the loop</p>
            <h2 className="relative mx-auto mt-4 max-w-2xl font-display text-4xl font-bold leading-tight tracking-[-.05em] sm:text-5xl">Good things, thoughtfully delivered.</h2>
            <p className="relative mx-auto mt-4 max-w-lg text-white/65">New arrivals, field notes, and members-only offers. Never noise.</p>
            {subscribed ? (
              <div role="status" className="relative mx-auto mt-8 flex max-w-md items-center justify-center gap-2 rounded-2xl bg-white px-5 py-4 font-semibold text-ink">
                <Check size={18} className="text-aether" /> You’re on the list.
              </div>
            ) : (
              <form onSubmit={(event) => { event.preventDefault(); setSubscribed(true) }} className="relative mx-auto mt-8 flex max-w-md flex-col gap-2 rounded-2xl bg-white p-2 sm:flex-row">
                <label htmlFor="email" className="sr-only">Email address</label>
                <input id="email" type="email" required autoComplete="email" placeholder="Email address" className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-ink outline-none placeholder:text-black/40" />
                <button type="submit" className="button-primary justify-center whitespace-nowrap">Join the list <ArrowRight size={16} /></button>
              </form>
            )}
          </Motion.div>
        </section>
        </main>

        <footer className="border-t border-black/10 px-4 pb-8 pt-14 dark:border-white/10 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-10 pb-14 sm:grid-cols-2 lg:grid-cols-[1.7fr_1fr_1fr_1fr]">
              <div>
                <a href="#" className="font-display text-2xl font-extrabold tracking-[-.06em]">ÆTHER<span className="text-aether">.</span></a>
                <p className="mt-4 max-w-xs text-sm leading-relaxed text-black/50 dark:text-white/45">Remarkable technology for a more considered life.</p>
              </div>
              {[
                ['Shop', 'New arrivals', 'Audio', 'Wearables', 'Home'],
                ['About', 'Our story', 'Journal', 'Sustainability', 'Careers'],
                ['Help', 'Contact', 'Shipping', 'Returns', 'Warranty'],
              ].map(([title, ...links]) => (
                <div key={title}>
                  <h3 className="mb-4 text-sm font-bold">{title}</h3>
                  <div className="space-y-3">{links.map((link) => <a key={link} href="#" className="block text-sm text-black/50 transition hover:text-black dark:text-white/45 dark:hover:text-white">{link}</a>)}</div>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-4 border-t border-black/10 pt-6 text-xs text-black/40 dark:border-white/10 dark:text-white/35 sm:flex-row sm:items-center sm:justify-between">
              <p>© 2026 Aether Commerce. Made for what’s next.</p>
              <div className="flex gap-5"><a href="#">Privacy</a><a href="#">Terms</a><a href="#">Accessibility</a></div>
            </div>
          </div>
        </footer>

        <AnimatePresence>
          {cartOpen && (
            <>
              <Motion.button
                type="button"
                aria-label="Close cart drawer"
                onClick={closeCart}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[70] cursor-default bg-black/45 backdrop-blur-[2px]"
              />
              <Motion.aside
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween', duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="fixed right-0 top-0 z-[80] flex h-full w-full max-w-md flex-col border-l border-black/5 bg-white shadow-2xl dark:border-white/10 dark:bg-[#101114]"
                aria-label="Shopping cart drawer"
              >
                <div className="flex items-center justify-between border-b border-black/5 px-6 py-5 dark:border-white/10">
                  <div>
                    <p className="eyebrow">Bag</p>
                    <h2 className="font-display text-2xl font-bold">Your cart</h2>
                  </div>
                  <button type="button" onClick={closeCart} className="icon-button" aria-label="Close cart">
                    <X size={18} />
                  </button>
                </div>
                <div className="flex-1 overflow-auto px-6 py-5">
                  {cartProducts.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                      <ShoppingBag size={28} className="text-black/25 dark:text-white/25" />
                      <p className="mt-4 font-display text-2xl font-bold">Your bag is empty</p>
                      <p className="mt-2 max-w-xs text-sm text-black/50 dark:text-white/45">Add a product to see it here with quantity controls and checkout.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cartProducts.map((item) => (
                        <article key={item.id} className="flex gap-4 rounded-[1.5rem] bg-black/3 p-3 dark:bg-white/5">
                          <img src={item.image} alt={item.name} width="160" height="160" loading="lazy" decoding="async" className="size-20 rounded-2xl object-cover" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black/45 dark:text-white/40">{item.category}</p>
                            <h3 className="mt-1 truncate font-display text-lg font-bold">{item.name}</h3>
                            <div className="mt-2 flex items-center justify-between gap-3">
                              <span className="font-display text-lg font-bold">${item.price}</span>
                              <div className="flex items-center rounded-full border border-black/10 dark:border-white/10">
                                <button type="button" onClick={() => updateCartQuantity(item.id, -1)} className="grid size-9 place-items-center rounded-full text-lg font-bold hover:bg-black/5 dark:hover:bg-white/10" aria-label={`Decrease quantity for ${item.name}`}>
                                  <ChevronLeft size={16} />
                                </button>
                                <span className="min-w-8 text-center text-sm font-semibold">{item.quantity}</span>
                                <button type="button" onClick={() => updateCartQuantity(item.id, 1)} className="grid size-9 place-items-center rounded-full text-lg font-bold hover:bg-black/5 dark:hover:bg-white/10" aria-label={`Increase quantity for ${item.name}`}>
                                  <ChevronRight size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
                <div className="border-t border-black/5 px-6 py-5 dark:border-white/10">
                  <div className="flex items-center justify-between text-sm text-black/55 dark:text-white/45">
                    <span>Subtotal</span>
                    <span className="font-semibold text-black dark:text-white">${cartTotal.toFixed(2)}</span>
                  </div>
                  <button type="button" className="button-primary mt-4 w-full justify-center" disabled={cartProducts.length === 0}>
                    Checkout
                  </button>
                </div>
              </Motion.aside>
            </>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {activeProduct && (
            <>
              <Motion.button
                type="button"
                aria-label="Close quick view"
                onClick={closeQuickView}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[90] cursor-default bg-black/55"
              />
              <Motion.div
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 10 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="fixed left-1/2 top-1/2 z-[100] w-[min(92vw,52rem)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[2rem] bg-white shadow-2xl dark:bg-[#101114]"
                role="dialog"
                aria-modal="true"
                aria-label={`${activeProduct.name} quick view`}
              >
                <div className="grid md:grid-cols-[1fr_1fr]">
                  <div className="relative bg-black/5 dark:bg-white/5">
                    <img src={activeProduct.image} alt={activeProduct.name} width="1024" height="1024" loading="eager" decoding="async" className="h-full w-full object-cover" />
                  </div>
                  <div className="p-6 sm:p-8">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="eyebrow">Quick view</p>
                        <h2 className="mt-2 font-display text-3xl font-bold">{activeProduct.name}</h2>
                      </div>
                      <button type="button" onClick={closeQuickView} className="icon-button" aria-label="Close quick view">
                        <X size={18} />
                      </button>
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-black/60 dark:text-white/55">{activeProduct.description}</p>
                    <div className="mt-5 flex items-center gap-2 text-sm text-black/60 dark:text-white/55">
                      <Star size={14} fill="currentColor" />
                      <span>{activeProduct.rating}</span>
                      <span>•</span>
                      <span>{activeProduct.reviews} reviews</span>
                    </div>
                    <div className="mt-6 flex items-center justify-between rounded-2xl bg-black/3 px-4 py-3 dark:bg-white/5">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black/45 dark:text-white/40">Price</p>
                        <p className="font-display text-3xl font-bold">${activeProduct.price}</p>
                      </div>
                      <button type="button" onClick={() => addToCart(activeProduct)} className="button-primary">
                        Add to cart <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </Motion.div>
            </>
          )}
        </AnimatePresence>

        <Suspense fallback={null}>
          <Assistant />
        </Suspense>
        <AnimatePresence>
          {toast && (
            <Motion.div role="status" aria-live="polite" aria-atomic="true" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="fixed bottom-6 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white shadow-float dark:bg-white dark:text-ink">
              <Check size={16} /> {toast}
            </Motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
    </LazyMotion>
  )
}
