import { useEffect, useState } from 'react'
import { FiBookmark } from 'react-icons/fi'
import client from '../api/client'

export default function Saved() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const { data } = await client.get('/api/food/save')
        if (!cancelled) setItems(data.savedFoods)
      } catch (err) {
        if (!cancelled) {
          if (err.response?.status === 404) {
            setItems([])
          } else {
            setError(err.response?.data?.message || 'Failed to load saved videos')
          }
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  async function unsave(foodId) {
    setItems((prev) => prev.filter((s) => s.food?._id !== foodId))
    try {
      await client.post('/api/food/save', { foodId })
    } catch {
      // best-effort; a stale row is a minor inconvenience, not worth a full refetch
    }
  }

  return (
    <div className="min-h-[calc(100dvh-4rem)] px-4 py-6 md:min-h-screen md:px-8 md:py-10">
      <h1 className="text-2xl font-bold">Saved</h1>
      <p className="mt-1 text-sm text-ink-text/50">Videos you've bookmarked to come back to.</p>

      {loading && (
        <div className="mt-16 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-text/20 border-t-brand" />
        </div>
      )}

      {!loading && error && <p className="mt-8 text-ink-text/70">{error}</p>}

      {!loading && !error && items.length === 0 && (
        <div className="mt-16 flex flex-col items-center gap-2 text-center text-ink-text/50">
          <FiBookmark size={32} />
          <p>Nothing saved yet. Bookmark videos from the feed to see them here.</p>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {items.map(
            (item) =>
              item.food && (
                <div
                  key={item._id}
                  className="group relative aspect-[9/16] overflow-hidden rounded-xl bg-black text-white"
                >
                  <video
                    src={item.food.video}
                    controls
                    preload="metadata"
                    className="h-full w-full object-cover"
                  />
                  <button
                    onClick={() => unsave(item.food._id)}
                    className="pointer-events-auto absolute right-2 top-2 rounded-full bg-brand p-2 text-white shadow"
                    aria-label="Remove from saved"
                  >
                    <FiBookmark size={16} fill="currentColor" />
                  </button>
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <p className="truncate text-sm font-semibold">{item.food.name}</p>
                  </div>
                </div>
              )
          )}
        </div>
      )}
    </div>
  )
}
