'use client'

import { use, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Clock, CheckCircle } from 'lucide-react'
import { useBusiness, useAvailableSlots } from '@/hooks/use-businesses'
import { useCreateAppointment, useCreatePaymentIntent, useConfirmPayment } from '@/hooks/use-appointments'
import { useBookingStore } from '@/store/booking.store'
import type { Service, Staff, Slot } from '@/types'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

const STEPS = ['Hizmet', 'Personel', 'Tarih & Saat', 'Onay', 'Ödeme', 'Tamamlandı']

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-1 mb-8">
      {STEPS.map((label, i) => {
        const num = i + 1
        return (
          <div key={label} className="flex items-center">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${num < current ? 'bg-blue-600 text-white' : num === current ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-gray-100 text-gray-400'}`}>
              {num < current ? <CheckCircle className="h-4 w-4" /> : num}
            </div>
            {i < STEPS.length - 1 && <div className={`mx-1 h-0.5 w-6 ${num < current ? 'bg-blue-600' : 'bg-gray-200'}`} />}
          </div>
        )
      })}
    </div>
  )
}

function PaymentForm({ clientSecret, appointmentId, onSuccess }: { clientSecret: string; appointmentId: string; onSuccess: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { mutateAsync: confirmPayment } = useConfirmPayment()

  async function handlePay() {
    if (!stripe || !elements) return
    setLoading(true)
    setError('')

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) return

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: cardElement },
    })

    if (result.error) {
      setError(result.error.message || 'Ödeme başarısız')
      setLoading(false)
      return
    }

    if (result.paymentIntent?.status === 'succeeded') {
      await confirmPayment({ appointmentId, paymentIntentId: result.paymentIntent.id })
      onSuccess()
    }
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-gray-300 p-4">
        <CardElement options={{ style: { base: { fontSize: '16px', color: '#374151' } } }} />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        onClick={handlePay}
        disabled={loading}
        className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
      >
        {loading ? 'İşleniyor...' : 'Ödemeyi Tamamla'}
      </button>
    </div>
  )
}

export default function BookingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedServiceId = searchParams.get('serviceId')

  const { data: business, isLoading } = useBusiness(slug)
  const store = useBookingStore()
  const { mutateAsync: createAppointment } = useCreateAppointment()
  const { mutateAsync: createIntent } = useCreatePaymentIntent()

  const { data: slots, isLoading: slotsLoading } = useAvailableSlots({
    businessId: business?.id,
    serviceId: store.selectedService?.id,
    date: store.selectedDate || undefined,
    staffId: store.selectedStaff?.id,
  })

  useEffect(() => {
    if (business) store.setBusiness(business)
  }, [business])

  useEffect(() => {
    if (preselectedServiceId && business?.services) {
      const svc = business.services.find((s) => s.id === preselectedServiceId)
      if (svc) store.setService(svc)
    }
  }, [preselectedServiceId, business])

  if (isLoading) return <div className="py-20 text-center text-gray-400">Yükleniyor...</div>
  if (!business) return <div className="py-20 text-center text-gray-500">İşletme bulunamadı.</div>

  async function handleConfirm() {
    if (!store.selectedService || !store.selectedSlot || !business) return
    const apt = await createAppointment({
      businessId: business.id,
      serviceId: store.selectedService.id,
      staffId: store.selectedSlot.staffId,
      appointmentDate: store.selectedDate!,
      startTime: store.selectedSlot.startTime,
      customerNotes: store.customerNotes,
    })
    store.setAppointment(apt.data.id)
    const intent = await createIntent(apt.data.id)
    store.setPayment(intent.data.paymentIntentId, intent.data.clientSecret)
    store.setStep(5)
  }

  const today = new Date().toISOString().split('T')[0]
  const maxDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">{business.name}</h1>
      <p className="text-center text-gray-500 mb-6 text-sm">Randevu Oluştur</p>
      <StepIndicator current={store.step} />

      {/* Adım 1: Hizmet */}
      {store.step === 1 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Hizmet Seçin</h2>
          <div className="space-y-3">
            {business.services?.map((s) => (
              <button
                key={s.id}
                onClick={() => store.setService(s)}
                className="w-full flex items-center justify-between rounded-xl border-2 border-gray-200 bg-white p-4 text-left hover:border-blue-400 transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-900">{s.name}</p>
                  {s.description && <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{s.description}</p>}
                  <p className="text-sm text-gray-400 mt-1"><Clock className="inline h-3.5 w-3.5 mr-1" />{s.duration} dk</p>
                </div>
                <p className="font-bold text-blue-600 text-lg ml-4">₺{Number(s.price).toFixed(0)}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Adım 2: Personel */}
      {store.step === 2 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Personel Seçin</h2>
          <div className="space-y-3">
            <button
              onClick={() => store.setStaff(null)}
              className="w-full rounded-xl border-2 border-gray-200 bg-white p-4 text-left hover:border-blue-400 transition-colors"
            >
              <p className="font-medium text-gray-900">Herhangi bir personel</p>
              <p className="text-sm text-gray-500">Müsait ilk personel atanır</p>
            </button>
            {business.staff?.map((s) => (
              <button
                key={s.id}
                onClick={() => store.setStaff(s)}
                className="w-full flex items-center gap-3 rounded-xl border-2 border-gray-200 bg-white p-4 text-left hover:border-blue-400 transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 font-bold text-gray-500">
                  {s.name[0]}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{s.name}</p>
                  {s.specialization && <p className="text-sm text-gray-500">{s.specialization}</p>}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Adım 3: Tarih & Saat */}
      {store.step === 3 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tarih ve Saat Seçin</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tarih</label>
            <input
              type="date"
              min={today}
              max={maxDate}
              value={store.selectedDate || ''}
              onChange={(e) => store.setDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {store.selectedDate && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Müsait Saatler</p>
              {slotsLoading ? (
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="h-10 rounded-lg bg-gray-100 animate-pulse" />
                  ))}
                </div>
              ) : (slots?.length ?? 0) === 0 ? (
                <p className="text-gray-500 text-sm py-4">Bu tarihte müsait saat yok.</p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {slots?.map((slot) => (
                    <button
                      key={`${slot.startTime}-${slot.staffId}`}
                      onClick={() => { store.setSlot(slot); store.setStep(4) }}
                      className={`rounded-lg border-2 py-2 text-sm font-medium transition-colors ${store.selectedSlot?.startTime === slot.startTime && store.selectedSlot?.staffId === slot.staffId ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-400'}`}
                    >
                      {slot.startTime}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Adım 4: Onay */}
      {store.step === 4 && store.selectedService && store.selectedSlot && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Randevu Özeti</h2>
          <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3 mb-4">
            <Row label="İşletme" value={business.name} />
            <Row label="Hizmet" value={store.selectedService.name} />
            <Row label="Personel" value={store.selectedSlot.staffName} />
            <Row label="Tarih" value={store.selectedDate!} />
            <Row label="Saat" value={`${store.selectedSlot.startTime} — ${store.selectedSlot.endTime}`} />
            <Row label="Ücret" value={`₺${Number(store.selectedService.price).toFixed(2)}`} bold />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Not (opsiyonel)</label>
            <textarea
              rows={3}
              value={store.customerNotes}
              onChange={(e) => store.setNotes(e.target.value)}
              placeholder="Varsa özel bir isteğinizi belirtin..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <button
            onClick={handleConfirm}
            className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Randevuyu Oluştur ve Öde
          </button>
        </div>
      )}

      {/* Adım 5: Ödeme */}
      {store.step === 5 && store.clientSecret && store.appointmentId && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Ödeme</h2>
          <p className="text-sm text-gray-500 mb-6">Toplam: <strong>₺{Number(store.selectedService?.price).toFixed(2)}</strong></p>
          <Elements stripe={stripePromise} options={{ clientSecret: store.clientSecret }}>
            <PaymentForm
              clientSecret={store.clientSecret}
              appointmentId={store.appointmentId}
              onSuccess={() => store.setStep(6)}
            />
          </Elements>
        </div>
      )}

      {/* Adım 6: Başarı */}
      {store.step === 6 && (
        <div className="text-center py-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Randevunuz Oluşturuldu!</h2>
          <p className="text-gray-500 mb-6">Onay e-postası adresinize gönderildi.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => { store.reset(); router.push('/randevularim') }}
              className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              Randevularımı Gör
            </button>
            <button
              onClick={() => { store.reset(); router.push('/') }}
              className="rounded-xl border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Ana Sayfa
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={bold ? 'font-bold text-blue-600 text-base' : 'text-gray-900'}>{value}</span>
    </div>
  )
}
