/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import LayoutUser from "../../components/layout_user";
import Swal from "sweetalert2";
import LoadingSpinner from "../../components/loading";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import AXIOS_INSTANCE from "../../utils/axios_instance";
import type { masterDataType } from "../../types/music";
import { useParams } from "react-router-dom";
import PlayMusicCard from "../../components/play_music_card";
import type { userType } from "../../types/user";

export default function TrendingMorePage() {
  const { view } = useParams<{ view: string }>();
  const authUser = useAuthUser() as { uuid: string } | null;
  const user_uuid = authUser ? authUser.uuid : null;
  const [isConfirmAuthenticated, setIsConfirmAuthenticated] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const [userData, setUserData] = useState<userType>();
  const [musicData, setMusicData] = useState<masterDataType[]>([]);
  const [titlePage, setTitlePage] = useState<string>("");

  useEffect(() => {
    if (!user_uuid || !view) {
      setLoadingPage(false);
      return;
    }
    if (view === "created_at") {
      setTitlePage("Recently Added");
    }
    if (view === "most_listen_everyday") {
      setTitlePage("Most Listen Everyday");
    }
    if (view === "trending_this_month") {
      setTitlePage("Trending This Month");
    }
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

        const { data: resMusicData } = await AXIOS_INSTANCE.get(
          `/user_upload`,
          {
            params: {
              limit: "100",
              offset: "0",
              is_null_title: "false",
              user_uuid_age_filter: user_uuid,
              user_rating_uuid: user_uuid,
              order_by: view,
            },
          }
        );
        setMusicData(resMusicData.data);
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
  }, [user_uuid, view]);

  return loadingPage ? (
    <LoadingSpinner />
  ) : (
    <LayoutUser userData={userData!}>
      <div className="w-full p-4 mt-2 bg-white rounded-lg shadow-md lg:mt-0">
        <div className="flex items-center justify-between mb-2 w-[95%]">
          <p className="text-lg font-bold">{titlePage}</p>
        </div>
        <div className="flex flex-wrap gap-4 pb-2">
          {musicData.map((item, index) => (
            <PlayMusicCard
              key={index}
              ai_rating_result={item.ai_rating_result}
              background_color={item.background_color}
              first_name={item.user.first_name}
              last_name={item.user.last_name}
              music_filename={item.music_filename}
              thumbnail_filename={item.thumbnail_filename}
              title={item.title}
              user_uuid={item.user.uuid}
              uuid={item.uuid}
            />
          ))}
        </div>
      </div>
    </LayoutUser>
  );
}
