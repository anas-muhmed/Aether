import { memo, useState } from 'react'
import { m as Motion } from 'framer-motion'
import { Heart, Plus, Star } from 'lucide-react'

export const ProductCard = memo(function ProductCard({ product, onView, onAdd }) {
  const [saved, setSaved] = useState(false)

  return (
    <Motion.article
      whileHover={{ y: -6 }}
      initial={false}
      className="group min-w-0"
    >
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onView?.(product)
          }
        }}
        className="relative flex aspect-[4/4.6] w-full cursor-pointer items-center justify-center overflow-hidden rounded-[1.75rem] text-left"
        style={{ backgroundColor: product.color }}
        onClick={() => onView?.(product)}
      >
        {product.badge && (
          <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-ink backdrop-blur">
            {product.badge}
          </span>
        )}
        <button
          type="button"
          aria-label={`${saved ? 'Remove' : 'Save'} ${product.name}`}
          aria-pressed={saved}
          onClick={(event) => {
            event.stopPropagation()
            setSaved(!saved)
          }}
          className="absolute right-4 top-4 z-10 grid size-9 place-items-center rounded-full bg-white/80 text-ink transition hover:bg-white"
        >
          <Heart size={16} fill={saved ? 'currentColor' : 'none'} />
        </button>
        <img
          src={product.image}
          alt={product.name}
          width="1024"
          height="1024"
          loading="lazy"
          decoding="async"
          sizes="(min-width: 1024px) 29vw, (min-width: 640px) 44vw, 50vw"
          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
        />
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onAdd(product)
          }}
          className="absolute bottom-4 right-4 grid size-11 translate-y-16 place-items-center rounded-full bg-ink text-white shadow-lg transition duration-300 group-hover:translate-y-0 focus:translate-y-0 dark:bg-white dark:text-ink"
          aria-label={`Add ${product.name} to cart`}
        >
          <Plus size={19} />
        </button>
      </div>
      <div className="px-1 pt-4">
        <div className="mb-1 flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black/45 dark:text-white/45">{product.category}</p>
          <span className="flex items-center gap-1 text-xs"><Star size={12} fill="currentColor" /> {product.rating}</span>
        </div>
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg font-semibold tracking-tight">{product.name}</h3>
          <span className="font-display text-lg font-bold">${product.price}</span>
        </div>
      </div>
    </Motion.article>
  )
})
