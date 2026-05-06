import type { Metadata } from 'next'
import SifremiUnuttumForm from './sifremi-unuttum-form'

export const metadata: Metadata = {
  title: 'Şifremi Unuttum',
}

export default function SifremiUnuttumPage() {
  return <SifremiUnuttumForm />
}
