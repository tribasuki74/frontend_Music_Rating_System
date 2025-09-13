import { useEffect, useState, type FormEvent } from "react";
import LayoutUser from "../../components/layout_user";
import { useParams } from "react-router-dom";
import LoadingSpinner from "../../components/loading";
import Swal from "sweetalert2";
import AXIOS_INSTANCE from "../../utils/axios_instance";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import { usePlayer } from "../../context/player";
import { STORAGE_S3 } from "../../utils/constant";

export default function RatingDetailPage() {
  const ratings = ["SU", "13+", "17+", "21+"];
  const { uuid } = useParams<{ uuid: string }>();
  const authUser = useAuthUser() as { uuid: string } | null;
  const user_uuid = authUser ? authUser.uuid : null;
  const { currentTrack, updateCurrentTrackRating } = usePlayer();
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [musicBackgroundColor, setMusicBackgroundColor] = useState<string>();
  const [musicCover, setMusicCover] = useState<string | null>(null);
  const [musicRating, setMusicRating] = useState<string | null>(null);
  const [musicTitle, setMusicTitle] = useState<string | null>(null);
  const [formMyRating, setFormMyRating] = useState<string | null>(null);
  const [formReason, setFormReason] = useState<string | null>(null);

  useEffect(() => {
    if (!uuid || !user_uuid) {
      setLoadingPage(false);
      return;
    }
    (async () => {
      try {
        const { data: resMusicData } = await AXIOS_INSTANCE.get(
          `/user_upload`,
          { params: { uuid } }
        );
        if (resMusicData.data.length !== 0) {
          const musicData = resMusicData.data[0];
          setMusicCover(musicData.thumbnail_filename);
          setMusicRating(musicData.ai_rating_result);
          setMusicTitle(musicData.title);
          setMusicBackgroundColor(musicData.background_color);
        }

        const { data: resMyRating } = await AXIOS_INSTANCE.get(`/user_rating`, {
          params: { user_upload_uuid: uuid, user_uuid },
        });
        if (resMyRating.data.length !== 0) {
          const myRating = resMyRating.data[0];
          setFormMyRating(myRating.rating);
          setFormReason(myRating.reason);
        }
      } catch (error) {
        console.log(error);
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: "Failed to fetch music data",
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
        setLoadingSubmit(false);
      }
    })();
  }, [user_uuid, uuid]);

  async function updateRating(e: FormEvent) {
    e.preventDefault();
    if (!formMyRating) {
      Swal.fire({
        icon: "warning",
        title: "Rating",
        text: "Select rating!",
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
    if (
      !user_uuid ||
      !uuid ||
      !formReason ||
      loadingPage ||
      loadingSubmit ||
      !currentTrack ||
      !currentTrack.uuid
    ) {
      return;
    }
    setLoadingSubmit(true);
    try {
      await AXIOS_INSTANCE.post(`/user_rating`, {
        user_uuid,
        user_upload_uuid: currentTrack?.uuid,
        rating: formMyRating,
        reason: formReason,
      });
      updateCurrentTrackRating(formMyRating);
      const resSwall = await Swal.fire({
        icon: "success",
        title: "Thank You 🙏",
        text: "Thank you for contributing to improve our service by sharing your rating suggestion.",
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
        text: "Failed to update music rating",
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
        <p>Suggest a New Rating</p>
      </div>

      <div className="w-full h-[calc(100vh-190px)] hide-scrollbar max-w-md p-4 m-auto overflow-auto bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-center gap-4 mt-4">
          <div className="w-24 h-24 bg-[#493D9E] rounded-md overflow-hidden shadow-md flex-shrink-0">
            {musicCover ? (
              <img
                className="object-cover object-center w-full h-full"
                src={`${STORAGE_S3}/user_uploads/thumbnails/${musicCover}`}
              />
            ) : (
              <div
                style={{
                  backgroundColor: musicBackgroundColor,
                }}
                className="w-full h-full"
              ></div>
            )}
          </div>

          <div className="flex flex-col gap-1 overflow-hidden">
            <p className="text-xl font-bold">Rating {musicRating}</p>
            <p className="break-words whitespace-normal">{musicTitle}</p>
          </div>
        </div>

        <form onSubmit={updateRating}>
          <div className="mt-8 mb-4">
            <p className="mb-2 font-medium text-gray-900">
              Your Suggested Rating
            </p>
            <ul className="grid w-full grid-cols-3 gap-2">
              {ratings
                .filter((item) => item !== musicRating)
                .map((item: string, index: number) => (
                  <li key={index}>
                    <input
                      id={item}
                      type="radio"
                      name="rating"
                      value={item}
                      checked={formMyRating === item}
                      onChange={() => setFormMyRating(item)}
                      className="hidden peer"
                    />
                    <label
                      htmlFor={item}
                      className="inline-flex items-center justify-center w-full px-2 py-1 text-sm text-center text-gray-900 bg-[#DBD2FE] font-semibold rounded-lg cursor-pointer peer-checked:bg-[#B2A5FF] hover:bg-[#B2A5FF]"
                    >
                      <p className="text-center">{item}</p>
                    </label>
                  </li>
                ))}
            </ul>
          </div>

          <p className="mb-1 font-medium text-gray-900">Your Reason</p>
          <textarea
            onChange={(e) => setFormReason(e.target.value)}
            value={formReason ?? ""}
            placeholder="Tell us why you believe your rating is more accurate."
            className="border-[#493D9E] rounded-lg w-full border-2 h-52 p-2 focus:outline-none resize-none"
            required
          ></textarea>

          <div className="flex items-center justify-center my-6">
            <button className="text-white bg-[#493D9E] rounded-lg px-4 py-2 font-medium">
              {loadingSubmit ? (
                <LoadingSpinner fullScreen={false} width="20" />
              ) : (
                "Submit Rating"
              )}
            </button>
          </div>
        </form>
      </div>
    </LayoutUser>
  );
}
