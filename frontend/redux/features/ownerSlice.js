import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  ownerInfo: localStorage.getItem("ownerInfo")
    ? JSON.parse(localStorage.getItem("ownerInfo"))
    : null,
  beautyCenter: localStorage.getItem("beautyCenter")
    ? JSON.parse(localStorage.getItem("beautyCenter"))
    : null,
};

const ownerSlice = createSlice({
  name: "owner",
  initialState,
  reducers: {
    setOwnerInfo: (state, action) => {
      state.ownerInfo = action.payload;
      localStorage.setItem("ownerInfo", JSON.stringify(action.payload));
      localStorage.setItem(
        "beautyCenter",
        JSON.stringify(action.payload.beautyCenter)
      );
    },
    clearOwnerInfo: (state) => {
      state.ownerInfo = null;
      localStorage.removeItem("ownerInfo");
      localStorage.removeItem("beautyCenter");
    },
  },
});

export const { setOwnerInfo, clearOwnerInfo } = ownerSlice.actions;

export default ownerSlice.reducer;
