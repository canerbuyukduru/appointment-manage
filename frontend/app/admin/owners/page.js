// app/admin/owners/page.jsx
'use client'
import { useState } from 'react'
import {
  useGetAllOwnersQuery,
  useApproveOwnerMutation,
  useRejectOwnerMutation
} from '@/lib/services/adminApi'
import { useGetCurrentUserQuery } from '@/lib/services/authApi'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import {
  Building2,
  Search,
  Filter,
  Check,
  X,
  Eye,
  Clock,
  Mail,
  Phone,
  MapPin,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { getErrorMessage, getToastDuration } from '@/lib/utils/errorMessages'

export default function AdminOwnersPage() {
  const router = useRouter()
  const { data: currentUser, isLoading: userLoading } = useGetCurrentUserQuery()

  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    page: 1,
    limit: 10
  })

  const { data: ownersData, isLoading, refetch } = useGetAllOwnersQuery(filters)
  const [approveOwner, { isLoading: approving }] = useApproveOwnerMutation()
  const [rejectOwner, { isLoading: rejecting }] = useRejectOwnerMutation()

  const [selectedOwner, setSelectedOwner] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [modalAction, setModalAction] = useState('')
  const [notes, setNotes] = useState('')

  // Admin kontrolü
  useEffect(() => {
    if (!userLoading && (!currentUser || currentUser.role !== 'admin')) {
      router.push('/admin/login')
    }
  }, [currentUser, userLoading, router])

  const handleApprove = async () => {
    if (!selectedOwner) return

    try {
      await approveOwner({ id: selectedOwner._id, notes }).unwrap()
      toast.success('İşletme sahibi onaylandı!')
      setShowModal(false)
      setNotes('')
      refetch()
    } catch (error) {
      toast.error(getErrorMessage(error, 'Onay işlemi başarısız'), { duration: getToastDuration(error) })
    }
  }

  const handleReject = async () => {
    if (!selectedOwner || !notes.trim()) {
      toast.error('Red nedeni zorunludur')
      return
    }

    try {
      await rejectOwner({ id: selectedOwner._id, notes }).unwrap()
      toast.success('İşletme sahibi reddedildi')
      setShowModal(false)
      setNotes('')
      refetch()
    } catch (error) {
      toast.error(getErrorMessage(error, 'Red işlemi başarısız'), { duration: getToastDuration(error) })
    }
  }

  const openModal = (owner, action) => {
    setSelectedOwner(owner)
    setModalAction(action)
    setShowModal(true)
    setNotes('')
  }

  const getStatusBadge = (owner) => {
    if (owner.isBanned) {
      return <span className="px-2 py-1 bg-red-950/50 text-red-400 text-xs rounded-full">Yasaklı</span>
    }
    if (owner.isApproved) {
      return <span className="px-2 py-1 bg-green-950/50 text-green-400 text-xs rounded-full">Onaylı</span>
    }
    return <span className="px-2 py-1 bg-yellow-950/50 text-yellow-400 text-xs rounded-full">Beklemede</span>
  }

  if (userLoading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">Yükleniyor...</div>
  if (!currentUser || currentUser.role !== 'admin') return null

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-2 text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                <ChevronLeft size={20} />
                Dashboard
              </Link>
              <div className="w-px h-6 bg-zinc-700"></div>
              <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
                <Building2 className="text-purple-600" size={28} />
                İşletme Sahipleri
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" size={20} />
              <input
                type="text"
                placeholder="İsim, email, telefon ara..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value, page: 1})}
                className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" size={20} />
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value, page: 1})}
                className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none appearance-none"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="pending">Beklemede</option>
                <option value="approved">Onaylı</option>
                <option value="banned">Yasaklı</option>
              </select>
            </div>

            {/* Results per page */}
            <select
              value={filters.limit}
              onChange={(e) => setFilters({...filters, limit: parseInt(e.target.value), page: 1})}
              className="px-4 py-2 bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            >
              <option value={10}>10 sonuç</option>
              <option value={20}>20 sonuç</option>
              <option value={50}>50 sonuç</option>
            </select>
          </div>
        </div>

        {/* Owners Table */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : ownersData?.owners?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                      İşletme Sahibi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                      İşletme
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                      Kayıt Tarihi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-zinc-900 divide-y divide-zinc-800">
                  {ownersData.owners.map((owner) => (
                    <tr key={owner._id} className="hover:bg-zinc-800 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-purple-950/50 rounded-full flex items-center justify-center">
                            <Building2 className="text-purple-600" size={20} />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-zinc-100">{owner.fullName}</div>
                            <div className="text-sm text-zinc-400 flex items-center gap-1">
                              <Mail size={12} />
                              {owner.email}
                            </div>
                            {owner.phone && (
                              <div className="text-sm text-zinc-400 flex items-center gap-1">
                                <Phone size={12} />
                                {owner.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {owner.beautyCenter ? (
                          <div>
                            <div className="text-sm font-medium text-zinc-100">
                              {owner.beautyCenter.name}
                            </div>
                            <div className="text-sm text-zinc-400 flex items-center gap-1">
                              <MapPin size={12} />
                              {typeof owner.beautyCenter.address === 'string'
                                ? owner.beautyCenter.address
                                : 'Adres bilgisi yok'}
                            </div>
                          </div>
                        ) : (
                          <span className="text-zinc-500 italic">İşletme bilgisi yok</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(owner)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400">
                        {new Date(owner.createdAt).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/owners/${owner._id}`}
                            className="p-2 text-zinc-400 hover:text-blue-400 hover:bg-zinc-700 rounded-lg transition-colors"
                            title="Detay"
                          >
                            <Eye size={16} />
                          </Link>

                          {!owner.isApproved && !owner.isBanned && (
                            <>
                              <button
                                onClick={() => openModal(owner, 'approve')}
                                className="p-2 text-zinc-400 hover:text-green-400 hover:bg-zinc-700 rounded-lg transition-colors"
                                title="Onayla"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={() => openModal(owner, 'reject')}
                                className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-700 rounded-lg transition-colors"
                                title="Reddet"
                              >
                                <X size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Building2 className="mx-auto text-zinc-600 mb-4" size={48} />
              <h3 className="text-lg font-medium text-zinc-100 mb-2">İşletme sahibi bulunamadı</h3>
              <p className="text-zinc-400">Arama kriterlerinizi değiştirmeyi deneyin</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {ownersData?.pagination && ownersData.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-zinc-400">
              Toplam {ownersData.pagination.totalCount} sonuçtan{' '}
              {((ownersData.pagination.currentPage - 1) * filters.limit) + 1}-
              {Math.min(ownersData.pagination.currentPage * filters.limit, ownersData.pagination.totalCount)} arası gösteriliyor
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilters({...filters, page: filters.page - 1})}
                disabled={!ownersData.pagination.hasPrev}
                className="px-4 py-2 text-sm font-medium text-zinc-300 bg-zinc-900 border border-zinc-700 rounded-lg hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-4 py-2 text-sm font-medium text-zinc-200 bg-zinc-800 border border-zinc-700 rounded-lg">
                {ownersData.pagination.currentPage} / {ownersData.pagination.totalPages}
              </span>
              <button
                onClick={() => setFilters({...filters, page: filters.page + 1})}
                disabled={!ownersData.pagination.hasNext}
                className="px-4 py-2 text-sm font-medium text-zinc-300 bg-zinc-900 border border-zinc-700 rounded-lg hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                {modalAction === 'approve' ? (
                  <Check className="text-green-600" size={24} />
                ) : (
                  <AlertCircle className="text-red-600" size={24} />
                )}
                <h3 className="text-lg font-semibold text-zinc-100">
                  {modalAction === 'approve' ? 'İşletme Sahibini Onayla' : 'İşletme Sahibini Reddet'}
                </h3>
              </div>

              <div className="mb-4">
                <p className="text-zinc-300 mb-2">
                  <strong className="text-zinc-100">{selectedOwner?.fullName}</strong> isimli işletme sahibini{' '}
                  {modalAction === 'approve' ? 'onaylamak' : 'reddetmek'} istediğinizden emin misiniz?
                </p>

                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  {modalAction === 'approve' ? 'Not (Opsiyonel)' : 'Red Nedeni *'}
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={modalAction === 'approve' ? 'Onay notu...' : 'Red nedenini açıklayın...'}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 text-zinc-200 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={modalAction === 'approve' ? handleApprove : handleReject}
                  disabled={approving || rejecting}
                  className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${
                    modalAction === 'approve'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {approving || rejecting ? 'İşleniyor...' : modalAction === 'approve' ? 'Onayla' : 'Reddet'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
