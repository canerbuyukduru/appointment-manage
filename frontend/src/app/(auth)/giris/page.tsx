import type { Metadata } from 'next'
import GirisForm from './giris-form'

export const metadata: Metadata = {
  title: 'Giriş Yap',
}

export default function GirisPage() {
  return <GirisForm />
}
