import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'
import AuthLayout from '../components/AuthLayout'
import { inputClass, labelClass, buttonClass, errorClass } from '../components/formStyles'

const initialForm = {
  name: '',
  contactName: '',
  email: '',
  phone: '',
  address: '',
  password: '',
}

export default function PartnerRegister() {
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await client.post('/api/auth/food-partner/register', form)
      login('partner', data.foodPartner)
      navigate('/partner/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Register your business"
      subtitle="Start sharing videos of your food"
      footer={
        <>
          Already registered?{' '}
          <Link to="/partner/login" className="font-medium text-brand hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className={errorClass}>{error}</p>}
        <div>
          <label className={labelClass}>Business name</label>
          <input required className={inputClass} value={form.name} onChange={update('name')} placeholder="Sunny's Kitchen" />
        </div>
        <div>
          <label className={labelClass}>Contact name</label>
          <input required className={inputClass} value={form.contactName} onChange={update('contactName')} placeholder="Jane Doe" />
        </div>
        <div>
          <label className={labelClass}>Email</label>
          <input type="email" required className={inputClass} value={form.email} onChange={update('email')} placeholder="partner@business.com" />
        </div>
        <div>
          <label className={labelClass}>Phone</label>
          <input required className={inputClass} value={form.phone} onChange={update('phone')} placeholder="+1 555 123 4567" />
        </div>
        <div>
          <label className={labelClass}>Address</label>
          <input required className={inputClass} value={form.address} onChange={update('address')} placeholder="123 Main St, City" />
        </div>
        <div>
          <label className={labelClass}>Password</label>
          <input type="password" required minLength={6} className={inputClass} value={form.password} onChange={update('password')} placeholder="••••••••" />
        </div>
        <button type="submit" disabled={loading} className={buttonClass}>
          {loading ? 'Creating account…' : 'Create business account'}
        </button>
      </form>
    </AuthLayout>
  )
}
