import React from "react";
import { useForm } from "react-hook-form";
import { useLoginMutation } from "../redux/api/userApi";
import { useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { setCredentials } from "../redux/features/auth/authSlice";
import { toast } from "react-toastify";
import { useLazyGetMyBeautyCenterQuery } from "../redux/api/ownerApi";

export default function Login() {
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();

  const [loginUser, { isLoading, isError, error }] = useLoginMutation();

  const [triggerGetBeautyCenter] = useLazyGetMyBeautyCenterQuery();

  const onSubmit = async (data) => {
    try {
      const result = await loginUser(data).unwrap();

      const baseUserData = {
        full_name: result.user.full_name,
        email: result.user.email,
        role: result.user.role,
        token: result.token,
      };

      if (result.user.role === "owner") {
        // 1. Önce token'ı kaydet
        dispatch(setCredentials(baseUserData));

        // 2. Sonra beauty center'ı çek
        const beautyCenterResult = await triggerGetBeautyCenter();
        
        if (beautyCenterResult.data) {
          // 3. Owner bilgilerini beauty center ile güncelle      
          const ownerData = { ...baseUserData, beautyCenter: beautyCenterResult.data };
          // 4. Redux store ve localStorage'ı güncelle
          dispatch(setCredentials(ownerData));
          localStorage.setItem("userInfo", JSON.stringify(ownerData));
          toast.success("Owner girişi ve beauty center bilgileri yüklendi!");
          navigate("/profile");
        } else {
          toast.error("Beauty center bilgileri alınamadı!");
          navigate("/profile");
        }
      } else {
        // Normal kullanıcı
        dispatch(setCredentials(baseUserData));
        localStorage.setItem("userInfo", JSON.stringify(baseUserData));
        toast.success("User girişi başarılı!");
        navigate("/profile");
      }
    } catch (err) {
      console.error("Giriş hatası:", err);
      toast.error("Giriş başarısız! Lütfen bilgilerinizi kontrol edin.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Giriş Yap</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          {isLoading ? "Giriş Yapılıyor..." : "Giriş Yap"}
        </button>

        {isError && (
          <p className="text-red-600 text-sm mt-2">
            {error?.data?.message || "Hata oluştu"}
          </p>
        )}
      </form>
    </div>
  );
}
