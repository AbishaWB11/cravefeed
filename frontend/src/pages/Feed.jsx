import { useCallback, useEffect, useRef, useState } from 'react'
import client from '../api/client'
import FoodCard from '../components/FoodCard'

export default function Feed() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeId, setActiveId] = useState(null)
  const containerRef = useRef(null)
  const cardRefs = useRef({})

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const { data } = await client.get('/api/food/')
        if (!cancelled) setItems(data.foodItems)
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to load feed')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!items.length) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            setActiveId(entry.target.dataset.id)
          }
        })
      },
      { root: containerRef.current, threshold: [0.6] }
    )
    Object.values(cardRefs.current).forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [items])

  const setCardRef = useCallback(
    (id) => (el) => {
      if (el) cardRefs.current[id] = el
      else delete cardRefs.current[id]
    },
    []
  )

  async function toggleLike(id) {
    setItems((prev) =>
      prev.map((f) =>
        f._id === id ? { ...f, isLiked: !f.isLiked, likeCount: f.likeCount + (f.isLiked ? -1 : 1) } : f
      )
    )
    try {
      await client.post('/api/food/like', { foodId: id })
    } catch {
      setItems((prev) =>
        prev.map((f) =>
          f._id === id ? { ...f, isLiked: !f.isLiked, likeCount: f.likeCount + (f.isLiked ? -1 : 1) } : f
        )
      )
    }
  }

  async function toggleSave(id) {
    setItems((prev) =>
      prev.map((f) =>
        f._id === id ? { ...f, isSaved: !f.isSaved, savesCount: f.savesCount + (f.isSaved ? -1 : 1) } : f
      )
    )
    try {
      await client.post('/api/food/save', { foodId: id })
    } catch {
      setItems((prev) =>
        prev.map((f) =>
          f._id === id ? { ...f, isSaved: !f.isSaved, savesCount: f.savesCount + (f.isSaved ? -1 : 1) } : f
        )
      )
    }
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100dvh-4rem)] items-center justify-center md:h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-text/20 border-t-brand" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[calc(100dvh-4rem)] flex-col items-center justify-center gap-2 px-6 text-center md:h-screen">
        <p className="text-ink-text/70">{error}</p>
      </div>
    )
  }

  if (!items.length) {
    return (
      <div className="flex h-[calc(100dvh-4rem)] flex-col items-center justify-center gap-2 px-6 text-center md:h-screen">
        <p className="text-lg font-semibold">No videos yet</p>
        <p className="text-sm text-ink-text/50">Check back soon for food from local partners.</p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="h-[calc(100dvh-4rem)] w-full snap-y-mandatory overflow-y-scroll no-scrollbar md:h-screen"
    >
      {items.map((food) => (
        <FoodCard
          key={food._id}
          food={food}
          active={activeId === food._id}
          cardRef={setCardRef(food._id)}
          onToggleLike={toggleLike}
          onToggleSave={toggleSave}
        />
      ))}
    </div>
  )
}
