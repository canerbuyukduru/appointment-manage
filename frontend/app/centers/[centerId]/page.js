// app/centers/[id]/page.js
'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import {
  useGetAllBeautyCentersQuery,
  useGetCenterDepartmentsQuery
} from '@/lib/services/beautyCenterApi';
import {
  useGetCommentsByCenterQuery,
  useCreateCommentMutation,
  useDeleteCommentMutation
} from '@/lib/services/commentApi';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Clock,
  Star,
  MessageCircle,
  Calendar,
  Trash2,
  Building2
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function CenterDetailPage() {
  const params = useParams();
  const router = useRouter();
  const centerId = params.centerId;
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [commentPage, setCommentPage] = useState(1);

  const { data: centersData, isLoading: isLoadingCenter } = useGetAllBeautyCentersQuery({});
  const center = centersData?.find(c => c._id === centerId);

  const { data: departmentsData } = useGetCenterDepartmentsQuery(centerId, {
    skip: !centerId
  });

  const { data: commentsData, isLoading: isLoadingComments } = useGetCommentsByCenterQuery({
    beautyCenterId: centerId,
    page: commentPage,
    limit: 10
  }, {
    skip: !centerId
  });

  const [createComment, { isLoading: isCreating }] = useCreateCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();

  const departments = departmentsData || [];

  const handleSubmitComment = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Yorum yapmak için giriş yapmalısınız');
      router.push('/login');
      return;
    }

    if (comment.trim().length < 3) {
      toast.error('Yorum en az 3 karakter olmalıdır');
      return;
    }

    try {
      await createComment({
        beautyCenterId: centerId,
        rating,
        comment: comment.trim(),
      }).unwrap();

      toast.success('Yorumunuz başarıyla eklendi!');
      setComment('');
      setRating(5);
    } catch (error) {
      toast.error(error?.data?.message || 'Yorum eklenirken hata oluştu');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Bu yorumu silmek istediğinizden emin misiniz?')) return;

    try {
      await deleteComment(commentId).unwrap();
      toast.success('Yorum başarıyla silindi');
    } catch (error) {
      toast.error(error?.data?.message || 'Yorum silinemedi');
    }
  };

  if (isLoadingCenter) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!center) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-zinc-100 mb-4">Merkez Bulunamadı</h2>
          <p className="text-zinc-400 mb-6">Aradığınız güzellik merkezi bulunamadı.</p>
          <Link href="/" className="text-purple-400 hover:text-purple-300 font-medium">
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  const getCurrentStatus = (workingHours) => {
    if (!workingHours) return { isOpen: false, text: 'Bilinmiyor' };

    const now = new Date();
    const currentDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const daySchedule = workingHours[currentDay];
    if (!daySchedule || daySchedule.isClosed) {
      return { isOpen: false, text: 'Bugün Kapalı' };
    }

    const openTime = daySchedule.open ? parseInt(daySchedule.open.split(':')[0]) * 60 + parseInt(daySchedule.open.split(':')[1]) : 0;
    const closeTime = daySchedule.close ? parseInt(daySchedule.close.split(':')[0]) * 60 + parseInt(daySchedule.close.split(':')[1]) : 0;

    if (currentTime >= openTime && currentTime <= closeTime) {
      return { isOpen: true, text: `Açık - ${daySchedule.close}'a kadar` };
    }

    return { isOpen: false, text: `Kapalı - ${daySchedule.open}'de açılır` };
  };

  const status = getCurrentStatus(center.workingHours);

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <ArrowLeft size={20} />
            Ana Sayfa
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Merkez Bilgileri */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-zinc-100 mb-2">{center.name}</h1>

              {/* İletişim Bilgileri */}
              <div className="flex flex-wrap gap-4 text-zinc-300 mb-4">
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-purple-400" />
                  <span>{typeof center.location === 'string' ? center.location : center.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={18} className="text-purple-400" />
                  <span>{center.phone}</span>
                </div>
                {center.email && (
                  <div className="flex items-center gap-2">
                    <Mail size={18} className="text-purple-400" />
                    <span>{center.email}</span>
                  </div>
                )}
              </div>

              {/* Durum */}
              <div className="flex items-center gap-2">
                <Clock size={18} className={status.isOpen ? 'text-green-400' : 'text-red-400'} />
                <span className={`font-medium ${status.isOpen ? 'text-green-400' : 'text-red-400'}`}>
                  {status.text}
                </span>
              </div>
            </div>

            {/* Ortalama Puan */}
            {commentsData && commentsData.pagination.totalComments > 0 && (
              <div className="text-right">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="text-yellow-400 fill-yellow-400" size={24} />
                  <span className="text-3xl font-bold text-zinc-100">
                    {commentsData.avgRating.toFixed(1)}
                  </span>
                </div>
                <p className="text-sm text-zinc-500">
                  {commentsData.pagination.totalComments} yorum
                </p>
              </div>
            )}
          </div>

          {/* Açıklama */}
          {center.description && (
            <p className="text-zinc-300 leading-relaxed mb-6 p-4 bg-zinc-800 border border-zinc-700 rounded-lg">
              {center.description}
            </p>
          )}

          {/* Randevu Al Butonu */}
          <Link
            href={`/centers/${centerId}/booking`}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all font-medium text-lg"
          >
            <Calendar size={20} />
            Randevu Al
          </Link>
        </div>

        {/* Departmanlar ve Hizmetler */}
        {departments.length > 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-zinc-100 mb-6 flex items-center gap-2">
              <Building2 className="text-purple-400" />
              Departmanlar
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {departments.map((dept) => (
                <div
                  key={dept._id}
                  className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 hover:border-purple-700 transition-colors"
                >
                  <h3 className="font-semibold text-zinc-100 mb-2">{dept.name}</h3>
                  {dept.description && (
                    <p className="text-sm text-zinc-400">{dept.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Yorumlar Bölümü */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-zinc-100 mb-6 flex items-center gap-2">
            <MessageCircle className="text-purple-400" />
            Yorumlar ve Değerlendirmeler
          </h2>

          {/* Yorum Ekleme Formu */}
          {isAuthenticated ? (
            <form onSubmit={handleSubmitComment} className="mb-8 border-b border-zinc-800 pb-8">
              <h3 className="font-semibold text-zinc-100 mb-4">Deneyiminizi Paylaşın</h3>

              {/* Yıldız Seçimi */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Puanınız
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        size={32}
                        className={star <= rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-zinc-600'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Yorum Metni */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Yorumunuz
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  maxLength={500}
                  className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
                  placeholder="Deneyiminizi paylaşın..."
                />
                <p className="text-sm text-zinc-500 mt-1">
                  {comment.length}/500 karakter
                </p>
              </div>

              <button
                type="submit"
                disabled={isCreating || comment.trim().length < 3}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isCreating ? 'Gönderiliyor...' : 'Yorum Gönder'}
              </button>
            </form>
          ) : (
            <div className="mb-8 p-6 bg-zinc-800 border border-zinc-700 rounded-lg">
              <p className="text-zinc-300 mb-3">Yorum yapmak için giriş yapmalısınız.</p>
              <Link
                href="/login"
                className="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Giriş Yap
              </Link>
            </div>
          )}

          {/* Yorumlar Listesi */}
          {isLoadingComments ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-zinc-400 mt-4">Yorumlar yükleniyor...</p>
            </div>
          ) : !commentsData || commentsData.comments.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              <MessageCircle size={48} className="mx-auto mb-4 text-zinc-600" />
              <p className="text-lg font-medium">Henüz yorum yapılmamış</p>
              <p className="text-sm">İlk yorumu siz yapın!</p>
            </div>
          ) : (
            <>
              <div className="space-y-6">
                {commentsData.comments.map((item) => (
                  <div key={item._id} className="border-b border-zinc-800 pb-6 last:border-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-purple-950/50 rounded-full flex items-center justify-center">
                            <span className="text-purple-400 font-semibold">
                              {item.userId?.fullName?.charAt(0) || '?'}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-zinc-100">
                              {item.userId?.fullName || 'Anonim'}
                            </p>
                            <div className="flex items-center gap-2">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    size={16}
                                    className={star <= item.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-zinc-600'}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-zinc-500">
                                {new Date(item.createdAt).toLocaleDateString('tr-TR', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-zinc-300 leading-relaxed ml-13">
                          {item.comment}
                        </p>
                      </div>

                      {user && item.userId?._id === user._id && (
                        <button
                          onClick={() => handleDeleteComment(item._id)}
                          className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors"
                          title="Yorumu sil"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {commentsData.pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <button
                    onClick={() => setCommentPage(p => Math.max(1, p - 1))}
                    disabled={!commentsData.pagination.hasPrev}
                    className="px-4 py-2 bg-zinc-900 border border-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Önceki
                  </button>
                  <span className="px-4 py-2 bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-lg">
                    Sayfa {commentsData.pagination.currentPage} / {commentsData.pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setCommentPage(p => p + 1)}
                    disabled={!commentsData.pagination.hasNext}
                    className="px-4 py-2 bg-zinc-900 border border-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Sonraki
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
