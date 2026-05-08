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
import { User, Building, Shield, Edit3 } from "lucide-react";
import { getErrorMessage, getToastDuration } from "@/lib/utils/errorMessages";
import ProtectedRoute from "@/components/ProtectedRoute";
import OwnerNavbar from "@/components/OwnerNavbar";
import UserNavbar from "@/components/UserNavbar";
import AdminNavbar from "@/components/AdminNavbar";
import Link from "next/link";

function DashboardContent() {
  const dispatch = useDispatch();
  const router = useRouter();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [updateOwnerProfile, { isLoading: isUpdating }] =
    useUpdateOwnerProfileMutation();
  const [updateUserProfile, { isLoading: isUserUpdating }] =
    useUpdateUserProfileMutation();
  const [logoutMutation, { isLoading }] = useLogoutMutation();

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleUpdateProfile = async (updateData) => {
    try {
      if (user.role === "user") {
        const result = await updateUserProfile(updateData).unwrap();
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
      toast.error(getErrorMessage(error, 'Profil güncellenirken hata oluştu'), { duration: getToastDuration(error) });
    }
  };

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
      dispatch(logout());
      toast.success("Başarıyla çıkış yapıldı");
      router.push("/login");
    } catch (error) {
      toast.error(getErrorMessage(error, 'Çıkış yapılamadı'), { duration: getToastDuration(error) });
    }
  };

  const getRoleIcon = (role) => {
    if (!role) return <User className="text-zinc-400" size={24} />;

    switch (role) {
      case "user":
        return <User className="text-blue-500" size={24} />;
      case "owner":
        return <Building className="text-purple-500" size={24} />;
      case "admin":
        return <Shield className="text-red-500" size={24} />;
      default:
        return <User className="text-zinc-400" size={24} />;
    }
  };

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
    <div className="min-h-screen bg-zinc-950">
      {user?.role === "owner" ? (
        <OwnerNavbar />
      ) : user?.role === "admin" ? (
        <AdminNavbar />
      ) : (
        <UserNavbar />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-4">
            {getRoleIcon(user?.role)}
            <div>
              <h2 className="text-2xl font-semibold text-zinc-100">
                Hoş geldiniz, {user?.fullName || "Kullanıcı"}
              </h2>
              <p className="text-zinc-400 mt-1">
                {getRoleDescription(user?.role)}
              </p>
            </div>
          </div>
        </div>

        {/* User Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
          {/* Kullanıcı Bilgileri */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-zinc-100">
                Kullanıcı Bilgileri
              </h3>
              <button
                onClick={handleOpenModal}
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition-colors group"
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
                <label className="text-sm text-zinc-400">Ad Soyad</label>
                <p className="font-medium text-zinc-100">
                  {user?.fullName || "Bilinmiyor"}
                </p>
              </div>
              <div>
                <label className="text-sm text-zinc-400">E-posta</label>
                <p className="font-medium text-zinc-100">
                  {user?.email || "Bilinmiyor"}
                </p>
              </div>
              <div>
                <label className="text-sm text-zinc-400">Telefon</label>
                <p className="font-medium text-zinc-100">
                  {user?.phone || "Bilinmiyor"}
                </p>
              </div>
              <div>
                <label className="text-sm text-zinc-400">Rol</label>
                <div className="flex items-center gap-2">
                  {getRoleIcon(user?.role)}
                  <span className="font-medium capitalize text-zinc-100">
                    {user?.role || "Bilinmiyor"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Hızlı İşlemler */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-zinc-100 mb-4">
              {user?.role === "admin" ? "Admin Panel" : "Hızlı Eylemler"}
            </h3>
            <div className="space-y-3">
              {/* User için */}
              {user?.role === "user" && (
                <>
                  <button
                    onClick={() => router.push("/")}
                    className="w-full text-left p-3 text-zinc-300 cursor-pointer rounded-lg hover:bg-zinc-800 transition-colors"
                  >
                    📅 Randevu Al
                  </button>
                  <button
                    onClick={() => router.push("/user/appointments")}
                    className="w-full text-left p-3 text-zinc-300 cursor-pointer rounded-lg hover:bg-zinc-800 transition-colors"
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
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800 transition-colors text-purple-400 font-medium"
                  >
                    📊 Owner Dashboard
                  </Link>
                  <Link
                    href="/owner/beauty-center"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-300"
                  >
                    🏢 İşletme Yönetimi
                  </Link>
                  <Link
                    href="/owner/departments"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-300"
                  >
                    📂 Departmanlar
                  </Link>
                  <Link
                    href="/owner/appointments"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-300"
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
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800 transition-colors text-red-400 font-medium"
                  >
                    🔧 Admin Dashboard
                  </Link>
                  <Link
                    href="/admin/owners"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800 transition-colors text-red-400"
                  >
                    👥 İşletme Onayları
                  </Link>
                  <Link
                    href="/admin/users"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800 transition-colors text-red-400"
                  >
                    🏢 Kullanıcı Yönetimi
                  </Link>
                  <Link
                    href="/admin/centers"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800 transition-colors text-red-400"
                  >
                    📊 İşletme Yönetimi
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Update Modal */}
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
