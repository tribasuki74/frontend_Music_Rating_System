/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import LayoutUser from "../../components/layout_user";
import Swal from "sweetalert2";
import LoadingSpinner from "../../components/loading";
import AXIOS_INSTANCE from "../../utils/axios_instance";
import type { myPlaylistType } from "../../types/playlist";
import PlaylistCard from "../../components/playlist_card";
import type { userType } from "../../types/user";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";

export default function PublicPlaylistPage() {
  const authUser = useAuthUser() as { uuid: string } | null;
  const user_uuid = authUser ? authUser.uuid : null;
  const [isConfirmAuthenticated, setIsConfirmAuthenticated] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const [userData, setUserData] = useState<userType>();
  const [publicPlaylist, setPublicPlaylist] = useState<myPlaylistType[]>([]);

  useEffect(() => {
    (async () => {
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

        const { data: resPublicPlaylist } = await AXIOS_INSTANCE.get(
          `/user_playlist/get_public_playlist`,
          {
            params: {
              limit: "100",
              offset: "0",
            },
          }
        );
        setPublicPlaylist(resPublicPlaylist.data);
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
  }, []);

  return loadingPage ? (
    <LoadingSpinner />
  ) : (
    <LayoutUser userData={userData!}>
      <div className="w-full p-4 mt-2 bg-white rounded-lg shadow-md lg:mt-0">
        <div className="flex items-center justify-between mb-2 w-[95%]">
          <p className="text-lg font-bold">Playlist</p>
        </div>
        <div className="flex flex-wrap gap-4 pb-2">
          {publicPlaylist.map((item, index) => (
            <PlaylistCard
              key={index}
              background_color={item.background_color}
              first_name={item.user.first_name}
              last_name={item.user.last_name}
              user_uuid={item.user.uuid}
              playlist_name={item.playlist_name}
              uuid={item.uuid}
            />
          ))}
        </div>
      </div>
    </LayoutUser>
  );
}
