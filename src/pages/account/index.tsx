/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import LayoutUser from "../../components/layout_user";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import AXIOS_INSTANCE from "../../utils/axios_instance";
import Swal from "sweetalert2";
import type { masterDataType } from "../../types/music";
import { TO_LOGIN } from "../../utils/paths";
import LoadingSpinner from "../../components/loading";
import { FaCamera } from "react-icons/fa6";
import { STORAGE_S3 } from "../../utils/constant";
import useSignOut from "react-auth-kit/hooks/useSignOut";
import type { userType } from "../../types/user";
import type { genreType } from "../../types/genre";
import PlayMusicCard from "../../components/play_music_card";

export default function AccountPage() {
  const authUser = useAuthUser() as { uuid: string } | null;
  const user_uuid = authUser ? authUser.uuid : null;
  const signOut = useSignOut();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isConfirmAuthenticated, setIsConfirmAuthenticated] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [userData, setUserData] = useState<userType>();
  const [musicHistory, setMusicHistory] = useState<
    { user_upload: masterDataType; user: userType }[]
  >([]);
  const [genreData, setGenreData] = useState<genreType[]>([]);
  const [originalUserData, setOriginalUserData] = useState<any>(null);
  const [refreshUserAccount, setRefreshUserAccount] = useState(false);
  const [usernameExist, setUsernameExist] = useState(false);
  const [formGenres, setFormGenres] = useState<string[]>([]);
  const [firstNameOld, setFirstNameOld] = useState<string | null>(null);
  const [lastNameOld, setLastNameOld] = useState<string | null>(null);
  const [emailOld, setEmailOld] = useState<string | null>(null);
  const [formFirstName, setFormFirstName] = useState<string | null>(null);
  const [formLastName, setFormLastName] = useState<string | null>(null);
  const [formUsername, setFormUsername] = useState<string | null>(null);
  const [formEmail, setFormEmail] = useState<string | null>(null);
  const [formDateOfBirth, setFormDateOfBirth] = useState<string | null>(null);
  const [formGender, setFormGender] = useState<string | null>(null);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [ppFile, setPpFile] = useState<File | null>(null);
  const [ppFilename, setPpFilename] = useState<string | null>(null);
  const [userBackgroundColor, setUserBackgroundColor] = useState<string>();

  useEffect(() => {
    (async () => {
      if (!user_uuid) {
        setLoadingPage(false);
        return;
      }
      try {
        if (!isConfirmAuthenticated) {
          const { data: resUser } = await AXIOS_INSTANCE.get(`/user/uuid`, {
            params: {
              uuid: user_uuid,
            },
          });
          setUserData(resUser);
          setIsConfirmAuthenticated(true);
        }

        const { data: resHistory } = await AXIOS_INSTANCE.get(`/user_history`, {
          params: {
            user_uuid: user_uuid,
          },
        });
        setMusicHistory(resHistory.data);

        const { data: resGenre } = await AXIOS_INSTANCE.get(`/genre`, {
          params: {
            limit: "999999",
            offset: "0",
          },
        });
        setGenreData(resGenre.data);

        const { data: resUser } = await AXIOS_INSTANCE.get(`/user`, {
          params: {
            uuid: user_uuid,
          },
        });
        const userData = resUser.data[0];
        setFirstNameOld(userData.first_name);
        setLastNameOld(userData.last_name);
        setFormFirstName(userData.first_name);
        setFormLastName(userData.last_name);
        setFormUsername(userData.username);
        setEmailOld(userData.email);
        setFormEmail(userData.email);
        setFormDateOfBirth(userData.date_birth);
        setIsActive(userData.is_active);
        setPpFilename(userData.profile_picture);
        setUserBackgroundColor(userData.background_color);
        setFormGenres(
          userData.user_genres.map(
            (genre: { genre_uuid: string }) => genre.genre_uuid
          )
        );
        setOriginalUserData({
          first_name: userData.first_name,
          last_name: userData.last_name,
          username: userData.username,
          email: userData.email,
          date_birth: userData.date_birth,
          is_active: userData.is_active,
          profile_picture: userData.profile_picture,
          user_genres: userData.user_genres.map(
            (genre: { genre_uuid: string }) => genre.genre_uuid
          ),
        });
      } catch (error) {
        console.log(error);
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: "Failed to fetch history data",
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
        setLoadingPage(false);
      }
    })();
  }, [user_uuid, refreshUserAccount]);

  async function onSubmit() {
    if (loadingSubmit || !isEdit || !user_uuid) return;
    if (!formGenres || formGenres.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Failed",
        text: "Genre must be selected!",
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
    if (!formUsername) {
      Swal.fire({
        icon: "warning",
        title: "Failed",
        text: "The username column is mandatory!",
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
      const { data: resCheckUsername } = await AXIOS_INSTANCE.get(`/user`, {
        params: {
          username: formUsername,
        },
      });
      if (
        resCheckUsername.data.length !== 0 &&
        resCheckUsername.data[0].username !== originalUserData.username
      ) {
        setUsernameExist(true);
        return;
      }

      const formData = new FormData();
      formData.append("uuid", user_uuid);
      formData.append("username", formUsername);
      formData.append("first_name", formFirstName ?? "");
      formData.append("last_name", formLastName ?? "");
      formData.append("email", formEmail ?? "");
      formData.append("date_birth", formDateOfBirth ?? "");
      formData.append("is_active", isActive.toString());
      formGenres.forEach((g) => {
        formData.append("user_genres", g);
      });
      if (ppFile) {
        formData.append("profile_picture", ppFile);
      }

      await AXIOS_INSTANCE.put(`/user`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

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
        setPpFile(null);
        setRefreshUserAccount(!refreshUserAccount);
        setUsernameExist(false);
        setIsEdit(false);
      }
    } catch (error) {
      console.log(error);
      Swal.fire({
        icon: "warning",
        title: "Failed",
        text: "Failed to update user data, please try again!",
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

  return loadingPage ? (
    <LoadingSpinner />
  ) : (
    <LayoutUser userData={userData!}>
      <p className="mt-2 mb-2 font-bold lg:mt-0">Listen Again</p>
      <div className="flex gap-4 pb-2 overflow-x-auto hide-scrollbar">
        {musicHistory.map((item, index) => (
          <PlayMusicCard
            key={index}
            ai_rating_result={item.user_upload.ai_rating_result}
            background_color={item.user_upload.background_color}
            first_name={item.user.first_name}
            last_name={item.user.last_name}
            music_filename={item.user_upload.music_filename}
            thumbnail_filename={item.user_upload.thumbnail_filename}
            title={item.user_upload.title}
            user_uuid={item.user.uuid}
            uuid={item.user_upload.uuid}
          />
        ))}
      </div>

      <p className="mb-2 font-bold">Your Profile</p>
      <div className="px-8 py-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-end gap-2 mb-2 lg:hidden">
          {isEdit ? (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => {
                  if (originalUserData) {
                    setFormFirstName(originalUserData.first_name);
                    setFormLastName(originalUserData.last_name);
                    setFormUsername(originalUserData.username);
                    setFormEmail(originalUserData.email);
                    setFormDateOfBirth(originalUserData.date_birth);
                    setIsActive(originalUserData.is_active);
                    setFormGenres(originalUserData.user_genres);
                    setPpFilename(originalUserData.profile_picture);
                    setPpFile(null);
                  }
                  setIsEdit(false);
                }}
                className="px-4 py-2 font-medium text-white bg-orange-500 rounded-lg"
              >
                {loadingSubmit ? (
                  <LoadingSpinner fullScreen={false} width="20" />
                ) : (
                  "Cancel"
                )}
              </button>

              <button
                onClick={onSubmit}
                className="px-4 py-2 font-medium text-white bg-green-500 rounded-lg"
              >
                {loadingSubmit ? (
                  <LoadingSpinner fullScreen={false} width="20" />
                ) : (
                  "Save"
                )}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEdit(true)}
              className="text-white bg-[#493D9E] rounded-lg px-4 py-2 font-medium"
            >
              {loadingSubmit ? (
                <LoadingSpinner fullScreen={false} width="20" />
              ) : (
                "Edit"
              )}
            </button>
          )}

          <button
            onClick={() => {
              signOut();
              window.location.href = TO_LOGIN;
            }}
            className="px-4 py-2 font-medium text-white bg-red-500 rounded-lg"
          >
            Logout
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-12 relative h-12 bg-[#493D9E] rounded-full overflow-hidden flex items-center justify-center">
              {ppFilename ? (
                <img
                  src={
                    ppFile
                      ? ppFilename
                      : `${STORAGE_S3}/user/profile_pictures/${ppFilename}`
                  }
                  className="object-cover object-center w-full h-full"
                />
              ) : (
                <div
                  style={{
                    backgroundColor: userBackgroundColor,
                  }}
                  className="w-full h-full"
                ></div>
              )}

              {isEdit && (
                <>
                  <div
                    className="absolute top-0 bottom-0 left-0 right-0 flex items-center justify-center text-white cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <FaCamera size={18} />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setPpFile(e.target.files[0]);
                        setPpFilename(URL.createObjectURL(e.target.files[0]));
                      }
                    }}
                  />
                </>
              )}
            </div>

            <div>
              <p className="mb-1 font-bold">
                {firstNameOld} {lastNameOld}
              </p>
              <p>{emailOld}</p>
            </div>
          </div>

          <div className="items-center justify-center hidden gap-2 lg:flex">
            {isEdit ? (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => {
                    if (originalUserData) {
                      setFormFirstName(originalUserData.first_name);
                      setFormLastName(originalUserData.last_name);
                      setFormUsername(originalUserData.username);
                      setFormEmail(originalUserData.email);
                      setFormDateOfBirth(originalUserData.date_birth);
                      setIsActive(originalUserData.is_active);
                      setFormGenres(originalUserData.user_genres);
                      setPpFilename(originalUserData.profile_picture);
                      setPpFile(null);
                    }
                    setIsEdit(false);
                  }}
                  className="px-4 py-2 font-medium text-white bg-orange-500 rounded-lg"
                >
                  {loadingSubmit ? (
                    <LoadingSpinner fullScreen={false} width="20" />
                  ) : (
                    "Cancel"
                  )}
                </button>

                <button
                  onClick={onSubmit}
                  className="px-4 py-2 font-medium text-white bg-green-500 rounded-lg"
                >
                  {loadingSubmit ? (
                    <LoadingSpinner fullScreen={false} width="20" />
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEdit(true)}
                className="text-white bg-[#493D9E] rounded-lg px-4 py-2 font-medium"
              >
                {loadingSubmit ? (
                  <LoadingSpinner fullScreen={false} width="20" />
                ) : (
                  "Edit"
                )}
              </button>
            )}

            <button
              onClick={() => {
                signOut();
                window.location.href = TO_LOGIN;
              }}
              className="px-4 py-2 font-medium text-white bg-red-500 rounded-lg"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4 mt-6 lg:gap-10 lg:flex-row">
          <div className="flex flex-col w-full gap-4 lg:gap-10 lg:flex-row">
            <div className="flex flex-col w-full gap-1">
              <label className="font-medium">First Name</label>
              <input
                className="p-1 border border-gray-300 rounded-md"
                onChange={(e) => setFormFirstName(e.target.value)}
                value={formFirstName ?? ""}
                disabled={!isEdit}
              />
            </div>
            <div className="flex flex-col w-full gap-1">
              <label className="font-medium">Last Name</label>
              <input
                className="p-1 border border-gray-300 rounded-md"
                onChange={(e) => setFormLastName(e.target.value)}
                value={formLastName ?? ""}
                disabled={!isEdit}
              />
            </div>
          </div>
          <div className="flex flex-col w-full gap-1">
            <label className="font-medium">Email</label>
            <input
              className="p-1 border border-gray-300 rounded-md"
              onChange={(e) => setFormEmail(e.target.value)}
              value={formEmail ?? ""}
              disabled={!isEdit}
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 mt-4 lg:mt-6 lg:flex-row lg:gap-10">
          <div className="flex flex-col w-full gap-1">
            <label className="font-medium">Username</label>
            <div className="w-full">
              <input
                className="w-full p-1 border border-gray-300 rounded-md"
                onChange={(e) => {
                  setUsernameExist(false);
                  setFormUsername(e.target.value);
                }}
                value={formUsername ?? ""}
                disabled={!isEdit}
              />
              {usernameExist && (
                <p className="text-red-500">Username already exist</p>
              )}
            </div>
          </div>
          <div className="flex flex-col w-full gap-1">
            <label className="font-medium">Date of Birth</label>
            <input
              className="p-1 border border-gray-300 rounded-md"
              onChange={(e) => setFormDateOfBirth(e.target.value)}
              type="date"
              value={formDateOfBirth ?? ""}
              disabled={!isEdit}
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 mt-4 lg:mt-6 lg:flex-row lg:gap-10">
          <div className="flex flex-col w-full gap-1">
            <label className="font-medium">Gender</label>
            <select
              className="w-full p-1 border border-gray-300 rounded-md"
              onChange={(e) => setFormGender(e.target.value)}
              value={formGender ?? ""}
              disabled={!isEdit}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>

        <p className="mt-6 font-medium">Favorite Genre</p>
        <div className="p-3 border border-gray-300 rounded-lg">
          <ul className="flex flex-wrap w-full gap-2">
            {isEdit
              ? genreData.map(
                  (item: { uuid: string; name: string }, index: number) => (
                    <li key={index} className="w-36">
                      <input
                        type="checkbox"
                        id={item.uuid.toString()}
                        value={item.uuid}
                        className="hidden peer"
                        disabled={!isEdit}
                        checked={formGenres.includes(item.uuid)}
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
                        className="inline-flex items-center justify-center w-full px-2 py-1 text-sm text-center text-gray-900 bg-[#DBD2FE] font-semibold rounded-lg cursor-pointer peer-checked:bg-[#B2A5FF] hover:bg-[#B2A5FF] peer-checked:border-[#493D9E] hover:border-[#493D9E] peer-checked:border-2 hover:border-2"
                      >
                        <p className="text-center">{item.name}</p>
                      </label>
                    </li>
                  )
                )
              : genreData.map(
                  (item: { uuid: string; name: string }, index: number) => (
                    <li key={index} className="w-36">
                      <input
                        type="checkbox"
                        id={item.uuid.toString()}
                        value={item.uuid}
                        className="hidden peer"
                        disabled={!isEdit}
                        checked={formGenres.includes(item.uuid)}
                      />
                      <label
                        htmlFor={item.uuid.toString()}
                        className="inline-flex items-center justify-center w-full px-2 py-1 text-sm text-center text-gray-900 bg-[#DBD2FE] font-semibold rounded-lg peer-checked:bg-[#B2A5FF] peer-checked:border-[#493D9E] peer-checked:border-2"
                      >
                        <p className="text-center">{item.name}</p>
                      </label>
                    </li>
                  )
                )}
          </ul>
        </div>
      </div>
    </LayoutUser>
  );
}
