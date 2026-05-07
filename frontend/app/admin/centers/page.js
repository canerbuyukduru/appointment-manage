'use client'
import { useState } from 'react'
import {
  useGetAllBeautyCentersQuery,
  useToggleBeautyCenterStatusMutation,
} from '@/lib/services/adminApi'
import { useGetCurrentUserQuery } from '@/lib/services/authApi'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import {
  Building2,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Phone,
  MapPin,
  User,
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function AdminCentersPage() {
  const router = useRouter()
  const { data: currentUser, isLoading: userLoading } = useGetCurrentUserQuery()

  const [filters, setFilters] = useState({ status: 'all', search: '', page: 1, limit: 10 })
  const [showModal, setShowModal] = useState(false)
  const [selectedCenter, setSelectedCenter] = useState(null)
  const [modalAction, setModalAction] = useState('')
  const [reason, setReason] = useState('')

  const { data: centersData, isLoading, refetch } = useGetAllBeautyCentersQuery(filters)
  const [toggleStatus, { isLoading: toggling }] = useToggleBeautyCenterStatusMutation()

  useEffect(() => {
    if (!userLoading && (!currentUser || currentUser.role !== 'admin')) {
      router.push('/admin/login')
    }
  }, [currentUser, userLoading, router])

  const openModal = (center, action) => {
    setSelectedCenter(center)
    setModalAction(action)
    setReason('')
    setShowModal(true)
  }

  const handleToggle = async () => {
    if (!selectedCenter) return
    if (modalAction === 'suspend' && !reason.trim()) {
      toast.error('Askıya alma nedeni zorunludur')
      return
    }
    try {
      await toggleStatus({ id: selectedCenter._id, action: modalAction, reason }).unwrap()
      toast.success(modalAction === 'suspend' ? 'İşletme askıya alındı' : 'İşletme aktifleştirildi')
      setShowModal(false)
      refetch()
    } catch (error) {
      toast.error(error.data?.message || 'İşlem başarısız')
    }
  }

  const centers = centersData?.centers || []
  const pagination = centersData?.pagination

  if (userLoading) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
          <Link href="/admin/dashboard" className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
            <ArrowLeft size={20} />
          </Link>
          <Building2 className="text-red-600" size={24} />
          <h1 className="text-xl font-bold text-gray-900">İşletme Yönetimi</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="İşletme ara..."
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-500" />
            <select
              value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value, page: 1 }))}
              className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">Tümü</option>
              <option value="approved">Aktif</option>
              <option value="pending">Askıda</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : centers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-500">
            <Building2 className="mx-auto mb-4 text-gray-300" size={48} />
            <p>İşletme bulunamadı</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşletme</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sahibi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İletişim</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {centers.map((center) => (
                  <tr key={center._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center">
                          <Building2 className="text-red-600" size={18} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{center.name}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <MapPin size={10} /> {center.address}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <User size={14} />
                        {center.ownerId?.fullName || '-'}
                      </div>
                      <p className="text-xs text-gray-500">{center.ownerId?.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700 flex items-center gap-1">
                        <Phone size={12} /> {center.phone || '-'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {center.isApproved ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          <CheckCircle size={12} /> Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                          <XCircle size={12} /> Askıda
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {center.isApproved ? (
                        <button
                          onClick={() => openModal(center, 'suspend')}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition-colors"
                        >
                          Askıya Al
                        </button>
                      ) : (
                        <button
                          onClick={() => openModal(center, 'activate')}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors"
                        >
                          Aktifleştir
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-600">
              Toplam {pagination.totalCount} işletme
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
                disabled={!pagination.hasPrev}
                className="p-2 border rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-3 py-2 text-sm font-medium">
                {pagination.currentPage} / {pagination.totalPages}
              </span>
              <button
                onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
                disabled={!pagination.hasNext}
                className="p-2 border rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedCenter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {modalAction === 'suspend' ? 'İşletmeyi Askıya Al' : 'İşletmeyi Aktifleştir'}
            </h3>
            <p className="text-gray-600 mb-4">
              <strong>{selectedCenter.name}</strong>{' '}
              {modalAction === 'suspend' ? 'askıya alınacak.' : 'aktifleştirilecek.'}
            </p>
            {modalAction === 'suspend' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Askıya Alma Nedeni *
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  placeholder="Neden askıya alınıyor?"
                />
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                onClick={handleToggle}
                disabled={toggling}
                className={`flex-1 px-4 py-2 rounded-lg text-white font-medium disabled:opacity-50 ${
                  modalAction === 'suspend' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {toggling ? 'İşleniyor...' : modalAction === 'suspend' ? 'Askıya Al' : 'Aktifleştir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
