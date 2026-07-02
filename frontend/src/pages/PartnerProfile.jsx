import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { FiMapPin, FiPhone, FiVideo } from 'react-icons/fi'
import client from '../api/client'

export default function PartnerProfile() {
  const { id } = useParams()
  const [partner, setPartner] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const { data } = await client.get(`/api/food-partner/${id}`)
        if (!cancelled) setPartner(data.foodPartner)
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to load profile')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return (
      <div className="flex h-[calc(100dvh-4rem)] items-center justify-center md:h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-text/20 border-t-brand" />
      </div>
    )
  }

  if (error || !partner) {
    return (
      <div className="flex h-[calc(100dvh-4rem)] items-center justify-center px-6 text-center text-ink-text/70 md:h-screen">
        {error || 'Partner not found'}
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100dvh-4rem)] px-4 py-6 md:min-h-screen md:px-8 md:py-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center gap-4 rounded-2xl border border-ink-text/10 bg-ink-soft p-6">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand text-2xl font-bold text-white">
            {partner.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold">{partner.name}</h1>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-text/50">
              {partner.address && (
                <span className="flex items-center gap-1">
                  <FiMapPin size={14} /> {partner.address}
                </span>
              )}
              {partner.phone && (
                <span className="flex items-center gap-1">
                  <FiPhone size={14} /> {partner.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        <h2 className="mb-4 mt-8 font-semibold">
          Videos {partner.foodItems?.length ? `(${partner.foodItems.length})` : ''}
        </h2>

        {(!partner.foodItems || partner.foodItems.length === 0) && (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-ink-text/10 py-16 text-center text-ink-text/50">
            <FiVideo size={28} />
            <p>No videos posted yet.</p>
          </div>
        )}

        {partner.foodItems?.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {partner.foodItems.map((item) => (
              <div key={item._id} className="relative aspect-[9/16] overflow-hidden rounded-xl bg-black text-white">
                <video src={item.video} controls preload="metadata" className="h-full w-full object-cover" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                  <p className="truncate text-sm font-semibold">{item.name}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
