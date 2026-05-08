export function getErrorMessage(error, fallback = 'Bir hata oluştu. Lütfen tekrar deneyin.') {
  if (!error) return fallback

  if (error.status === 'FETCH_ERROR') {
    return 'Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.'
  }

  if (error.status === 'PARSING_ERROR') {
    return 'Sunucudan beklenmeyen bir yanıt alındı. Lütfen daha sonra tekrar deneyin.'
  }

  const status = error.status || error.originalStatus

  if (status === 429) return 'Çok fazla istek gönderildi. Lütfen birkaç dakika bekleyip tekrar deneyin.'
  if (status === 401) return 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.'
  if (status === 403) return 'Bu işlem için yetkiniz bulunmuyor.'
  if (status === 404) return 'Aradığınız kaynak bulunamadı.'
  if (status === 409) return error.data?.message || 'Bu bilgiler zaten sistemde kayıtlı.'
  if (status === 422) return error.data?.message || 'Girilen bilgiler geçersiz. Lütfen kontrol edin.'
  if (status >= 500) return 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.'

  return error.data?.message || fallback
}

// 429 hatalarında daha uzun süre göster
export function getToastDuration(error) {
  const status = error?.status || error?.originalStatus
  return status === 429 ? 8000 : 5000
}
