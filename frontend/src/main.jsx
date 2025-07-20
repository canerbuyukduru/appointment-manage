import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import store from "../redux/store";

import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import { Provider } from "react-redux";
import Profile from "./pages/User/profile";
import Login from "../components/Login";
import RegisterForm from "../components/Register";
import PrivateRoute from "../components/PrivateRoute";
import Home from "./pages/Home";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route index element={<Home />} />
      <Route path="login" element={<Login />} />
      <Route path="register" element={<RegisterForm />} />

      {/* Registered users */}
      <Route element={<PrivateRoute />}>
        <Route path="profile" element={<Profile />} />
      </Route>
    </Route>
  )
);

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <RouterProvider router={router} />
  </Provider>
);
