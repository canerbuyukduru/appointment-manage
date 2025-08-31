// app/dashboard/page.jsx
"use client";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import {
  useLogoutMutation,
  useUpdateOwnerProfileMutation,
  useUpdateUserProfileMutation,
} from "@/lib/services/authApi";
import { logout, updateUser } from "@/lib/features/authSlice";
import UserProfileModal from "@/components/UserProfileModal"; // Modal component'i import et

import toast from "react-hot-toast";
import { User, Building, Shield, LogOut, Edit3 } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";

function DashboardContent() {
  const dispatch = useDispatch();
  const router = useRouter();

  // 🎛️ Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [updateOwnerProfile, { isLoading: isUpdating }] =
    useUpdateOwnerProfileMutation();
  const [updateUserProfile, { isLoading: isUserUpdating }] =
    useUpdateUserProfileMutation();
  const [logoutMutation, { isLoading }] = useLogoutMutation();

  // 🔄 Modal açma/kapama
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // 🚀 Profil güncelleme işlemi
  const handleUpdateProfile = async (updateData) => {
    try {
      // handleUpdateProfile içinde
      if (user.role === "user") {
        const result = await updateUserProfile(updateData).unwrap();
        // Redux state'teki user'ı güncelle
        dispatch(updateUser(result));

        toast.success("Profil başarıyla güncellendi!");
        handleCloseModal();
      } else if (user.role === "owner") {
        const result = await updateOwnerProfile(updateData).unwrap();
        dispatch(updateUser(result.owner));

        toast.success("Profil başarıyla güncellendi!");
        handleCloseModal();
      }
    } catch (error) {
      console.error("❌ Profil güncelleme hatası:", error);
      toast.error(
        "Profil güncellenirken hata oluştu: " +
          (error.data?.message || error.message)
      );
    }
  };

  // 🔓 Logout işlemi
  const handleLogout = async () => {
    console.log("🔄 Logout başlatılıyor...");
    try {
      const result = await logoutMutation().unwrap();
      console.log("✅ Logout API başarılı:", result);

      dispatch(logout());
      console.log("✅ Redux state temizlendi");

      toast.success("Başarıyla çıkış yapıldı");
      router.push("/login");
    } catch (error) {
      console.error("❌ Logout hatası:", error);
      console.error("❌ Error details:", error.data);
      toast.error(
        "Çıkış yapılamadı: " + (error.data?.message || error.message)
      );
    }
  };

  // 🎨 Role'e göre icon seç
  const getRoleIcon = (role) => {
    if (!role) return <User className="text-gray-500" size={24} />;

    switch (role) {
      case "user":
        return <User className="text-blue-500" size={24} />;
      case "owner":
        return <Building className="text-purple-500" size={24} />;
      case "admin":
        return <Shield className="text-red-500" size={24} />;
      default:
        return <User className="text-gray-500" size={24} />;
    }
  };

  // 📝 Role'e göre açıklama
  const getRoleDescription = (role) => {
    if (!role) return "Sistemde aktif durumdasınız.";

    switch (role) {
      case "user":
        return "Randevu alabilir ve geçmiş randevularını görüntüleyebilirsiniz.";
      case "owner":
        return "İşletmenizi yönetebilir, randevuları onaylayabilir ve hizmetlerinizi düzenleyebilirsiniz.";
      case "admin":
        return "Tüm sistem ayarlarını yönetebilir ve kullanıcıları denetleyebilirsiniz. Admin paneline erişiminiz var.";
      default:
        return "Sistemde aktif durumdasınız.";
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <button
              onClick={handleLogout}
              disabled={isLoading}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <LogOut size={18} />
              {isLoading ? "Çıkış yapılıyor..." : "Çıkış Yap"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center gap-4">
            {getRoleIcon(user?.role)}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                Hoş geldiniz, {user?.fullName || "Kullanıcı"}
              </h2>
              <p className="text-gray-600 mt-1">
                {getRoleDescription(user?.role)}
              </p>
            </div>
          </div>
        </div>

        {/* User Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
          {/* Kullanıcı Bilgileri */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Kullanıcı Bilgileri
              </h3>
              {/* 🆕 Düzenle Butonu */}
              <button
                onClick={handleOpenModal}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors group"
                title="Profili Düzenle"
              >
                <Edit3
                  size={16}
                  className="group-hover:rotate-12 transition-transform"
                />
                Düzenle
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-700">Ad Soyad</label>
                <p className="font-medium text-black">
                  {user?.fullName || "Bilinmiyor"}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-700">E-posta</label>
                <p className="font-medium text-black">
                  {user?.email || "Bilinmiyor"}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-700">Telefon</label>
                <p className="font-medium text-black">
                  {user?.phone || "Bilinmiyor"}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-700">Rol</label>
                <div className="flex items-center gap-2">
                  {getRoleIcon(user?.role)}
                  <span className="font-medium capitalize text-black">
                    {user?.role || "Bilinmiyor"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Hızlı İşlemler */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {user?.role === "admin" ? "Admin Panel" : "Hızlı Eylemler"}
            </h3>
            <div className="space-y-3">
              {/* User için */}
              {user?.role === "user" && (
                <>
                  <button
                    onClick={() => router.push("/")}
                    className="w-full text-left p-3 text-black cursor-pointer rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    📅 Randevu Al
                  </button>
                  <button
                    onClick={() => router.push("/user/appointments")}
                    className="w-full text-left p-3 text-black cursor-pointer rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    📋 Randevularım
                  </button>
                </>
              )}

              {/* Owner için */}
              {user?.role === "owner" && (
                <>
                  <Link
                    href="/owner/dashboard"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-purple-50 transition-colors text-purple-700 font-medium"
                  >
                    📊 Owner Dashboard
                  </Link>
                  <Link
                    href="/owner/beauty-center"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                  >
                    🏢 İşletme Yönetimi
                  </Link>
                  <Link
                    href="/owner/departments"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                  >
                    📂 Departmanlar
                  </Link>
                  <Link
                    href="/owner/appointments"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                  >
                    📅 Randevu Yönetimi
                  </Link>
                </>
              )}

              {/* Admin için */}
              {user?.role === "admin" && (
                <>
                  <Link
                    href="/admin/dashboard"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 transition-colors text-red-700 font-medium"
                  >
                    🔧 Admin Dashboard
                  </Link>
                  <Link
                    href="/admin/owners"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 transition-colors text-red-700"
                  >
                    👥 İşletme Onayları
                  </Link>
                  <Link
                    href="/admin/users"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 transition-colors text-red-700"
                  >
                    🏢 Kullanıcı Yönetimi
                  </Link>
                  <Link
                    href="/admin/centers"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 transition-colors text-red-700"
                  >
                    📊 İşletme Yönetimi
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Debug Info (Geliştirme için) */}
        <div className="bg-gray-800 text-white rounded-xl p-4 text-sm">
          <h4 className="font-semibold mb-2">Debug Info:</h4>
          <pre className="text-xs overflow-x-auto">
            {JSON.stringify({ user, isAuthenticated }, null, 2)}
          </pre>
        </div>
      </div>

      {/* 🎭 Profile Update Modal */}

      <UserProfileModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        currentUser={user}
        onUpdate={handleUpdateProfile}
        isUpdating={isUpdating}
      />
    </div>
  );
}

// Ana component - ProtectedRoute ile sarılmış
export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
