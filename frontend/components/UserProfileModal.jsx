// components/UserProfileModal.jsx
import React, { useState, useEffect } from 'react';

const UserProfileModal = ({ isOpen, onClose, currentUser, onUpdate, isUpdating }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    oldPassword: '',
    password: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && currentUser) {
      setFormData(prev => ({
        ...prev,
        fullName: currentUser.fullName || '',
        phone: currentUser.phone || ''
      }));
    }
  }, [isOpen, currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Ad soyad alanı zorunludur';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Ad soyad en az 2 karakter olmalıdır';
    }

    if (formData.phone && !/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Geçerli bir telefon numarası giriniz (10-11 rakam)';
    }

    if (formData.password) {
      if (!formData.oldPassword) {
        newErrors.oldPassword = 'Şifre değiştirmek için mevcut şifrenizi giriniz';
      }

      if (formData.password.length < 6) {
        newErrors.password = 'Yeni şifre en az 6 karakter olmalıdır';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Yeni şifreler eşleşmiyor';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const updateData = {
      fullName: formData.fullName.trim(),
      phone: formData.phone.trim(),
    };

    if (formData.password) {
      updateData.oldPassword = formData.oldPassword;
      updateData.password = formData.password;
    }

    onUpdate(updateData);
  };

  const handleClose = () => {
    setFormData({
      fullName: '',
      phone: '',
      oldPassword: '',
      password: '',
      confirmPassword: ''
    });
    setErrors({});
    setShowPasswords({
      oldPassword: false,
      newPassword: false,
      confirmPassword: false
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-950/50 rounded-full flex items-center justify-center">
              <span className="text-purple-400 font-semibold">👤</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-zinc-100">Profil Güncelle</h2>
              <p className="text-sm text-zinc-400">Kişisel bilgilerinizi güncelleyin</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
            disabled={isUpdating}
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                E-posta Adresi
              </label>
              <input
                type="email"
                value={currentUser?.email || ''}
                disabled
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-zinc-500 cursor-not-allowed"
              />
              <p className="text-xs text-zinc-500 mt-1">E-posta adresi değiştirilemez</p>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Ad Soyad *
              </label>
              <input
                type="text"
                name="fullName"
                value={formData?.fullName}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 bg-zinc-800 border rounded-xl text-zinc-100 placeholder-zinc-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all ${
                  errors.fullName ? 'border-red-700 bg-red-950/20' : 'border-zinc-700'
                }`}
                placeholder="Adınız ve soyadınız"
              />
              {errors.fullName && (
                <p className="text-red-400 text-sm mt-1">{errors.fullName}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Telefon Numarası
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 bg-zinc-800 border rounded-xl text-zinc-100 placeholder-zinc-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all ${
                  errors.phone ? 'border-red-700 bg-red-950/20' : 'border-zinc-700'
                }`}
                placeholder="0xxx xxx xx xx"
              />
              {errors.phone && (
                <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Password Change Section */}
            <div className="border-t border-zinc-800 pt-6">
              <h3 className="text-lg font-medium text-zinc-100 mb-4">
                Şifre Değiştir (Opsiyonel)
              </h3>

              {/* Mevcut Şifre */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Mevcut Şifre
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.oldPassword ? 'text' : 'password'}
                    name="oldPassword"
                    value={formData.oldPassword}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 pr-12 bg-zinc-800 border rounded-xl text-zinc-100 placeholder-zinc-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all ${
                      errors.oldPassword ? 'border-red-700 bg-red-950/20' : 'border-zinc-700'
                    }`}
                    placeholder="Mevcut şifrenizi giriniz"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('oldPassword')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {showPasswords.oldPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {errors.oldPassword && (
                  <p className="text-red-400 text-sm mt-1">{errors.oldPassword}</p>
                )}
              </div>

              {/* Yeni Şifre */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Yeni Şifre
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.newPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 pr-12 bg-zinc-800 border rounded-xl text-zinc-100 placeholder-zinc-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all ${
                      errors.password ? 'border-red-700 bg-red-950/20' : 'border-zinc-700'
                    }`}
                    placeholder="Yeni şifrenizi giriniz"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('newPassword')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {showPasswords.newPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              {/* Yeni Şifre Tekrar */}
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Yeni Şifre (Tekrar)
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 pr-12 bg-zinc-800 border rounded-xl text-zinc-100 placeholder-zinc-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all ${
                      errors.confirmPassword ? 'border-red-700 bg-red-950/20' : 'border-zinc-700'
                    }`}
                    placeholder="Yeni şifrenizi tekrar giriniz"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirmPassword')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {showPasswords.confirmPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={isUpdating}
              className="flex-1 px-4 py-3 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-purple-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isUpdating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Güncelleniyor...
                </>
              ) : (
                'Güncelle'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfileModal;
