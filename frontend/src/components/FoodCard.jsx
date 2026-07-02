import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiHeart, FiBookmark, FiVolume2, FiVolumeX, FiBookOpen } from 'react-icons/fi'
import RecipeModal from './RecipeModal'

export default function FoodCard({ food, active, cardRef, onToggleLike, onToggleSave }) {
  const videoRef = useRef(null)
  const [muted, setMuted] = useState(true)
  const [showRecipe, setShowRecipe] = useState(false)
  const hasRecipe = Boolean(food.recipe?.instructions || food.recipe?.ingredients?.length)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (active) {
      video.play().catch(() => {})
    } else {
      video.pause()
      video.currentTime = 0
    }
  }, [active])

  return (
    <div
      ref={cardRef}
      data-id={food._id}
      className="relative h-full w-full snap-start overflow-hidden bg-black md:mx-auto md:my-4 md:max-w-[420px] md:rounded-2xl"
    >
      <video
        ref={videoRef}
        src={food.video}
        loop
        muted={muted}
        playsInline
        preload="metadata"
        className="h-full w-full object-cover"
        onClick={() => setMuted((m) => !m)}
      />

      <button
        onClick={() => setMuted((m) => !m)}
        className="absolute right-4 top-4 rounded-full bg-black/40 p-2.5 text-white backdrop-blur transition hover:bg-black/60"
        aria-label={muted ? 'Unmute' : 'Mute'}
      >
        {muted ? <FiVolumeX size={18} /> : <FiVolume2 size={18} />}
      </button>

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/85 via-black/25 to-transparent p-4 pb-6">
        <div className="max-w-[72%] text-left">
          <h3 className="text-lg font-bold leading-tight">{food.name}</h3>
          {food.foodPartner?.name && (
            <Link
              to={`/partner/${food.foodPartner._id}`}
              className="mt-1 inline-block text-sm font-medium text-white/70 hover:text-brand"
            >
              @{food.foodPartner.name}
            </Link>
          )}
          {food.description && (
            <p className="mt-1.5 line-clamp-2 text-sm text-white/60">{food.description}</p>
          )}
        </div>

        <div className="flex flex-col items-center gap-4">
          <button onClick={() => onToggleLike(food._id)} className="flex flex-col items-center gap-1">
            <span
              className={`flex h-11 w-11 items-center justify-center rounded-full transition ${
                food.isLiked ? 'bg-brand text-white' : 'bg-black/40 text-white hover:bg-black/60'
              }`}
            >
              <FiHeart size={22} fill={food.isLiked ? 'currentColor' : 'none'} />
            </span>
            <span className="text-xs font-medium text-white/80">{food.likeCount ?? 0}</span>
          </button>

          <button onClick={() => onToggleSave(food._id)} className="flex flex-col items-center gap-1">
            <span
              className={`flex h-11 w-11 items-center justify-center rounded-full transition ${
                food.isSaved ? 'bg-brand text-white' : 'bg-black/40 text-white hover:bg-black/60'
              }`}
            >
              <FiBookmark size={20} fill={food.isSaved ? 'currentColor' : 'none'} />
            </span>
            <span className="text-xs font-medium text-white/80">{food.savesCount ?? 0}</span>
          </button>

          {hasRecipe && (
            <button onClick={() => setShowRecipe(true)} className="flex flex-col items-center gap-1">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/40 text-white transition hover:bg-black/60">
                <FiBookOpen size={20} />
              </span>
              <span className="text-xs font-medium text-white/80">Recipe</span>
            </button>
          )}
        </div>
      </div>

      {showRecipe && <RecipeModal food={food} onClose={() => setShowRecipe(false)} />}
    </div>
  )
}
