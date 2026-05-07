// app/admin/dashboard/page.jsx
"use client";
import {
  useGetAdminStatsQuery,
  useGetPendingOwnersQuery,
} from "@/lib/services/adminApi";
import { useGetCurrentUserQuery } from "@/lib/services/authApi";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Users,
  Building2,
  Calendar,
  Clock,
  CheckCircle,
  Eye,
  UserCheck,
  Settings,
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const router = useRouter();
  const { data: currentUser, isLoading: userLoading } =
    useGetCurrentUserQuery();
  const { data: stats, isLoading: statsLoading } = useGetAdminStatsQuery();
  const { data: pendingOwners, isLoading: ownersLoading } =
    useGetPendingOwnersQuery();
  useEffect(() => {
    if (!userLoading && (!currentUser || currentUser.role !== "admin")) {
      router.push("/admin/login");
    }
  }, [currentUser, userLoading, router]);

  if (userLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== "admin") {
    return null; // useEffect ile zaten yönlendirilecek
  }

  const statsData = stats?.stats || {};

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Toplam Kullanıcı</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsData.totalUsers || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Total Owners */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Building2 className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">İşletme Sahipleri</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsData.totalOwners || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Pending Approvals */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="text-yellow-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Bekleyen Onay</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsData.pendingOwners || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Today's Appointments */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Bugünkü Randevular</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsData.todayAppointments || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Owners */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Bekleyen İşletme Onayları
              </h3>
              <Link
                href="/admin/owners"
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Tümünü Gör →
              </Link>
            </div>

            {ownersLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : pendingOwners?.owners?.length > 0 ? (
              <div className="space-y-4">
                {pendingOwners.owners.slice(0, 5).map((owner) => (
                  <div
                    key={owner._id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Building2 className="text-purple-600" size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {owner.fullName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {owner.beautyCenter?.name || "İşletme adı yok"}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href="/admin/owners"
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Eye size={16} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle
                  className="mx-auto text-green-500 mb-2"
                  size={48}
                />
                <p className="text-gray-600">Bekleyen onay bulunmuyor</p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Hızlı İşlemler
              </h3>
              <div className="space-y-3">
                <Link
                  href="/admin/owners"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <UserCheck className="text-purple-600" size={20} />
                  <span className="text-gray-700">İşletme Onayları</span>
                </Link>
                <Link
                  href="/admin/users"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Users className="text-blue-600" size={20} />
                  <span className="text-gray-700">Kullanıcı Yönetimi</span>
                </Link>
                <Link
                  href="/admin/centers"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Building2 className="text-green-600" size={20} />
                  <span className="text-gray-700">İşletme Yönetimi</span>
                </Link>
                <Link
                  href="/admin/settings"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Settings className="text-gray-600" size={20} />
                  <span className="text-gray-700">Sistem Ayarları</span>
                </Link>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Sistem Durumu
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Toplam Merkez</span>
                  <span className="font-medium">
                    {statsData.totalCenters || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Onaylı İşletme</span>
                  <span className="font-medium text-green-600">
                    {statsData.approvedOwners || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Yasaklı Kullanıcı</span>
                  <span className="font-medium text-red-600">
                    {statsData.bannedUsers || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Toplam Randevu</span>
                  <span className="font-medium">
                    {statsData.totalAppointments || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Last 7 Days Chart (Basit versiyon) */}
        {statsData.last7Days && (
          <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Son 7 Günün Randevu Grafiği
            </h3>
            <div className="grid grid-cols-7 gap-2">
              {statsData.last7Days.map((day, index) => (
                <div key={index} className="text-center">
                  <div className="text-xs text-gray-600 mb-2">
                    {new Date(day.date).toLocaleDateString("tr-TR", {
                      weekday: "short",
                    })}
                  </div>
                  <div className="bg-red-100 rounded-lg p-3">
                    <div className="text-lg font-bold text-red-600">
                      {day.appointments}
                    </div>
                    <div className="text-xs text-red-600">randevu</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
