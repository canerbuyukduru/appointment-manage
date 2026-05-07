// app/owner/appointments/page.jsx
"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  useGetOwnerAppointmentsQuery,
  useUpdateAppointmentStatusMutation,
} from "@/lib/services/appointmentApi";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Check,
  X,
  Filter,
  CheckCircle,
  XCircle,
  Eye,
  MessageSquare,
  Plus,
  Mail,
} from "lucide-react";
import Link from "next/link";
import EmailStatusBadge from "@/components/EmailStatusBadge";

export default function OwnerAppointmentsPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState("");
  const [actionNotes, setActionNotes] = useState("");

  const {
    data: appointmentsData,
    isLoading,
    refetch,
  } = useGetOwnerAppointmentsQuery({
    status: statusFilter !== "all" ? statusFilter : undefined,
    date: dateFilter || undefined,
  });
  const [updateAppointmentStatus, { isLoading: isUpdating }] =
    useUpdateAppointmentStatusMutation();

  const appointments = appointmentsData?.appointments || [];

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      approved: "bg-green-100 text-green-800 border-green-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
      cancelled: "bg-gray-100 text-gray-800 border-gray-200",
      completed: "bg-blue-100 text-blue-800 border-blue-200",
      "no-show": "bg-orange-100 text-orange-800 border-orange-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getStatusText = (status) => {
    const texts = {
      pending: "Onay Bekliyor",
      approved: "Onaylandı",
      rejected: "Reddedildi",
      cancelled: "İptal Edildi",
      completed: "Tamamlandı",
      "no-show": "Gelmedi",
    };
    return texts[status] || status;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      weekday: "short",
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTodayString = () => new Date().toISOString().split("T")[0];

  const openActionModal = (appointment, type) => {
    setSelectedAppointment(appointment);
    setActionType(type);
    setActionNotes("");
    setShowActionModal(true);
  };

  const handleAction = async () => {
    if (!selectedAppointment) return;
    try {
      await updateAppointmentStatus({
        id: selectedAppointment._id,
        status: actionType === "approve" ? "approved" : "rejected",
        notes: actionNotes,
      }).unwrap();
      toast.success(actionType === "approve" ? "Randevu onaylandı!" : "Randevu reddedildi!");
      setShowActionModal(false);
      setSelectedAppointment(null);
      setActionNotes("");
      refetch();
    } catch (error) {
      toast.error(error.data?.message || "İşlem başarısız");
    }
  };

  const markAs = async (appointmentId, status) => {
    try {
      await updateAppointmentStatus({ id: appointmentId, status }).unwrap();
      toast.success(status === "completed" ? "Randevu tamamlandı" : "Müşteri gelmedi olarak işaretlendi");
      refetch();
    } catch {
      toast.error("İşlem başarısız");
    }
  };

  const isToday = (dateString) =>
    new Date(dateString).toDateString() === new Date().toDateString();

  const isPast = (dateString) => new Date(dateString) < new Date();

  const statusOptions = [
    { value: "all", label: "Tümü" },
    { value: "pending", label: "Bekleyenler" },
    { value: "approved", label: "Onaylılar" },
    { value: "completed", label: "Tamamlananlar" },
    { value: "cancelled", label: "İptaller" },
    { value: "rejected", label: "Reddedilenler" },
  ];

  // Özet sayaçlar
  const counts = {
    pending: (appointmentsData?.appointments || []).filter((a) => a.status === "pending").length,
    approved: (appointmentsData?.appointments || []).filter((a) => a.status === "approved").length,
    today: (appointmentsData?.appointments || []).filter((a) => isToday(a.startDateTime)).length,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm">Randevular yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Randevular</h1>
              <p className="text-sm text-gray-500 mt-1">
                Toplam{" "}
                <span className="font-medium text-gray-700">{appointments.length}</span>{" "}
                randevu
                {statusFilter !== "all" &&
                  ` · ${statusOptions.find((o) => o.value === statusFilter)?.label}`}
              </p>
            </div>
            <Link
              href="/owner/appointments/create"
              className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium shadow-sm"
            >
              <Plus size={18} />
              Yeni Randevu
            </Link>
          </div>

          {/* Mini Stats */}
          <div className="flex items-center gap-6 mt-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
              <span className="text-gray-600">Bekleyen:</span>
              <span className="font-semibold text-gray-900">{counts.pending}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-gray-600">Onaylı:</span>
              <span className="font-semibold text-gray-900">{counts.approved}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span className="text-gray-600">Bugün:</span>
              <span className="font-semibold text-gray-900">{counts.today}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Status Tabs */}
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                <Filter size={12} /> Durum
              </p>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setStatusFilter(option.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      statusFilter === option.value
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Filter */}
            <div className="lg:w-64">
              <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                <Calendar size={12} /> Tarih
              </p>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
                <button
                  onClick={() => setDateFilter(getTodayString())}
                  className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors whitespace-nowrap"
                >
                  Bugün
                </button>
                {dateFilter && (
                  <button
                    onClick={() => setDateFilter("")}
                    className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Appointments List */}
        {appointments.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Calendar className="mx-auto text-gray-300 mb-4" size={56} />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {statusFilter === "all" ? "Henüz randevu yok" : `${statusOptions.find((o) => o.value === statusFilter)?.label} randevu bulunmuyor`}
            </h3>
            <p className="text-gray-500 text-sm">
              {statusFilter === "all" ? "Müşterilerinizin randevu alması bekleniyor" : "Farklı bir filtre deneyin"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((appointment) => (
              <div
                key={appointment._id}
                className={`bg-white rounded-xl border transition-all hover:shadow-md ${
                  isToday(appointment.startDateTime)
                    ? "border-blue-200 bg-blue-50/30"
                    : "border-gray-200"
                }`}
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="text-purple-600" size={20} />
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Top row: name + status */}
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900">
                              {appointment.userId?.fullName || "Müşteri"}
                            </h3>
                            {isToday(appointment.startDateTime) && (
                              <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">Bugün</span>
                            )}
                            {appointment.createdBy && (
                              <span className="text-xs text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">Owner Oluşturdu</span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-0.5">
                            {appointment.userId?.phone && (
                              <a href={`tel:${appointment.userId.phone}`} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                                <Phone size={11} />
                                {appointment.userId.phone}
                              </a>
                            )}
                            {appointment.userId?.email && (
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Mail size={11} />
                                {appointment.userId.email}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${getStatusColor(appointment.status)}`}>
                          {getStatusText(appointment.status)}
                        </span>
                      </div>

                      {/* Service info */}
                      <div className="flex items-center gap-4 mb-3">
                        <span className="text-sm font-medium text-purple-700">
                          {appointment.serviceSnapshot?.name || "Hizmet"}
                        </span>
                        <span className="text-xs text-gray-500">{appointment.serviceSnapshot?.duration} dk</span>
                        <span className="text-sm font-semibold text-green-600">{appointment.serviceSnapshot?.price}₺</span>
                      </div>

                      {/* Date & Time */}
                      <div className="flex items-center gap-5 mb-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-gray-400" />
                          {formatDate(appointment.startDateTime)}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock size={14} className="text-gray-400" />
                          {formatTime(appointment.startDateTime)} – {formatTime(appointment.endDateTime)}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2">
                        {appointment.status === "pending" && (
                          <>
                            <button
                              onClick={() => openActionModal(appointment, "approve")}
                              disabled={isUpdating}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50"
                            >
                              <Check size={14} />
                              Onayla
                            </button>
                            <button
                              onClick={() => openActionModal(appointment, "reject")}
                              disabled={isUpdating}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50"
                            >
                              <X size={14} />
                              Reddet
                            </button>
                          </>
                        )}

                        {appointment.status === "approved" && isPast(appointment.startDateTime) && (
                          <>
                            <button
                              onClick={() => markAs(appointment._id, "completed")}
                              disabled={isUpdating}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50"
                            >
                              <CheckCircle size={14} />
                              Tamamlandı
                            </button>
                            <button
                              onClick={() => markAs(appointment._id, "no-show")}
                              disabled={isUpdating}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium disabled:opacity-50"
                            >
                              <XCircle size={14} />
                              Gelmedi
                            </button>
                          </>
                        )}

                        {appointment.userId?.phone && (
                          <a
                            href={`tel:${appointment.userId.phone}`}
                            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                          >
                            <Phone size={14} />
                            Ara
                          </a>
                        )}

                        {/* Email status badges */}
                        {appointment.emailsSent?.approved && (
                          <EmailStatusBadge emailSent={true} type="approved" />
                        )}
                        {appointment.reminderSent && (
                          <EmailStatusBadge emailSent={true} type="reminder" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Modal */}
      {showActionModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Randevuyu {actionType === "approve" ? "Onayla" : "Reddet"}
              </h3>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="font-medium text-gray-900">{selectedAppointment.userId?.fullName}</p>
                <p className="text-purple-600 text-sm mt-0.5">{selectedAppointment.serviceSnapshot?.name}</p>
                <p className="text-gray-500 text-sm mt-0.5">
                  {formatDate(selectedAppointment.startDateTime)} · {formatTime(selectedAppointment.startDateTime)}
                </p>
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <MessageSquare size={14} className="inline mr-1" />
                  {actionType === "approve" ? "Not (opsiyonel)" : "Red sebebi *"}
                </label>
                <textarea
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none text-sm"
                  placeholder={actionType === "approve" ? "Opsiyonel not..." : "Reddetme sebebini yazın..."}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowActionModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
                >
                  İptal
                </button>
                <button
                  onClick={handleAction}
                  disabled={isUpdating || (actionType === "reject" && !actionNotes.trim())}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors text-sm disabled:opacity-50 ${
                    actionType === "approve"
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-red-600 text-white hover:bg-red-700"
                  }`}
                >
                  {isUpdating
                    ? actionType === "approve" ? "Onaylanıyor..." : "Reddediliyor..."
                    : actionType === "approve" ? "Onayla" : "Reddet"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
