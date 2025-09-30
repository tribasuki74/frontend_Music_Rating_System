/* eslint-disable react-hooks/exhaustive-deps */
import { Link, useParams } from "react-router-dom";
import LayoutUser from "../../components/layout_user";
import { useEffect, useRef, useState, type FormEvent } from "react";
import LoadingSpinner from "../../components/loading";
import AXIOS_INSTANCE from "../../utils/axios_instance";
import Swal from "sweetalert2";
import { TO_MY_MUSIC, TO_PLAY_MUSIC } from "../../utils/paths";
import { STORAGE_S3 } from "../../utils/constant";
import type { userType } from "../../types/user";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";

export default function UploadDetailPage() {
  const visibility = ["public", "private", "unlist"];
  const { uuid } = useParams<{ uuid: string }>();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const authUser = useAuthUser() as { uuid: string } | null;
  const user_uuid = authUser ? authUser.uuid : null;
  const [isConfirmAuthenticated, setIsConfirmAuthenticated] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [userData, setUserData] = useState<userType>();
  const [genreData, setGenreData] = useState<{ name: string; uuid: string }[]>(
    []
  );
  const [musicBackgroundColor, setMusicBackgroundColor] = useState<string>();
  const [formGenres, setFormGenres] = useState<string[]>([]);
  const [formTitle, setFormTitle] = useState<string | null>(null);
  const [formVisibility, setFormVisibility] = useState<string | null>(null);
  const [formDescription, setFormDescription] = useState<string | null>(null);
  const [formFilename, setFormFilename] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailFilename, setThumbnailFilename] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (!uuid) return;
    (async () => {
      setLoadingPage(true);
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

        const { data: resGenre } = await AXIOS_INSTANCE.get(`/genre`, {
          params: {
            limit: "999999",
            offset: "0",
          },
        });
        setGenreData(resGenre.data);

        const { data: resUserUpl } = await AXIOS_INSTANCE.get(`/user_upload`, {
          params: {
            uuid,
          },
        });
        if (resUserUpl.data.length !== 0) {
          const userUploadData = resUserUpl.data[0];
          setMusicBackgroundColor(userUploadData.background_color);
          setFormFilename(userUploadData.original_filename);
          setThumbnailFilename(userUploadData.thumbnail_filename);
          setFormTitle(userUploadData.title);
          setFormDescription(userUploadData.description);
          setFormVisibility(userUploadData.visibility);
          setFormGenres(
            userUploadData.user_upload_genres.map(
              (genre: { genre_uuid: string }) => genre.genre_uuid
            )
          );
        }
      } catch (error) {
        console.log(error);
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: "Failed to fetch genre data",
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
  }, [uuid]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loadingSubmit) return;
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
    setLoadingSubmit(true);
    try {
      const formData = new FormData();
      formData.append("uuid", uuid?.toString() ?? "");
      formData.append("title", formTitle ?? "");
      formData.append("visibility", formVisibility ?? "");
      if (formDescription) {
        formData.append("description", formDescription ?? "");
      }
      formGenres.forEach((g) => {
        formData.append("genre_uuids", g);
      });
      if (thumbnailFile) {
        formData.append("thumbnail_img", thumbnailFile);
      }
      await AXIOS_INSTANCE.put(`/user_upload`, formData, {
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
      if (resSwall.isConfirmed) window.location.href = TO_MY_MUSIC;
    } catch (error) {
      console.log(error);
      Swal.fire({
        icon: "warning",
        title: "Failed",
        text: "Failed to update music, please try again!",
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
      <p className="m-2 text-base font-bold">Upload Your Own Music</p>
      <form className="p-6 bg-white rounded-lg shadow-md" onSubmit={onSubmit}>
        <p className="text-lg font-semibold">Details</p>
        <div className="lg:grid grid-cols-[2fr,1fr] gap-4 mt-4">
          <div className="border-[#493D9E] rounded-lg border-2 overflow-hidden lg:hidden mb-4">
            <div className="border-b-[#493D9E] border-b-2 h-52 relative">
              {thumbnailFilename ? (
                <img
                  src={
                    thumbnailFile
                      ? thumbnailFilename
                      : `${STORAGE_S3}/user_uploads/thumbnails/${thumbnailFilename}`
                  }
                  className="object-cover object-center w-full h-full"
                />
              ) : (
                <div
                  style={{
                    backgroundColor: musicBackgroundColor,
                  }}
                  className="w-full h-full"
                ></div>
              )}
              <div
                className="absolute cursor-pointer right-6 bottom-6 bg-[#DBD2FE] font-semibold py-1.5 px-4 rounded-md"
                onClick={() => fileInputRef.current?.click()}
              >
                Edit
              </div>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setThumbnailFile(e.target.files[0]);
                    setThumbnailFilename(
                      URL.createObjectURL(e.target.files[0])
                    );
                  }
                }}
              />
            </div>
            <div className="flex flex-col gap-6 p-4">
              <div>
                <p className="text-xs">Link Music</p>
                <Link
                  to={`${window.location.origin}${TO_PLAY_MUSIC}/${uuid}`}
                >{`${window.location.origin}${TO_PLAY_MUSIC}/${uuid}`}</Link>
              </div>
              <div>
                <p className="text-xs">Filename</p>
                <p>{formFilename ?? "-"}</p>
              </div>
              <div>
                <p className="text-xs">Visibility</p>
                <ul className="grid w-full grid-cols-3 gap-2">
                  {visibility.map((item: string, index: number) => (
                    <li key={index}>
                      <input
                        id={item}
                        type="radio"
                        name="visibility_mobile"
                        value={item}
                        checked={formVisibility === item}
                        onChange={() => setFormVisibility(item)}
                        className="hidden peer"
                      />
                      <label
                        htmlFor={item}
                        className="inline-flex items-center justify-center w-full px-2 py-1 text-sm text-center text-gray-900 bg-[#DBD2FE] font-semibold rounded-lg cursor-pointer peer-checked:bg-[#B2A5FF] hover:bg-[#B2A5FF]"
                      >
                        <p className="text-center capitalize">{item}</p>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <textarea
              onChange={(e) => setFormTitle(e.target.value)}
              value={formTitle ?? ""}
              placeholder="Title (required)"
              className="border-[#493D9E] rounded-lg w-full border-2 h-40 p-2 focus:outline-none resize-none"
              required
            ></textarea>
            <textarea
              onChange={(e) => setFormDescription(e.target.value)}
              value={formDescription ?? ""}
              placeholder="Description"
              className="border-[#493D9E] rounded-lg w-full border-2 h-72 p-2 focus:outline-none resize-none"
            ></textarea>
          </div>

          <div className="border-[#493D9E] rounded-lg border-2 overflow-hidden hidden lg:block">
            <div className="border-b-[#493D9E] border-b-2 h-52 relative">
              {thumbnailFilename ? (
                <img
                  src={
                    thumbnailFile
                      ? thumbnailFilename
                      : `${STORAGE_S3}/user_uploads/thumbnails/${thumbnailFilename}`
                  }
                  className="object-cover object-center w-full h-full"
                />
              ) : (
                <div
                  style={{
                    backgroundColor: musicBackgroundColor,
                  }}
                  className="w-full h-full"
                ></div>
              )}
              <div
                className="absolute cursor-pointer right-6 bottom-6 bg-[#DBD2FE] font-semibold py-1.5 px-4 rounded-md"
                onClick={() => fileInputRef.current?.click()}
              >
                Edit
              </div>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setThumbnailFile(e.target.files[0]);
                    setThumbnailFilename(
                      URL.createObjectURL(e.target.files[0])
                    );
                  }
                }}
              />
            </div>
            <div className="flex flex-col gap-6 p-4">
              <div>
                <p className="text-xs">Link Music</p>
                <Link
                  to={`${window.location.origin}${TO_PLAY_MUSIC}/${uuid}`}
                >{`${window.location.origin}${TO_PLAY_MUSIC}/${uuid}`}</Link>
              </div>
              <div>
                <p className="text-xs">Filename</p>
                <p>{formFilename ?? "-"}</p>
              </div>
              <div>
                <p className="text-xs">Visibility</p>
                <ul className="grid w-full grid-cols-3 gap-2">
                  {visibility.map((item: string, index: number) => (
                    <li key={index}>
                      <input
                        id={item}
                        type="radio"
                        name="visibility_desktop"
                        value={item}
                        checked={formVisibility === item}
                        onChange={() => setFormVisibility(item)}
                        className="hidden peer"
                      />
                      <label
                        htmlFor={item}
                        className="inline-flex items-center justify-center w-full px-2 py-1 text-sm text-center text-gray-900 bg-[#DBD2FE] font-semibold rounded-lg cursor-pointer peer-checked:bg-[#B2A5FF] hover:bg-[#B2A5FF]"
                      >
                        <p className="text-center capitalize">{item}</p>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 border-2 border-[#493D9E] rounded-lg mt-4">
          <p className="mb-2 font-medium">Genre Music</p>
          {loadingPage ? (
            <LoadingSpinner fullScreen={false} />
          ) : (
            <ul className="flex flex-wrap w-full gap-2">
              {genreData.map(
                (item: { uuid: string; name: string }, index: number) => (
                  <li key={index} className="w-36">
                    <input
                      type="checkbox"
                      id={item.uuid.toString()}
                      value={item.uuid}
                      className="hidden peer"
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
              )}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-center my-12">
          <button className="text-white bg-[#493D9E] rounded-lg px-4 py-2 font-medium">
            {loadingSubmit ? (
              <LoadingSpinner fullScreen={false} width="20" />
            ) : (
              "Save Music"
            )}
          </button>
        </div>
      </form>
    </LayoutUser>
  );
}
