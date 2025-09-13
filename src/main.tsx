import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import AuthProvider from "react-auth-kit";
import { AUTH_STORE } from "./utils/auth_store";
import { ROUTER } from "./utils/router";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GOOGLE_CLIENT_ID } from "./utils/constant";
import { PlayerProvider } from "./context/player";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider store={AUTH_STORE}>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <PlayerProvider>
          <RouterProvider router={ROUTER} />
        </PlayerProvider>
      </GoogleOAuthProvider>
    </AuthProvider>
  </StrictMode>
);
