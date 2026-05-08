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
      pending: "bg-yellow-950/50 text-yellow-400 border-yellow-900",
      approved: "bg-green-950/50 text-green-400 border-green-900",
      rejected: "bg-red-950/50 text-red-400 border-red-900",
      cancelled: "bg-zinc-700 text-zinc-300 border-zinc-600",
      completed: "bg-blue-950/50 text-blue-400 border-blue-900",
      "no-show": "bg-orange-950/50 text-orange-400 border-orange-900",
    };
    return colors[status] || "bg-zinc-700 text-zinc-300 border-zinc-600";
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

  const counts = {
    pending: (appointmentsData?.appointments || []).filter((a) => a.status === "pending").length,
    approved: (appointmentsData?.appointments || []).filter((a) => a.status === "approved").length,
    today: (appointmentsData?.appointments || []).filter((a) => isToday(a.startDateTime)).length,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-zinc-400 text-sm">Randevular yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="bg-zinc-900 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-zinc-100">Randevular</h1>
              <p className="text-sm text-zinc-500 mt-1">
                Toplam{" "}
                <span className="font-medium text-zinc-300">{appointments.length}</span>{" "}
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
              <span className="text-zinc-400">Bekleyen:</span>
              <span className="font-semibold text-zinc-100">{counts.pending}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-zinc-400">Onaylı:</span>
              <span className="font-semibold text-zinc-100">{counts.approved}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span className="text-zinc-400">Bugün:</span>
              <span className="font-semibold text-zinc-100">{counts.today}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Status Tabs */}
            <div className="flex-1">
              <p className="text-xs font-medium text-zinc-500 mb-2 flex items-center gap-1">
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
                        : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Filter */}
            <div className="lg:w-64">
              <p className="text-xs font-medium text-zinc-500 mb-2 flex items-center gap-1">
                <Calendar size={12} /> Tarih
              </p>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
                />
                <button
                  onClick={() => setDateFilter(getTodayString())}
                  className="px-3 py-1.5 bg-blue-950/50 text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-900/50 transition-colors whitespace-nowrap"
                >
                  Bugün
                </button>
                {dateFilter && (
                  <button
                    onClick={() => setDateFilter("")}
                    className="px-3 py-1.5 bg-zinc-800 text-zinc-400 rounded-lg text-sm hover:bg-zinc-700 transition-colors"
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
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
            <Calendar className="mx-auto text-zinc-600 mb-4" size={56} />
            <h3 className="text-lg font-semibold text-zinc-100 mb-1">
              {statusFilter === "all" ? "Henüz randevu yok" : `${statusOptions.find((o) => o.value === statusFilter)?.label} randevu bulunmuyor`}
            </h3>
            <p className="text-zinc-500 text-sm">
              {statusFilter === "all" ? "Müşterilerinizin randevu alması bekleniyor" : "Farklı bir filtre deneyin"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((appointment) => (
              <div
                key={appointment._id}
                className={`rounded-xl border transition-all hover:border-zinc-700 ${
                  isToday(appointment.startDateTime)
                    ? "bg-blue-950/30 border-blue-900"
                    : "bg-zinc-900 border-zinc-800"
                }`}
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-10 h-10 bg-purple-950/50 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="text-purple-400" size={20} />
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Top row: name + status */}
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-zinc-100">
                              {appointment.userId?.fullName || "Müşteri"}
                            </h3>
                            {isToday(appointment.startDateTime) && (
                              <span className="text-xs font-medium text-blue-400 bg-blue-950/50 px-2 py-0.5 rounded-full">Bugün</span>
                            )}
                            {appointment.createdBy && (
                              <span className="text-xs text-purple-400 bg-purple-950/30 px-2 py-0.5 rounded-full">Owner Oluşturdu</span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-0.5">
                            {appointment.userId?.phone && (
                              <a href={`tel:${appointment.userId.phone}`} className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1">
                                <Phone size={11} />
                                {appointment.userId.phone}
                              </a>
                            )}
                            {appointment.userId?.email && (
                              <span className="text-xs text-zinc-500 flex items-center gap-1">
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
                        <span className="text-sm font-medium text-purple-400">
                          {appointment.serviceSnapshot?.name || "Hizmet"}
                        </span>
                        <span className="text-xs text-zinc-500">{appointment.serviceSnapshot?.duration} dk</span>
                        <span className="text-sm font-semibold text-green-400">{appointment.serviceSnapshot?.price}₺</span>
                      </div>

                      {/* Date & Time */}
                      <div className="flex items-center gap-5 mb-4 text-sm text-zinc-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-zinc-500" />
                          {formatDate(appointment.startDateTime)}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock size={14} className="text-zinc-500" />
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
                            className="flex items-center gap-1.5 px-3 py-1.5 border border-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors text-sm"
                          >
                            <Phone size={14} />
                            Ara
                          </a>
                        )}

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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-zinc-100 mb-4">
                Randevuyu {actionType === "approve" ? "Onayla" : "Reddet"}
              </h3>

              <div className="bg-zinc-800 rounded-lg p-4 mb-4">
                <p className="font-medium text-zinc-100">{selectedAppointment.userId?.fullName}</p>
                <p className="text-purple-400 text-sm mt-0.5">{selectedAppointment.serviceSnapshot?.name}</p>
                <p className="text-zinc-400 text-sm mt-0.5">
                  {formatDate(selectedAppointment.startDateTime)} · {formatTime(selectedAppointment.startDateTime)}
                </p>
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                  <MessageSquare size={14} className="inline mr-1" />
                  {actionType === "approve" ? "Not (opsiyonel)" : "Red sebebi *"}
                </label>
                <textarea
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none text-sm"
                  placeholder={actionType === "approve" ? "Opsiyonel not..." : "Reddetme sebebini yazın..."}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowActionModal(false)}
                  className="flex-1 px-4 py-2.5 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded-lg font-medium transition-colors text-sm"
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
