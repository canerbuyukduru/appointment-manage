'use client';

import { useParams } from 'next/navigation';
import { useGetCommentsByCenterQuery, useCreateCommentMutation } from '@/lib/services/commentApi';
import { Star, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function CenterDetailPage() {
  const { id } = useParams();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  
  const { data: commentsData, isLoading } = useGetCommentsByCenterQuery({ 
    beautyCenterId: id,
    page: 1,
    limit: 10 
  });
  
  const [createComment, { isLoading: isCreating }] = useCreateCommentMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (comment.trim().length < 3) {
      toast.error('Yorum en az 3 karakter olmalı');
      return;
    }

    try {
      await createComment({
        beautyCenterId: id,
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* İşletme Bilgileri */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        {/* ... işletme detayları ... */}
      </div>

      {/* Yorumlar Bölümü */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <MessageCircle className="text-purple-600" />
          Yorumlar ve Değerlendirmeler
        </h2>

        {/* Ortalama Puan */}
        {commentsData && (
          <div className="bg-purple-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Ortalama Puan</p>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-gray-900">
                    {commentsData.avgRating.toFixed(1)}
                  </span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={20}
                        className={star <= Math.round(commentsData.avgRating) 
                          ? 'fill-yellow-400 text-yellow-400' 
                          : 'text-gray-300'}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Toplam Yorum</p>
                <p className="text-2xl font-bold text-gray-900">
                  {commentsData.pagination.totalComments}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Yorum Ekleme Formu */}
        <form onSubmit={handleSubmit} className="mb-8 border-b pb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Yorum Yap</h3>
          
          {/* Yıldız Seçimi */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Puan Verin
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
                      : 'text-gray-300'}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Yorum Metni */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Yorumunuz
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              maxLength={500}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              placeholder="Deneyiminizi paylaşın..."
            />
            <p className="text-sm text-gray-500 mt-1">
              {comment.length}/500 karakter
            </p>
          </div>

          <button
            type="submit"
            disabled={isCreating || comment.trim().length < 3}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isCreating ? 'Gönderiliyor...' : 'Yorum Gönder'}
          </button>
        </form>

        {/* Yorumlar Listesi */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-600 mt-4">Yorumlar yükleniyor...</p>
          </div>
        ) : commentsData?.comments.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <MessageCircle size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Henüz yorum yapılmamış</p>
            <p className="text-sm">İlk yorumu siz yapın!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {commentsData?.comments.map((item) => (
              <div key={item._id} className="border-b pb-4 last:border-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {item.userId?.fullName || 'Anonim'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={16}
                            className={star <= item.rating 
                              ? 'fill-yellow-400 text-yellow-400' 
                              : 'text-gray-300'}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-700">{item.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}