/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link } from "react-router-dom";
import LayoutGuest from "../../components/layout_guest";
import {
  TO_DASHBOARD_MAIN,
  TO_OTP,
  TO_PROFILE_FORM,
  TO_REGISTER,
} from "../../utils/paths";
import { useState, type FormEvent } from "react";
import Swal from "sweetalert2";
import AXIOS_INSTANCE from "../../utils/axios_instance";
import LoadingSpinner from "../../components/loading";
import { jwtDecode } from "jwt-decode";
import {
  REFRESH_TOKEN_NAME,
  ROLE_ADMINISTRATOR,
  ROLE_SUPER_ADMINISTRATOR,
} from "../../utils/constant";
import useSignIn from "react-auth-kit/hooks/useSignIn";
import { useGoogleLogin } from "@react-oauth/google";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

export default function LoginPage() {
  const authSignIn = useSignIn();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [formIsAgreeTerms, setFormIsAgreeTerms] = useState<boolean>(false);
  const [formEmail, setFormEmail] = useState<string | null>(null);
  const [formPassword, setFormPassword] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loadingSubmit || !formPassword) {
      Swal.fire({
        icon: "warning",
        title: "Failed",
        text: "Make sure all fields are filled in!",
        allowOutsideClick: false,
        didOpen: () => {
          const container = document.querySelector(
            ".swal2-container"
          ) as HTMLElement;
          if (container)
            container.style.zIndex = "99999999999999999999999999999999";
        },
      });
    }
    setLoadingSubmit(true);
    try {
      const { data: resLogin } = await AXIOS_INSTANCE.post(
        `/token`,
        {
          username: formEmail,
          password: formPassword,
        },
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );
      const userRole = resLogin.role;
      if (
        userRole === ROLE_SUPER_ADMINISTRATOR ||
        userRole === ROLE_ADMINISTRATOR
      ) {
        const decoded = jwtDecode<{ uuid: string; exp: number }>(
          resLogin.access_token
        );
        const signInSuccess = authSignIn({
          auth: {
            token: resLogin.access_token,
            type: "Bearer",
          },
          refresh: resLogin.refresh_token,
          userState: {
            uuid: decoded.uuid,
            token: resLogin.access_token,
          },
        });
        if (signInSuccess) {
          localStorage.setItem(REFRESH_TOKEN_NAME, resLogin.refresh_token);
          window.location.href = TO_DASHBOARD_MAIN;
        }
      } else {
        window.location.href = `${TO_OTP}/${formEmail}`;
      }
    } catch (error) {
      console.log(error);
      Swal.fire({
        icon: "warning",
        title: "Incorrect",
        text: "Username or Password is incorrect",
        allowOutsideClick: false,
        didOpen: () => {
          const container = document.querySelector(
            ".swal2-container"
          ) as HTMLElement;
          if (container)
            container.style.zIndex = "99999999999999999999999999999999";
        },
      });
    } finally {
      setLoadingSubmit(false);
    }
  }

  const loginGoogle = useGoogleLogin({
    flow: "implicit",
    onSuccess: async (response: any) => {
      try {
        const { data: resLogin } = await AXIOS_INSTANCE.post(
          `/google/auth/callback`,
          {
            token: response.access_token,
          }
        );
        if (resLogin.detail === "Login success") {
          const decoded = jwtDecode<{ uuid: string; exp: number }>(
            resLogin.access_token
          );
          const signInSuccess = authSignIn({
            auth: {
              token: resLogin.access_token,
              type: "Bearer",
            },
            refresh: resLogin.refresh_token,
            userState: {
              uuid: decoded.uuid,
              token: resLogin.access_token,
            },
          });
          if (signInSuccess) {
            localStorage.setItem(REFRESH_TOKEN_NAME, resLogin.refresh_token);
            window.location.href = TO_DASHBOARD_MAIN;
          }
        } else {
          window.location.href = `${TO_PROFILE_FORM}/${resLogin.email}/${formIsAgreeTerms}/google`;
        }
      } catch (error) {
        console.log(error);
        Swal.fire({
          icon: "warning",
          title: "Failed",
          text: "Failed to login with google",
          allowOutsideClick: false,
          didOpen: () => {
            const container = document.querySelector(
              ".swal2-container"
            ) as HTMLElement;
            if (container)
              container.style.zIndex = "99999999999999999999999999999999";
          },
        });
      }
    },
  });

  return (
    <LayoutGuest>
      <div className="h-[90vh] flex justify-center items-center overflow-auto hide-scrollbar pb-6">
        <div className="w-full max-w-md p-4 m-auto mx-4 bg-white rounded-lg shadow-md">
          <p className="font-bold text-[#493D9E] text-2xl text-center mt-16 mb-2">
            Log In
          </p>
          <p className="mb-10 font-medium text-center">
            Enter your email and password to Log In.
          </p>

          <form onSubmit={onSubmit}>
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-900 cursor-pointer">
                Email
              </label>
              <input
                onChange={(e) => setFormEmail(e.target.value)}
                type="email"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="email@example.com"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-900 cursor-pointer">
                Password
              </label>
              <div className="relative">
                <input
                  onChange={(e) => setFormPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  placeholder="*********"
                  required
                />
                <div
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute text-gray-700 -translate-y-1/2 cursor-pointer top-1/2 right-5"
                >
                  {showPassword ? (
                    <FaEyeSlash size={22} />
                  ) : (
                    <FaEye size={22} />
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-between mb-4 lg:flex-row">
              <div className="flex items-center">
                <input
                  onChange={() => setFormIsAgreeTerms(!formIsAgreeTerms)}
                  checked={formIsAgreeTerms}
                  id="terms_conditions"
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 focus:ring-2"
                />
                <label
                  htmlFor="terms_conditions"
                  className="text-sm font-medium text-gray-500 cursor-pointer ms-2"
                >
                  I Agree the{" "}
                  <span className="text-black underline">
                    Terms and Conditions
                  </span>
                </label>
              </div>

              <p className="font-bold">Forgot Password</p>
            </div>

            <button className="text-white font-bold bg-[#493D9E] w-full focus:ring-4 focus:ring-blue-300 rounded-lg text-sm px-5 py-2.5 me-2 mb-2 focus:outline-none">
              {loadingSubmit ? (
                <LoadingSpinner fullScreen={false} width="20" />
              ) : (
                "LOG IN"
              )}
            </button>
          </form>

          <button
            onClick={() => loginGoogle()}
            className="text-white mt-4 justify-center w-full bg-[#4285F4] hover:bg-[#4285F4]/90 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#4285F4]/55 me-2 mb-2"
          >
            <svg
              className="w-4 h-4 me-2"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 18 19"
            >
              <path
                fill-rule="evenodd"
                d="M8.842 18.083a8.8 8.8 0 0 1-8.65-8.948 8.841 8.841 0 0 1 8.8-8.652h.153a8.464 8.464 0 0 1 5.7 2.257l-2.193 2.038A5.27 5.27 0 0 0 9.09 3.4a5.882 5.882 0 0 0-.2 11.76h.124a5.091 5.091 0 0 0 5.248-4.057L14.3 11H9V8h8.34c.066.543.095 1.09.088 1.636-.086 5.053-3.463 8.449-8.4 8.449l-.186-.002Z"
                clip-rule="evenodd"
              />
            </svg>
            Sign in with Google
          </button>

          <p className="mt-8 mb-6 font-semibold text-center text-gray-500">
            Already have Account?{" "}
            <Link to={TO_REGISTER} className="text-[#493D9E]">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </LayoutGuest>
  );
}
