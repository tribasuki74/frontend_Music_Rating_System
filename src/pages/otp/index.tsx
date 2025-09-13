/* eslint-disable react-hooks/exhaustive-deps */
import { useParams } from "react-router-dom";
import LayoutGuest from "../../components/layout_guest";
import { useEffect, useState } from "react";
import AXIOS_INSTANCE from "../../utils/axios_instance";
import Swal from "sweetalert2";
import { jwtDecode } from "jwt-decode";
import useSignIn from "react-auth-kit/hooks/useSignIn";
import { REFRESH_TOKEN_NAME } from "../../utils/constant";
import { TO_DASHBOARD_MAIN } from "../../utils/paths";
import OTPInput from "react-otp-input";

export default function OtpPage() {
  const { email } = useParams<{ email: string }>();
  const authSignIn = useSignIn();
  const [countdown, setCountdown] = useState<number>(30);
  const [otp, setOtp] = useState("");

  useEffect(() => {
    (async () => {
      try {
        await AXIOS_INSTANCE.post(`/create_otp`, { user_email: email });
      } catch (error) {
        console.log(error);
        Swal.fire({
          icon: "error",
          title: "Server Error",
          text: "Internal Server Error",
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
    })();
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  async function handleSubmitOtp() {
    if (otp.length !== 6) return;
    try {
      const { data } = await AXIOS_INSTANCE.post(`/verify_otp`, {
        user_email: email,
        otp_code: otp,
      });
      const decoded = jwtDecode<{ uuid: string; exp: number }>(
        data.access_token
      );
      const signInSuccess = authSignIn({
        auth: {
          token: data.access_token,
          type: "Bearer",
        },
        refresh: data.refresh_token,
        userState: {
          uuid: decoded.uuid,
          token: data.access_token,
        },
      });
      if (signInSuccess) {
        const resSwall = await Swal.fire({
          icon: "success",
          title: "Success",
          text: "You have successfully!",
          allowOutsideClick: false,
          didOpen: () => {
            const container = document.querySelector(
              ".swal2-container"
            ) as HTMLElement;
            if (container)
              container.style.zIndex = "99999999999999999999999999999999";
          },
        });
        if (resSwall.isConfirmed) {
          localStorage.setItem(REFRESH_TOKEN_NAME, data.refresh_token);
          window.location.href = TO_DASHBOARD_MAIN;
        }
      }
    } catch (error) {
      console.log(error);
      const resSwal = await Swal.fire({
        icon: "warning",
        title: "Failed",
        text: "OTP Code is Invalid or Expired",
        allowOutsideClick: false,
        didOpen: () => {
          const container = document.querySelector(
            ".swal2-container"
          ) as HTMLElement;
          if (container)
            container.style.zIndex = "99999999999999999999999999999999";
        },
      });
      if (resSwal.isConfirmed) {
        setOtp("");
      }
    }
  }

  return (
    <LayoutGuest>
      <div className="h-[83vh] flex justify-center items-center">
        <div className="w-full max-w-md p-4 m-auto mx-4 bg-white rounded-lg shadow-md">
          <p className="font-bold text-[#493D9E] text-2xl text-center mt-16 mb-2">
            Just one more step!
          </p>
          <p className="mb-10 font-medium text-center">
            Enter the OTP we've sent to your email
          </p>

          <div className="flex items-center justify-center w-full mb-6">
            <OTPInput
              value={otp}
              onChange={(val) => {
                if (/^\d*$/.test(val)) {
                  setOtp(val);
                }
              }}
              numInputs={6}
              renderInput={(props) => (
                <input
                  {...props}
                  type="text"
                  inputMode="numeric"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && otp.length === 6) {
                      handleSubmitOtp();
                    }
                  }}
                  className="lg:!w-12 !w-11 mx-1 h-12 text-center border border-gray-400 rounded-md shadow-sm focus:outline-none focus:ring-0 focus:border-gray-400 active:border-gray-400"
                />
              )}
            />
          </div>

          <p className="mt-8 font-semibold text-center text-gray-500">
            Didn't receive the code?
          </p>
          <p className="mb-8 font-semibold text-center">
            {countdown > 0 ? (
              <span className="text-gray-400">[Resend] in {countdown}s</span>
            ) : (
              <button
                onClick={() => window.location.reload()}
                className="text-[#493D9E] hover:underline"
              >
                Resend Code
              </button>
            )}
          </p>
        </div>
      </div>
    </LayoutGuest>
  );
}
