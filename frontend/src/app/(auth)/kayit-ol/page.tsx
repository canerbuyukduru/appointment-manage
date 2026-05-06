import type { Metadata } from 'next'
import KayitForm from './kayit-form'

export const metadata: Metadata = {
  title: 'Kayıt Ol',
}

export default function KayitOlPage() {
  return <KayitForm />
}
