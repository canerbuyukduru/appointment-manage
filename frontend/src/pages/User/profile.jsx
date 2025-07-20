

import React from "react";
import { useSelector } from "react-redux";

export default function Profile() {
  const userInfo = useSelector((state) => state.auth.userInfo);
  console.log("Profile UserInfo:",userInfo)

  console.log(userInfo)

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Profil Bilgileri</h2>
      <div className="space-y-4">
        <p><strong>Ad:</strong> {userInfo.full_name || userInfo.name}</p>
        <p><strong>Email:</strong> {userInfo.email}</p>
        {/* Diğer profil bilgilerini buraya ekleyebilirsiniz */}
      </div>
    </div>
  );
}
