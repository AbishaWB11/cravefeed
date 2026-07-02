import { useEffect, useRef, useState } from 'react'
import { FiUploadCloud, FiVideo } from 'react-icons/fi'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'
import { inputClass, labelClass, buttonClass, errorClass } from '../components/formStyles'

export default function PartnerDashboard() {
  const { profile } = useAuth()
  const [items, setItems] = useState([])
  const [itemsLoading, setItemsLoading] = useState(true)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileInputRef = useRef(null)

  async function loadItems() {
    setItemsLoading(true)
    try {
      const { data } = await client.get('/api/food/mine')
      setItems(data.foodItems ?? [])
    } catch {
      setItems([])
    } finally {
      setItemsLoading(false)
    }
  }

  useEffect(() => {
    loadItems()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?._id])

  function handleFileChange(e) {
    const selected = e.target.files?.[0]
    if (!selected) return
    setFile(selected)
    setPreviewUrl(URL.createObjectURL(selected))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!file) {
      setError('Please choose a video to upload.')
      return
    }

    const formData = new FormData()
    formData.append('mama', file)
    formData.append('name', name)
    formData.append('description', description)

    setSubmitting(true)
    try {
      await client.post('/api/food/', formData)
      setSuccess('Video uploaded successfully!')
      setName('')
      setDescription('')
      setFile(null)
      setPreviewUrl(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      loadItems()
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-[calc(100dvh-4rem)] px-4 py-6 md:min-h-screen md:px-8 md:py-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-bold">Welcome, {profile?.name}</h1>
        <p className="mt-1 text-sm text-ink-text/50">Upload a new food video and manage what you've posted.</p>

        <div className="mt-6 grid gap-6 lg:grid-cols-[380px_1fr]">
          <form
            onSubmit={handleSubmit}
            className="h-fit space-y-4 rounded-2xl border border-ink-text/10 bg-ink-soft p-6"
          >
            <h2 className="font-semibold">Upload a video</h2>
            {error && <p className={errorClass}>{error}</p>}
            {success && <p className="rounded-lg bg-green-500/10 px-3 py-2 text-sm text-green-600 dark:text-green-400">{success}</p>}

            <label
              htmlFor="video-upload"
              className="flex aspect-video cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-ink-text/20 bg-ink-text/5 text-ink-text/50 hover:border-brand hover:text-ink-text/80"
            >
              {previewUrl ? (
                <video src={previewUrl} className="h-full w-full rounded-lg object-cover" muted />
              ) : (
                <>
                  <FiUploadCloud size={28} />
                  <span className="text-sm">Click to choose a video</span>
                </>
              )}
            </label>
            <input
              id="video-upload"
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              className="hidden"
            />

            <div>
              <label className={labelClass}>Name</label>
              <input
                required
                className={inputClass}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Spicy Burger"
              />
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea
                className={`${inputClass} min-h-20 resize-y`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A delicious spicy burger with crispy toppings"
              />
            </div>

            <button type="submit" disabled={submitting} className={buttonClass}>
              {submitting ? 'Uploading…' : 'Post video'}
            </button>
          </form>

          <div>
            <h2 className="font-semibold">Your videos</h2>

            {itemsLoading && (
              <div className="mt-8 flex justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-text/20 border-t-brand" />
              </div>
            )}

            {!itemsLoading && items.length === 0 && (
              <div className="mt-8 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-ink-text/10 py-16 text-center text-ink-text/50">
                <FiVideo size={28} />
                <p>You haven't posted any videos yet.</p>
              </div>
            )}

            {!itemsLoading && items.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                {items.map((item) => (
                  <div key={item._id} className="relative aspect-[9/16] overflow-hidden rounded-xl bg-black text-white">
                    <video src={item.video} controls preload="metadata" className="h-full w-full object-cover" />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent p-2">
                      <p className="truncate text-sm font-semibold">{item.name}</p>
                      <p className="shrink-0 text-xs text-white/70">♥ {item.likeCount ?? 0}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
