import createStore from "react-auth-kit/createStore";
import {
  ACCESS_TOKEN_LIFETIME_SEC,
  ACCESS_TOKEN_NAME,
  REFRESH_TOKEN_LIFETIME_SEC,
} from "./constant";
import createRefresh from "react-auth-kit/createRefresh";
import AXIOS_INSTANCE from "./axios_instance";

function computeIntervalMinutes(authExpireSec: number): number {
  const safetySec = authExpireSec <= 15 * 60 ? 30 : 5 * 60;
  return Math.max(1, Math.floor((authExpireSec - safetySec) / 60));
}

const refresh = createRefresh({
  interval: computeIntervalMinutes(ACCESS_TOKEN_LIFETIME_SEC),
  refreshApiCallback: async ({ authToken, refreshToken }) => {
    console.log(authToken);
    try {
      const { data } = await AXIOS_INSTANCE.post("/refresh_token", {
        refresh_token: refreshToken,
      });
      return {
        isSuccess: true,
        newAuthToken: data.access_token,
        newRefreshToken: data.refresh_token,
        newAuthTokenExpireIn: ACCESS_TOKEN_LIFETIME_SEC,
        newRefreshTokenExpiresIn: REFRESH_TOKEN_LIFETIME_SEC,
      };
    } catch (error) {
      console.error(error);
      return {
        isSuccess: false,
        newAuthToken: "",
        newRefreshToken: "",
        newAuthTokenExpireIn: 0,
        newRefreshTokenExpiresIn: 0,
      };
    }
  },
});

export const AUTH_STORE = createStore({
  authName: ACCESS_TOKEN_NAME,
  authType: "localstorage",
  cookieDomain: window.location.hostname,
  cookieSecure: window.location.protocol === "https:",
  refresh: refresh,
});
