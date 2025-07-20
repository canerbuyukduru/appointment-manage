import React from "react";
import { useForm } from "react-hook-form";
import { useRegisterUserMutation } from "../redux/api/userApi";
import { useRegisterOwnerMutation } from "../redux/api/ownerApi";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { setOwnerInfo } from "../redux/features/ownerSlice";

export default function RegisterForm() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formType, setFormType] = React.useState(null); // null, 'user', 'owner'
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  const [registerUser, { isLoading, isError, error }] = useRegisterUserMutation();
  const [registerOwner, { isLoading: isOwnerLoading, isError: isOwnerError, error: ownerError }] = useRegisterOwnerMutation();  

  // Normal kullanıcı kayıt handler
  const handleUserRegister = async (data) => {
    try {
      const result = await registerUser(data).unwrap();
      console.log("Kayıt başarılı:", result);
      navigate("/login");
      toast.success("Kayıt başarılı! Giriş yapabilirsiniz.");
      reset();
    } catch (err) {
      console.error("Kayıt hatası:", err);
      toast.error("Kayıt hatası! Lütfen tekrar deneyin.");
    }
  };

  // Owner kayıt handler
  const handleOwnerRegister = async (data) => {
    try {
      let payload = { ...data };
      payload.address = {
        street: data.street,
        city: data.city,
        district: data.district,
        full: data.full_address
      };
      payload.location = {
        latitude: Number(data.latitude),
        longitude: Number(data.longitude)
      };
      const result = await registerOwner(payload).unwrap();
      console.log("Owner kayıt başarılı:", result);
      navigate("/login");
      toast.success("Owner kayıt başarılı! Giriş yapabilirsiniz.");
      reset();
      dispatch(setOwnerInfo(result));
    } catch (err) {
      console.error("Owner kayıt hatası:", err);
      toast.error("Owner kayıt hatası! Lütfen tekrar deneyin.");
    }
  };


  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Kayıt Ol</h2>
      {!formType && (
        <div className="flex space-x-2 mb-6">
          <button
            type="button"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
            onClick={() => setFormType('user')}
          >
            Kullanıcı Kayıt
          </button>
          <button
            type="button"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
            onClick={() => setFormType('owner')}
          >
            Owner Kayıt
          </button>
        </div>
      )}

      {formType === 'user' && (
        <form className="space-y-4" onSubmit={handleSubmit(handleUserRegister)}>
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Ad Soyad</label>
            <input
              type="text"
              {...register("full_name", { required: "Ad soyad zorunlu" })}
              className="w-full border px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {errors.full_name && (
              <p className="text-red-500 text-sm">{errors.full_name.message}</p>
            )}
          </div>
          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              {...register("email", { required: "Email zorunlu" })}
              className="w-full border px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>
          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1">Şifre</label>
            <input
              type="password"
              {...register("password", {
                required: "Şifre zorunlu",
                minLength: { value: 6, message: "Şifre en az 6 karakter olmalı" },
              })}
              className="w-full border px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
          </div>
          {/* Telefon */}
          <div>
            <label className="block text-sm font-medium mb-1">Telefon</label>
            <input
              type="tel"
              {...register("phone", { required: "Telefon zorunlu" })}
              className="w-full border px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm">{errors.phone.message}</p>
            )}
          </div>
          <div className="flex space-x-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
            >
              {isLoading ? "Kaydediliyor..." : "Kayıt Ol"}
            </button>
            <button
              type="button"
              className="w-full bg-gray-400 text-white py-2 rounded-md hover:bg-gray-500 transition"
              onClick={() => setFormType(null)}
            >
              Geri
            </button>
          </div>
          {isError && (
            <p className="text-red-600 text-sm mt-2">
              {error?.data?.message || "Hata oluştu"}
            </p>
          )}
        </form>
      )}

      {formType === 'owner' && (
        <form className="space-y-4" onSubmit={handleSubmit(handleOwnerRegister)}>
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Ad Soyad</label>
            <input
              type="text"
              {...register("full_name", { required: "Ad soyad zorunlu" })}
              className="w-full border px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {errors.full_name && (
              <p className="text-red-500 text-sm">{errors.full_name.message}</p>
            )}
          </div>
          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              {...register("email", { required: "Email zorunlu" })}
              className="w-full border px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>
          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1">Şifre</label>
            <input
              type="password"
              {...register("password", {
                required: "Şifre zorunlu",
                minLength: { value: 6, message: "Şifre en az 6 karakter olmalı" },
              })}
              className="w-full border px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
          </div>
          {/* Telefon */}
          <div>
            <label className="block text-sm font-medium mb-1">Telefon</label>
            <input
              type="tel"
              {...register("phone", { required: "Telefon zorunlu" })}
              className="w-full border px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm">{errors.phone.message}</p>
            )}
          </div>
          {/* Center Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Merkez Adı</label>
            <input
              type="text"
              {...register("center_name", { required: "Merkez adı zorunlu" })}
              className="w-full border px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {errors.center_name && (
              <p className="text-red-500 text-sm">{errors.center_name.message}</p>
            )}
          </div>
          {/* Address Fields */}
          <div>
            <label className="block text-sm font-medium mb-1">Adres (Sokak)</label>
            <input type="text" {...register("street", { required: "Sokak zorunlu" })} className="w-full border px-4 py-2 rounded-md" />
            {errors.street && <p className="text-red-500 text-sm">{errors.street.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Adres (Şehir)</label>
            <input type="text" {...register("city", { required: "Şehir zorunlu" })} className="w-full border px-4 py-2 rounded-md" />
            {errors.city && <p className="text-red-500 text-sm">{errors.city.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Adres (İlçe)</label>
            <input type="text" {...register("district", { required: "İlçe zorunlu" })} className="w-full border px-4 py-2 rounded-md" />
            {errors.district && <p className="text-red-500 text-sm">{errors.district.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Adres (Tam Adres)</label>
            <input type="text" {...register("full_address", { required: "Tam adres zorunlu" })} className="w-full border px-4 py-2 rounded-md" />
            {errors.full_address && <p className="text-red-500 text-sm">{errors.full_address.message}</p>}
          </div>
          {/* Location Fields */}
          <div>
            <label className="block text-sm font-medium mb-1">Enlem (latitude)</label>
            <input type="number" step="any" {...register("latitude", { required: "Enlem zorunlu" })} className="w-full border px-4 py-2 rounded-md" />
            {errors.latitude && <p className="text-red-500 text-sm">{errors.latitude.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Boylam (longitude)</label>
            <input type="number" step="any" {...register("longitude", { required: "Boylam zorunlu" })} className="w-full border px-4 py-2 rounded-md" />
            {errors.longitude && <p className="text-red-500 text-sm">{errors.longitude.message}</p>}
          </div>
          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">Açıklama</label>
            <input type="text" {...register("description", { required: "Açıklama zorunlu" })} className="w-full border px-4 py-2 rounded-md" />
            {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
          </div>
          {/* Center Phone */}
          <div>
            <label className="block text-sm font-medium mb-1">Merkez Telefon</label>
            <input type="text" {...register("center_phone", { required: "Merkez telefon zorunlu" })} className="w-full border px-4 py-2 rounded-md" />
            {errors.center_phone && <p className="text-red-500 text-sm">{errors.center_phone.message}</p>}
          </div>
          {/* Center Email */}
          <div>
            <label className="block text-sm font-medium mb-1">Merkez Email</label>
            <input type="email" {...register("center_email", { required: "Merkez email zorunlu" })} className="w-full border px-4 py-2 rounded-md" />
            {errors.center_email && <p className="text-red-500 text-sm">{errors.center_email.message}</p>}
          </div>
          <div className="flex space-x-2">
            <button
              type="submit"
              disabled={isOwnerLoading}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
            >
              {isOwnerLoading ? "Kaydediliyor..." : "Owner Kayıt"}
            </button>
            <button
              type="button"
              className="w-full bg-gray-400 text-white py-2 rounded-md hover:bg-gray-500 transition"
              onClick={() => setFormType(null)}
            >
              Geri
            </button>
          </div>
          {isOwnerError && (
            <p className="text-red-600 text-sm mt-2">
              {ownerError?.data?.message || "Owner kayıt hatası oluştu"}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
