import { useEffect, useState } from "react";
import LayoutUser from "../../components/layout_user";
import LoadingSpinner from "../../components/loading";
import Swal from "sweetalert2";
import AXIOS_INSTANCE from "../../utils/axios_instance";
import { useParams } from "react-router-dom";

export default function MyPlaylistFormPage() {
  const { uuid } = useParams<{ uuid?: string }>();
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [formPlaylistName, setFormPlaylistName] = useState<string | null>(null);
  const [formVisibility, setFormVisibility] = useState<string | null>(null);

  useEffect(() => {
    if (!uuid) {
      setLoadingPage(false);
      return;
    }
    (async () => {
      try {
        const { data: resMyPlaylist } = await AXIOS_INSTANCE.get(
          `/user_playlist/get_by_uuid`,
          { params: { uuid } }
        );
        setFormPlaylistName(resMyPlaylist.playlist_name);
        setFormVisibility(resMyPlaylist.visibility);
      } catch (error) {
        console.log(error);
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: "Failed to fetch data",
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

  async function handleSavePlaylist() {
    if (!formVisibility) {
      Swal.fire({
        icon: "warning",
        title: "Visibility",
        text: "Select visibility!",
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

    if (!formPlaylistName || loadingSubmit) {
      return;
    }

    setLoadingSubmit(true);
    try {
      if (uuid) {
        await AXIOS_INSTANCE.put(
          `/user_playlist`,
          {
            playlist_name: formPlaylistName,
            visibility: formVisibility,
          },
          { params: { uuid } }
        );
      } else {
        await AXIOS_INSTANCE.post(`/user_playlist`, {
          playlist_name: formPlaylistName,
          visibility: formVisibility,
        });
      }
      const resSwall = await Swal.fire({
        icon: "success",
        title: "Success",
        text: "Success save playlist.",
        allowOutsideClick: false,
        didOpen: () => {
          const container = document.querySelector(
            ".swal2-container"
          ) as HTMLElement;
          if (container)
            container.style.zIndex = "99999999999999999999999999999999";
        },
      });
      if (resSwall.isConfirmed) window.history.back();
    } catch (error) {
      console.log(error);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Failed connect to the server",
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
    <LayoutUser isSidebar={false}>
      <div className="w-screen my-2 text-lg font-bold text-center">
        <p>Create a New Playlist</p>
      </div>

      <div className="w-full h-[calc(100vh-190px)] hide-scrollbar max-w-md p-4 m-auto overflow-auto bg-white rounded-lg shadow-md">
        <div className="flex flex-col justify-between h-full">
          <div>
            <p className="mt-2 mb-1 font-medium text-gray-900">Playlist Name</p>
            <textarea
              onChange={(e) => setFormPlaylistName(e.target.value)}
              value={formPlaylistName ?? ""}
              placeholder="Playlist Sweet 123."
              className="border-[#493D9E] rounded-lg w-full border-2 h-32 p-2 focus:outline-none resize-none"
              required
            ></textarea>

            <div className="mt-2 mb-4">
              <p className="mb-1 font-medium text-gray-900">Visibility</p>
              <ul className="grid w-full grid-cols-3 gap-2">
                {["public", "private", "unlist"].map(
                  (item: string, index: number) => (
                    <li key={index}>
                      <input
                        id={item}
                        type="radio"
                        name="rating"
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
                  )
                )}
              </ul>
            </div>
          </div>

          <div className="flex items-center justify-center my-6">
            <button
              className="text-white w-full bg-[#493D9E] rounded-lg px-4 py-2 font-medium"
              onClick={handleSavePlaylist}
            >
              {loadingSubmit ? (
                <LoadingSpinner fullScreen={false} width="20" />
              ) : (
                "Save"
              )}
            </button>
          </div>
        </div>
      </div>
    </LayoutUser>
  );
}
