import { Star } from 'lucide-react';

const sizes = { sm: 'w-3.5 h-3.5', md: 'w-5 h-5', lg: 'w-6 h-6' };

export default function StarRating({ rating, max = 5, size = 'md', interactive = false, onChange }) {
  return (
    <section className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => i + 1).map(star => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(star)}
          className={interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}
        >
          <Star
            className={`${sizes[size]} ${
              star <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-neutral-300 dark:text-neutral-600 fill-neutral-300 dark:fill-neutral-600'
            } transition-colors`}
          />
        </button>
      ))}
    </section>
  );
}
