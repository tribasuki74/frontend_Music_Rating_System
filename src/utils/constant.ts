import { jwtDecode } from "jwt-decode";

// export const BACKEND_FASTAPI = "http://localhost:8000/api";
export const BACKEND_FASTAPI = "https://api-music.amanahnurehsan.org/api";

// export const STORAGE_S3 = "https://s3.amanahnurehsan.org/music/uploads";
export const STORAGE_S3 = "http://localhost:9000/music/uploads";

export const GOOGLE_CLIENT_ID =
  "552402935047-3h6dfnii56q937osahunarcb8bidfkth.apps.googleusercontent.com";
export const DOC_TITLE = "Music";
export const ACCESS_TOKEN_NAME = `${DOC_TITLE}_access_token`;
export const REFRESH_TOKEN_NAME = `${DOC_TITLE}_refresh_token`;
export const ACCESS_TOKEN = localStorage.getItem(ACCESS_TOKEN_NAME);
export const REFRESH_TOKEN = localStorage.getItem(REFRESH_TOKEN_NAME);
export const AUTHORIZATION = `Bearer ${ACCESS_TOKEN}`;
export const DECODE_TOKEN: { exp: number; id: string } | undefined =
  ACCESS_TOKEN ? jwtDecode(ACCESS_TOKEN) : undefined;
export const ACCESS_TOKEN_LIFETIME_SEC = 7 * 3600;
export const REFRESH_TOKEN_LIFETIME_SEC = 6 * 24 * 3600;

export const ROLE_SUPER_ADMINISTRATOR = "Super Administrator";
export const ROLE_ADMINISTRATOR = "Administrator";
export const ROLE_USER = "User";
