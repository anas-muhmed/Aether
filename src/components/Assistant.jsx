import { AnimatePresence, m as Motion } from 'framer-motion'
import { Bot, ChevronRight, Sparkles, X } from 'lucide-react'
import { memo, useState } from 'react'

const prompts = ['Best desk upgrades under $200', 'A gift for a music lover', 'Build my focus setup']

export const Assistant = memo(function Assistant() {
  const [open, setOpen] = useState(false)
  const [answer, setAnswer] = useState(null)

  return (
    <div className="fixed bottom-5 right-4 z-50 sm:bottom-7 sm:right-7">
      <AnimatePresence>
        {open && (
          <Motion.aside
            initial={{ opacity: 0, y: 20, scale: .96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: .96 }}
            className="mb-3 w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#15161b] text-white shadow-2xl"
            aria-label="AI shopping assistant"
          >
            <div className="flex items-start justify-between bg-gradient-to-br from-[#2f51ec] to-[#7346d8] p-5">
              <div>
                <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-white/15"><Sparkles size={18} /></div>
                <h2 className="font-display text-xl font-bold">Ask Aether</h2>
                <p className="mt-1 text-sm text-white/70">Your personal product curator.</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-full p-2 hover:bg-white/10" aria-label="Close assistant"><X size={18} /></button>
            </div>
            <div className="p-4">
              {answer ? (
                <div>
                  <p className="rounded-2xl bg-white/7 p-4 text-sm leading-relaxed text-white/80">
                    I’d pair the <strong className="text-white">Form Mechanical Keys</strong> with the <strong className="text-white">Aura Ambient Light</strong>—a tactile, low-distraction setup for $318.
                  </p>
                  <button type="button" onClick={() => setAnswer(null)} className="mt-3 text-xs font-semibold text-white/55 hover:text-white">← Ask something else</button>
                </div>
              ) : (
                <>
                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-white/40">Try asking</p>
                  <div className="space-y-2">
                    {prompts.map((prompt) => (
                      <button type="button" key={prompt} onClick={() => setAnswer(prompt)} className="flex w-full items-center justify-between rounded-xl bg-white/5 px-4 py-3 text-left text-sm transition hover:bg-white/10">
                        {prompt}<ChevronRight size={15} className="text-white/40" />
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </Motion.aside>
        )}
      </AnimatePresence>
      <Motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: .95 }}
        onClick={() => setOpen(!open)}
        className="ml-auto flex size-14 items-center justify-center rounded-full bg-ink text-white shadow-float ring-4 ring-white/60 dark:bg-white dark:text-ink dark:ring-black/30"
        aria-label="Open AI shopping assistant"
      >
        {open ? <X size={21} /> : <Bot size={22} />}
      </Motion.button>
    </div>
  )
})
