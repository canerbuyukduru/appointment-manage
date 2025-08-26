// app/admin/users/page.jsx
'use client'
import { useState, useEffect } from 'react'
import { 
  useGetAllUsersQuery, 
  useToggleUserBanMutation 
} from '@/lib/services/adminApi'
import { useGetCurrentUserQuery } from '@/lib/services/authApi'
import { useRouter } from 'next/navigation'
import { 
  Users, 
  Search, 
  Filter,
  Shield,
  ShieldOff,
  Eye,
  User,
  Building2,
  Crown,
  Mail,
  Phone,
  Calendar,
  AlertTriangle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function AdminUsersPage() {
  const router = useRouter()
  const { data: currentUser, isLoading: userLoading } = useGetCurrentUserQuery()
  
  const [filters, setFilters] = useState({
    role: 'all',
    status: 'all',
    search: '',
    page: 1,
    limit: 10
  })

  const { data: usersData, isLoading, refetch } = useGetAllUsersQuery(filters)
  const [toggleUserBan, { isLoading: toggling }] = useToggleUserBanMutation()

  const [selectedUser, setSelectedUser] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [modalAction, setModalAction] = useState('')
  const [reason, setReason] = useState('')

  // Admin kontrolü
  useEffect(() => {
    if (!userLoading && (!currentUser || currentUser.role !== 'admin')) {
      router.push('/admin/login')
    }
  }, [currentUser, userLoading, router])

  const handleToggleBan = async () => {
    if (!selectedUser) return
    
    if (modalAction === 'ban' && !reason.trim()) {
      toast.error('Yasaklama nedeni zorunludur')
      return
    }
    
    try {
      await toggleUserBan({ 
        id: selectedUser._id, 
        action: modalAction,
        reason: reason.trim()
      }).unwrap()
      
      toast.success(`Kullanıcı ${modalAction === 'ban' ? 'yasaklandı' : 'yasaklaması kaldırıldı'}!`)
      setShowModal(false)
      setReason('')
      refetch()
    } catch (error) {
      toast.error(error.data?.message || 'İşlem başarısız')
    }
  }

  const openModal = (user, action) => {
    setSelectedUser(user)
    setModalAction(action)
    setShowModal(true)
    setReason('')
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Crown className="text-red-600" size={16} />
      case 'owner':
        return <Building2 className="text-purple-600" size={16} />
      case 'user':
        return <User className="text-blue-600" size={16} />
      default:
        return <User className="text-gray-600" size={16} />
    }
  }

  const getRoleBadge = (role) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      owner: 'bg-purple-100 text-purple-800',
      user: 'bg-blue-100 text-blue-800'
    }
    const labels = {
      admin: 'Admin',
      owner: 'İşletme',
      user: 'Kullanıcı'
    }
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${colors[role] || 'bg-gray-100 text-gray-800'}`}>
        {labels[role] || role}
      </span>
    )
  }

  const getStatusBadge = (user) => {
    if (user.isBanned) {
      return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Yasaklı</span>
    }
    if (user.role === 'owner' && !user.isApproved) {
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Beklemede</span>
    }
    return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Aktif</span>
  }

  if (userLoading) return <div>Yükleniyor...</div>
  if (!currentUser || currentUser.role !== 'admin') return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Link 
                href="/admin/dashboard"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ChevronLeft size={20} />
                Dashboard
              </Link>
              <div className="w-px h-6 bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="text-blue-600" size={28} />
                Kullanıcı Yönetimi
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="İsim, email, telefon ara..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value, page: 1})}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Role Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={filters.role}
                onChange={(e) => setFilters({...filters, role: e.target.value, page: 1})}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white"
              >
                <option value="all">Tüm Roller</option>
                <option value="user">Kullanıcı</option>
                <option value="owner">İşletme Sahibi</option>
              </select>
            </div>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value, page: 1})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="active">Aktif</option>
              <option value="banned">Yasaklı</option>
            </select>

            {/* Results per page */}
            <select
              value={filters.limit}
              onChange={(e) => setFilters({...filters, limit: parseInt(e.target.value), page: 1})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value={10}>10 sonuç</option>
              <option value={20}>20 sonuç</option>
              <option value={50}>50 sonuç</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : usersData?.users?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kullanıcı
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kayıt Tarihi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {usersData.users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            {getRoleIcon(user.role)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Mail size={12} />
                              {user.email}
                            </div>
                            {user.phone && (
                              <div className="text-sm text-gray-500 flex items-center gap-1">
                                <Phone size={12} />
                                {user.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(user)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          {/* Ban/Unban button */}
                          {user.role !== 'admin' && (
                            user.isBanned ? (
                              <button
                                onClick={() => openModal(user, 'unban')}
                                className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Yasaklamayı kaldır"
                              >
                                <Shield size={16} />
                              </button>
                            ) : (
                              <button
                                onClick={() => openModal(user, 'ban')}
                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Kullanıcıyı yasakla"
                              >
                                <ShieldOff size={16} />
                              </button>
                            )
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
              <Users className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Kullanıcı bulunamadı</h3>
              <p className="text-gray-600">Arama kriterlerinizi değiştirmeyi deneyin</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {usersData?.pagination && usersData.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-700">
              Toplam {usersData.pagination.totalCount} sonuçtan {' '}
              {((usersData.pagination.currentPage - 1) * filters.limit) + 1}-
              {Math.min(usersData.pagination.currentPage * filters.limit, usersData.pagination.totalCount)} arası gösteriliyor
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilters({...filters, page: filters.page - 1})}
                disabled={!usersData.pagination.hasPrev}
                className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-lg">
                {usersData.pagination.currentPage} / {usersData.pagination.totalPages}
              </span>
              <button
                onClick={() => setFilters({...filters, page: filters.page + 1})}
                disabled={!usersData.pagination.hasNext}
                className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Ban/Unban Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                {modalAction === 'ban' ? (
                  <AlertTriangle className="text-red-600" size={24} />
                ) : (
                  <Shield className="text-green-600" size={24} />
                )}
                <h3 className="text-lg font-semibold">
                  {modalAction === 'ban' ? 'Kullanıcıyı Yasakla' : 'Yasaklamayı Kaldır'}
                </h3>
              </div>
              
              <div className="mb-4">
                <div className="bg-gray-50 p-3 rounded-lg mb-3">
                  <div className="text-sm font-medium text-gray-900">{selectedUser?.fullName}</div>
                  <div className="text-sm text-gray-600">{selectedUser?.email}</div>
                </div>
                
                <p className="text-gray-600 mb-3">
                  Bu kullanıcıyı {modalAction === 'ban' ? 'yasaklamak' : 'yasaklamasını kaldırmak'} istediğinizden emin misiniz?
                </p>
                
                {modalAction === 'ban' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Yasaklama Nedeni *
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Yasaklama nedenini açıklayın..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                      rows={3}
                    />
                  </div>
                )}
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleToggleBan}
                  disabled={toggling}
                  className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${
                    modalAction === 'ban' 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {toggling ? 'İşleniyor...' : modalAction === 'ban' ? 'Yasakla' : 'Kaldır'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}