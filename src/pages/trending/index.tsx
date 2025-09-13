import { useEffect, useState } from "react";
import LayoutUser from "../../components/layout_user";
import Swal from "sweetalert2";
import LoadingSpinner from "../../components/loading";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import AXIOS_INSTANCE from "../../utils/axios_instance";
import type { masterDataType } from "../../types/music";
import { TO_TRENDING_MORE } from "../../utils/paths";
import { Link } from "react-router-dom";
import PlayMusicCard from "../../components/play_music_card";

export default function TrendingPage() {
  const authUser = useAuthUser() as { uuid: string } | null;
  const user_uuid = authUser ? authUser.uuid : null;
  const [loadingPage, setLoadingPage] = useState(true);
  const [musicRecentlyAdded, setMusicRecentlyAdded] = useState<
    masterDataType[]
  >([]);
  const [musicTrendingThisMonth, setMusicTrendingThisMonth] = useState<
    masterDataType[]
  >([]);
  const [musicMostListenEveryday, setMusicMostListenEveryday] = useState<
    masterDataType[]
  >([]);

  useEffect(() => {
    if (!user_uuid) {
      setLoadingPage(false);
      return;
    }
    (async () => {
      try {
        const { data: resRecentlyAdded } = await AXIOS_INSTANCE.get(
          `/user_upload`,
          {
            params: {
              limit: "20",
              offset: "0",
              is_null_title: "false",
              user_uuid_age_filter: user_uuid,
              user_rating_uuid: user_uuid,
              order_by: "created_at",
            },
          }
        );
        setMusicRecentlyAdded(resRecentlyAdded.data);

        const { data: resTrendingThisMonth } = await AXIOS_INSTANCE.get(
          `/user_upload`,
          {
            params: {
              limit: "20",
              offset: "0",
              is_null_title: "false",
              user_uuid_age_filter: user_uuid,
              user_rating_uuid: user_uuid,
              order_by: "trending_this_month",
            },
          }
        );
        setMusicTrendingThisMonth(resTrendingThisMonth.data);

        const { data: resMostListenEveryday } = await AXIOS_INSTANCE.get(
          `/user_upload`,
          {
            params: {
              limit: "20",
              offset: "0",
              is_null_title: "false",
              user_uuid_age_filter: user_uuid,
              user_rating_uuid: user_uuid,
              order_by: "most_listen_everyday",
            },
          }
        );
        setMusicMostListenEveryday(resMostListenEveryday.data);
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
  }, [user_uuid]);

  return loadingPage ? (
    <LoadingSpinner />
  ) : (
    <LayoutUser>
      <div className="w-full p-4 mt-2 bg-white rounded-lg shadow-md lg:mt-0">
        <div className="flex items-center justify-between mb-2 w-[95%]">
          <p className="text-lg font-bold">Trending This Month</p>
          <Link
            to={`${TO_TRENDING_MORE}/trending_this_month`}
            className="font-semibold text-[#493D9E]"
          >
            View More
          </Link>
        </div>
        <div className="flex gap-4 pb-2 overflow-x-auto hide-scrollbar">
          {musicTrendingThisMonth.map((item, index) => (
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

        <div className="flex mt-4 items-center justify-between mb-2 w-[95%]">
          <p className="text-lg font-bold">Most Listen Everyday</p>
          <Link
            to={`${TO_TRENDING_MORE}/most_listen_everyday`}
            className="font-semibold text-[#493D9E]"
          >
            View More
          </Link>
        </div>
        <div className="flex gap-4 pb-2 overflow-x-auto hide-scrollbar">
          {musicMostListenEveryday.map((item, index) => (
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

        <div className="flex mt-4 items-center justify-between mb-2 w-[95%]">
          <p className="text-lg font-bold">Recently Added</p>
          <Link
            to={`${TO_TRENDING_MORE}/created_at`}
            className="font-semibold text-[#493D9E]"
          >
            View More
          </Link>
        </div>
        <div className="flex gap-4 pb-2 overflow-x-auto hide-scrollbar">
          {musicRecentlyAdded.map((item, index) => (
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
