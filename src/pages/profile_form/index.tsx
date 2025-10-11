import { useParams } from "react-router-dom";
import LayoutGuest from "../../components/layout_guest";
import { useEffect, useState, type FormEvent } from "react";
import AXIOS_INSTANCE from "../../utils/axios_instance";
import Swal from "sweetalert2";
import LoadingSpinner from "../../components/loading";
import { TO_DASHBOARD_MAIN, TO_OTP } from "../../utils/paths";
import { isStrongPassword } from "validator";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import { jwtDecode } from "jwt-decode";
import useSignIn from "react-auth-kit/hooks/useSignIn";
import { REFRESH_TOKEN_NAME } from "../../utils/constant";

export default function ProfileFormPage() {
  const { email, terms, type } = useParams<{
    email: string;
    terms: string;
    type: string;
  }>();
  const authSignIn = useSignIn();
  const [loadingGenre, setLoadingGenre] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [formUsername, setFormUsername] = useState<string | null>(null);
  const [formFirstName, setFormFirstName] = useState<string | null>(null);
  const [formLastName, setFormLastName] = useState<string | null>(null);
  const [formPassword, setFormPassword] = useState<string | null>(null);
  const [formConfirmPassword, setFormConfirmPassword] = useState<string | null>(
    null
  );
  const [formDateBirth, setFormDateBirth] = useState<string | null>(null);
  const [formGender, setFormGender] = useState<string | null>(null);
  const [formGenres, setFormGenres] = useState<string[]>([]);
  const [genreData, setGenreData] = useState<{ name: string; uuid: string }[]>(
    []
  );
  const [notStrongPassword, setNotStrongPassword] = useState(false);
  const [notSamePassword, setNotSamePassword] = useState(false);

  useEffect(() => {
    (async () => {
      setLoadingGenre(true);
      try {
        const { data } = await AXIOS_INSTANCE.get(`/genre`, {
          params: { limit: "999999", offset: "0" },
        });
        setGenreData(data.data);
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
      } finally {
        setLoadingGenre(false);
      }
    })();
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isStrongPassword(formPassword ?? "")) {
      setNotStrongPassword(true);
      return;
    }
    if (formPassword !== formConfirmPassword) {
      setNotSamePassword(true);
      setFormConfirmPassword("");
      return;
    }
    if (
      loadingSubmit ||
      !formUsername ||
      !formFirstName ||
      !formLastName ||
      !formPassword ||
      !formDateBirth ||
      !formGender ||
      formGenres.length === 0
    ) {
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
      return;
    }
    setLoadingSubmit(true);
    try {
      const { data: resCreateUser } = await AXIOS_INSTANCE.post(`/user`, {
        first_name: formFirstName,
        last_name: formLastName,
        date_birth: formDateBirth,
        username: formUsername,
        password: formPassword,
        confirm_password: formConfirmPassword,
        gender: formGender,
        email,
        role: "User",
        is_agree_terms: terms === "true" ? true : false,
        user_genres: formGenres,
      });
      const resSwall = await Swal.fire({
        icon: "success",
        title: "Success",
        text: "You have successfully registered, please verify your email!",
        allowOutsideClick: false,
        didOpen: () => {
          const container = document.querySelector(
            ".swal2-container"
          ) as HTMLElement;
          if (container)
            container.style.zIndex = "99999999999999999999999999999999";
        },
      });
      if (type === "username_password") {
        if (resSwall.isConfirmed) window.location.href = `${TO_OTP}/${email}`;
      } else if (type === "google") {
        const decoded = jwtDecode<{ uuid: string; exp: number }>(
          resCreateUser.access_token
        );
        const signInSuccess = authSignIn({
          auth: {
            token: resCreateUser.access_token,
            type: "Bearer",
          },
          refresh: resCreateUser.refresh_token,
          userState: {
            uuid: decoded.uuid,
            token: resCreateUser.access_token,
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
            localStorage.setItem(
              REFRESH_TOKEN_NAME,
              resCreateUser.refresh_token
            );
            window.location.href = TO_DASHBOARD_MAIN;
          }
        }
      }
    } catch (error) {
      console.log(error);
      Swal.fire({
        icon: "warning",
        title: "Username",
        text: "Username or Email has been used by another user, please use another username or email",
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

  return (
    <LayoutGuest>
      <div className="h-[90vh] flex justify-center items-center overflow-auto hide-scrollbar">
        <div className="w-full max-w-md p-4 m-auto mx-4 bg-white rounded-lg shadow-md">
          <p className="font-bold text-[#493D9E] text-2xl text-center mb-1">
            Safe, Smart, Personalized
          </p>
          <p className="mb-4 font-medium text-center">
            Complete your profile to receive accurate content ratings and
            tailored music recommendations.
          </p>

          <form onSubmit={onSubmit}>
            <div className="mb-3">
              <label className="block mb-1 text-sm font-medium text-gray-900 cursor-pointer">
                Username
              </label>
              <input
                onChange={(e) => setFormUsername(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="musicsweet123"
                required
              />
            </div>

            <div className="grid items-center grid-cols-2 gap-2">
              <div className="mb-3">
                <label className="block mb-1 text-sm font-medium text-gray-900 cursor-pointer">
                  First Name
                </label>
                <input
                  onChange={(e) => setFormFirstName(e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  placeholder="First Name"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="block mb-1 text-sm font-medium text-gray-900 cursor-pointer">
                  Last Name
                </label>
                <input
                  onChange={(e) => setFormLastName(e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  placeholder="Last Name"
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="block mb-1 text-sm font-medium text-gray-900 cursor-pointer">
                Password
              </label>
              <div className="relative w-full">
                <input
                  onChange={(e) => {
                    setFormPassword(e.target.value);
                    setNotStrongPassword(false);
                  }}
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
              {notStrongPassword && (
                <p className="text-sm text-red-500">
                  Password must be at least 8 characters, include uppercase,
                  lowercase, number, special symbol, and no spaces.
                </p>
              )}
            </div>

            <div className="mb-3">
              <label className="block mb-1 text-sm font-medium text-gray-900 cursor-pointer">
                Confirm Password
              </label>
              <div className="relative w-full">
                <input
                  onChange={(e) => setFormConfirmPassword(e.target.value)}
                  type={showConfirmPassword ? "text" : "password"}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  placeholder="*********"
                  required
                />
                <div
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute text-gray-700 -translate-y-1/2 cursor-pointer top-1/2 right-5"
                >
                  {showConfirmPassword ? (
                    <FaEyeSlash size={22} />
                  ) : (
                    <FaEye size={22} />
                  )}
                </div>
              </div>
              {notSamePassword && (
                <p className="text-sm text-red-500">
                  Password and confirm password do not match.
                </p>
              )}
            </div>

            <div className="mb-3">
              <label className="block mb-1 text-sm font-medium text-gray-900 cursor-pointer">
                Date of Birth
              </label>
              <input
                onChange={(e) => setFormDateBirth(e.target.value)}
                type="date"
                className="bg-gray-50 border cursor-pointer border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="Date of Birth"
                required
              />
            </div>

            <div className="flex flex-col w-full gap-1 mb-3">
              <label className="block mb-1 text-sm font-medium text-gray-900 cursor-pointer">
                Gender
              </label>
              <select
                className="w-full p-1 border border-gray-300 rounded-md"
                onChange={(e) => setFormGender(e.target.value)}
                value={formGender ?? ""}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div className="mb-4">
              <p className="mb-2 text-sm font-medium text-gray-900">
                Favorite Genres
              </p>
              {loadingGenre ? (
                <LoadingSpinner fullScreen={false} />
              ) : (
                <ul className="grid w-full grid-cols-3 gap-2">
                  {genreData.map(
                    (item: { uuid: string; name: string }, index: number) => (
                      <li key={index}>
                        <input
                          id={item.uuid.toString()}
                          type="checkbox"
                          value={item.uuid}
                          className="hidden peer"
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormGenres((prev: string[]) => [
                                ...prev,
                                item.uuid,
                              ]);
                            } else {
                              setFormGenres((prev: string[]) =>
                                prev.filter((uuid) => uuid !== item.uuid)
                              );
                            }
                          }}
                        />
                        <label
                          htmlFor={item.uuid.toString()}
                          className="inline-flex items-center justify-center w-full px-2 py-1 text-sm text-center text-gray-900 bg-[#DBD2FE] font-semibold rounded-lg cursor-pointer peer-checked:bg-[#B2A5FF] hover:bg-[#B2A5FF]"
                        >
                          <p className="text-center">{item.name}</p>
                        </label>
                      </li>
                    )
                  )}
                </ul>
              )}
            </div>

            <button className="text-white font-bold bg-[#493D9E] w-full focus:ring-4 focus:ring-blue-300 rounded-lg text-sm px-5 py-2.5 me-2 mb-2 focus:outline-none">
              {loadingSubmit ? (
                <LoadingSpinner fullScreen={false} width="20" />
              ) : (
                "Submit"
              )}
            </button>
          </form>
        </div>
      </div>
    </LayoutGuest>
  );
}
