// app/admin/login/page.jsx
'use client'
import React from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  // Hooks MUST be called unconditionally at the top of the component
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { email: '', password: '' },
    mode: 'onSubmit',
  })

  // State hooks also MUST be at the top-level (not inside any if/return)
  const [showPassword, setShowPassword] = React.useState(false)
  const [showExtra, setShowExtra] = React.useState(false)

  const router = useRouter()

  const onSubmit = async (data) => {
    try {
      // perform login request (example)
      // await loginApi(data)
      // on success:
      // router.push('/profile') // or role-based redirect
      console.log('submit', data)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <main>
      <h1>Admin Login</h1>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            {...register('email', { required: 'Email gerekli' })}
            placeholder="email@example.com"
          />
          {errors.email && <p>{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="password">Şifre</label>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            {...register('password', { required: 'Şifre gerekli' })}
            placeholder="şifreniz"
          />
          {errors.password && <p>{errors.password.message}</p>}
          <button type="button" onClick={() => setShowPassword(v => !v)}>
            {showPassword ? 'Gizle' : 'Göster'}
          </button>
        </div>

        <button type="submit" disabled={isSubmitting}>
          Giriş Yap
        </button>
      </form>

      <hr />

      {/* conditional UI is allowed, but hooks are already declared above */}
      {showExtra && <div>Ek bilgi</div>}
      <button onClick={() => setShowExtra(v => !v)}>
        Toggle Extra
      </button>
    </main>
  )
}