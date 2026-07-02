import { FiX } from 'react-icons/fi'

export default function RecipeModal({ food, onClose }) {
  const recipe = food.recipe

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full overflow-y-auto rounded-t-2xl bg-ink-soft p-6 sm:max-w-lg sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">{food.name}</h2>
            {food.foodPartner?.name && <p className="mt-0.5 text-sm text-ink-text/50">@{food.foodPartner.name}</p>}
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-full bg-ink-text/10 p-2 text-ink-text/70 hover:bg-ink-text/20 hover:text-ink-text"
            aria-label="Close recipe"
          >
            <FiX size={20} />
          </button>
        </div>

        {recipe?.ingredients?.length > 0 && (
          <div className="mt-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-text/50">Ingredients</h3>
            <ul className="mt-2 space-y-1.5">
              {recipe.ingredients.map((ingredient, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-ink-text/90">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand" />
                  {ingredient}
                </li>
              ))}
            </ul>
          </div>
        )}

        {recipe?.instructions && (
          <div className="mt-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-text/50">Instructions</h3>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-text/90">{recipe.instructions}</p>
          </div>
        )}

        {recipe?.sourceName && (
          <p className="mt-6 text-xs text-ink-text/40">
            Recipe from{' '}
            {recipe.sourceUrl ? (
              <a href={recipe.sourceUrl} target="_blank" rel="noreferrer" className="underline hover:text-ink-text/70">
                {recipe.sourceName}
              </a>
            ) : (
              recipe.sourceName
            )}
          </p>
        )}
      </div>
    </div>
  )
}
