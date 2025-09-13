/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useParams } from "react-router-dom";
import LayoutUser from "../../components/layout_user";
import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
} from "react";
import LoadingSpinner from "../../components/loading";
import AXIOS_INSTANCE from "../../utils/axios_instance";
import Swal from "sweetalert2";
import { usePlayer } from "../../context/player";
import { STORAGE_S3 } from "../../utils/constant";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import { FaRegStar, FaStar } from "react-icons/fa6";
import {
  AiFillDislike,
  AiFillLike,
  AiOutlineDislike,
  AiOutlineLike,
} from "react-icons/ai";
import { IoArrowDownCircleOutline } from "react-icons/io5";

export default function PlayMusicPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const authUser = useAuthUser() as { uuid: string } | null;
  const user_uuid = authUser ? authUser.uuid : null;
  const { currentTrack, playTrack } = usePlayer();
  const [loadingPage, setLoadingPage] = useState(true);
  const [ageLabelRating, setAgeLabelRating] = useState<string | null>(null);
  const [musicBackgroundColor, setMusicBackgroundColor] = useState<string>();
  const [thumbnailFilename, setThumbnailFilename] = useState<string | null>(
    null
  );
  const [feedbackStar, setFeedbackStar] = useState<number>(0);
  const [feedbackLiked, setFeedbackLiked] = useState<"like" | "dislike" | null>(
    null
  );
  const [dataComment, setDataComment] = useState<{ uuid: string }[]>([]);
  const [totalDataComment, setTotalDataComment] = useState(0);
  const [formComment, setFormComment] = useState<string>();
  const [loadingComment, setLoadingComment] = useState<boolean>(false);
  const [refreshComment, setRefreshComment] = useState<boolean>(false);

  useEffect(() => {
    if (!uuid) return;
    (async () => {
      setLoadingPage(true);
      try {
        const { data: resUserUpl } = await AXIOS_INSTANCE.get(`/user_upload`, {
          params: {
            uuid,
            user_uuid,
          },
        });
        const userUploadData = resUserUpl.data[0];
        setThumbnailFilename(userUploadData.thumbnail_filename);
        setMusicBackgroundColor(userUploadData.background_color);

        const ageLabel = userUploadData.ai_rating_result;
        if (ageLabel === "13+") {
          setAgeLabelRating("13.png");
        } else if (ageLabel === "17+") {
          setAgeLabelRating("17.png");
        } else if (ageLabel === "21+") {
          setAgeLabelRating("21.png");
        } else {
          setAgeLabelRating("SU.png");
        }

        if (!currentTrack || currentTrack.uuid !== userUploadData.uuid) {
          playTrack(
            {
              uuid: userUploadData.uuid,
              title: userUploadData.title,
              thumbnail: userUploadData.thumbnail_filename,
              url: `${STORAGE_S3}/user_uploads/musics/${userUploadData.music_filename}`,
              ai_rating_result: userUploadData.ai_rating_result,
              background_color: userUploadData.background_color,
            },
            false
          );
        }

        const { data: feedback } = await AXIOS_INSTANCE.get(`/user_feedback`, {
          params: { user_upload_uuid: uuid },
        });
        if (feedback.data.length !== 0) {
          const resFeedback = feedback.data[0];
          setFeedbackStar(resFeedback.star ?? 0);
          setFeedbackLiked(resFeedback.is_liked);
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
      }
    })();
  }, [uuid]);

  useEffect(() => {
    if (!uuid) return;
    (async () => {
      try {
        const { data: resDataComment } = await AXIOS_INSTANCE.get(
          `/user_comment/user_upload_uuid`,
          {
            params: {
              user_upload_uuid: uuid,
              limit: 999999,
              offset: 0,
            },
          }
        );
        setDataComment(resDataComment.data);
        setTotalDataComment(resDataComment.total_data);
      } catch (error) {
        console.log(error);
      }
    })();
  }, [uuid, refreshComment]);

  async function handleStar(starValue: number) {
    try {
      if (starValue === 1 && feedbackStar === 1) {
        setFeedbackStar(0);
        await AXIOS_INSTANCE.post(`/user_feedback/star`, {
          user_upload_uuid: uuid,
          star: 0,
        });
        return;
      }
      setFeedbackStar(starValue);
      if (starValue === feedbackStar) return;
      await AXIOS_INSTANCE.post(`/user_feedback/star`, {
        user_upload_uuid: uuid,
        star: starValue,
      });
    } catch (error) {
      console.log(error);
    }
  }

  async function handleLiked(newValue: "like" | "dislike" | null) {
    try {
      if (newValue === feedbackLiked) return;
      setFeedbackLiked(newValue);
      await AXIOS_INSTANCE.post(`/user_feedback/liked`, {
        user_upload_uuid: uuid,
        is_liked: newValue,
      });
    } catch (error) {
      console.log(error);
    }
  }

  async function handleComment(e: FormEvent) {
    e.preventDefault();
    if (loadingComment) return;
    setLoadingComment(true);
    try {
      await AXIOS_INSTANCE.post(`/user_comment/comment`, {
        user_upload_uuid: uuid,
        comment: formComment,
      });
      setFormComment("");
      setRefreshComment(!refreshComment);
    } catch (error) {
      console.log(error);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Failed to post comment",
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
      setLoadingComment(false);
    }
  }

  async function handleDeleteComment(uuid: string) {
    if (loadingComment) return;
    try {
      await AXIOS_INSTANCE.delete(`/user_comment`, {
        params: { uuid },
      });
      setRefreshComment(!refreshComment);
    } catch (error) {
      console.log(error);
    }
  }

  return loadingPage ? (
    <LoadingSpinner />
  ) : (
    <LayoutUser isSidebar={false}>
      <div className="w-screen flex gap-6 flex-col items-center justify-center h-full bg-[#DBD2FE]">
        <div className="rounded-lg relative overflow-hidden shadow-md h-60 w-[80%] lg:w-[30%]">
          {thumbnailFilename ? (
            <img
              src={`${STORAGE_S3}/user_uploads/thumbnails/${thumbnailFilename}`}
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
          {ageLabelRating && (
            <img
              src={`/label_rating/${ageLabelRating}`}
              className="absolute top-0 right-0 w-72"
            />
          )}
        </div>

        <div className="flex flex-col items-center justify-center gap-4">
          <div className="flex items-center gap-2 text-3xl text-orange-500">
            {[1, 2, 3, 4, 5].map((star) =>
              star <= feedbackStar ? (
                <FaStar
                  key={star}
                  className="cursor-pointer"
                  onClick={() => handleStar(star)}
                />
              ) : (
                <FaRegStar
                  key={star}
                  className="cursor-pointer"
                  onClick={() => handleStar(star)}
                />
              )
            )}
          </div>
          <div className="flex items-center justify-center gap-8 text-3xl text-[#493D9E]">
            <div className="flex flex-col items-center">
              {feedbackLiked === "like" ? (
                <AiFillLike
                  className="text-[#493D9E] cursor-pointer"
                  onClick={() => handleLiked(null)}
                />
              ) : (
                <AiOutlineLike
                  className="cursor-pointer"
                  onClick={() => handleLiked("like")}
                />
              )}
              <p className="text-xs font-bold">2300</p>
            </div>

            <div className="flex flex-col items-center">
              {feedbackLiked === "dislike" ? (
                <AiFillDislike
                  className="text-[#493D9E] cursor-pointer"
                  onClick={() => handleLiked(null)}
                />
              ) : (
                <AiOutlineDislike
                  className="cursor-pointer"
                  onClick={() => handleLiked("dislike")}
                />
              )}
              <p className="text-xs font-bold">2300</p>
            </div>
          </div>
          <a
            href="#comments"
            className="flex flex-col items-center justify-center mt-4 text-xs font-bold text-center text-[#493D9E]"
          >
            <IoArrowDownCircleOutline size={30} className="animate-bounce" />
            <p>Comments...</p>
          </a>
        </div>
      </div>

      <section className="py-8 antialiased lg:py-16" id="comments">
        <div className="max-w-2xl px-4 mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900 lg:text-2xl">
              Discussion ({totalDataComment})
            </h2>
          </div>
          <form className="mb-16" onSubmit={handleComment}>
            <div className="px-4 py-2 mb-4 border-2 border-[#493D9E] rounded-lg rounded-t-lg">
              <textarea
                className="w-full px-0 text-sm text-gray-900 bg-transparent border-0 focus:ring-0 focus:outline-none"
                onChange={(e) => setFormComment(e.target.value)}
                value={formComment}
                placeholder="Write a comment..."
                rows={6}
                required
              ></textarea>
            </div>
            <button className="inline-flex items-center py-2.5 px-4 text-xs font-medium text-center text-white bg-[#493D9E] rounded-lg">
              Post comment
            </button>
          </form>
          <div>
            {dataComment.map((c) => (
              <CommentItem
                key={c.uuid}
                comment={c}
                user_uuid={user_uuid!}
                onDelete={handleDeleteComment}
                user_upload_uuid={uuid}
                setRefreshComment={setRefreshComment}
                refreshComment={refreshComment}
              />
            ))}
          </div>
        </div>
      </section>
    </LayoutUser>
  );
}

function CommentItem({
  user_upload_uuid,
  comment,
  user_uuid,
  onDelete,
  setRefreshComment,
  refreshComment,
}: {
  user_upload_uuid: string | undefined;
  comment: any;
  user_uuid: string;
  onDelete: (uuid: string) => void;
  setRefreshComment: Dispatch<SetStateAction<boolean>>;
  refreshComment: boolean;
}) {
  const [openDropdown, setOpenDropdown] = useState<boolean>(false);
  const [openReply, setOpenReply] = useState<boolean>(false);
  const [loadingReply, setLoadingReply] = useState<boolean>(false);
  const [formReply, setFormReply] = useState<string>();
  const [openEdit, setOpenEdit] = useState<boolean>(false);
  const [loadingEdit, setLoadingEdit] = useState<boolean>(false);
  const [formEdit, setFormEdit] = useState<string>(comment.comment);

  async function handleReply() {
    if (loadingReply) return;
    setLoadingReply(true);
    try {
      await AXIOS_INSTANCE.post(`/user_comment/reply`, {
        user_upload_uuid,
        comment: formReply,
        parent_uuid: comment.uuid,
      });
      setFormReply("");
      setOpenReply(false);
      setRefreshComment(!refreshComment);
    } catch (error) {
      console.log(error);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Failed to post reply",
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
      setLoadingReply(false);
    }
  }

  async function handleEdit() {
    if (loadingEdit) return;
    setLoadingEdit(true);
    try {
      await AXIOS_INSTANCE.put(
        `/user_comment`,
        {
          comment: formEdit,
        },
        { params: { uuid: comment.uuid } }
      );
      setOpenEdit(false);
      setRefreshComment(!refreshComment);
    } catch (error) {
      console.log(error);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Failed to update comment",
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
      setLoadingEdit(true);
    }
  }

  return (
    <article className="my-10 text-base rounded-lg">
      <footer className="relative flex items-center justify-between mb-2">
        <div className="flex items-center">
          <p className="inline-flex items-center mr-3 text-sm font-semibold text-gray-900">
            <div className="w-7 h-7 mr-2 bg-[#493D9E] rounded-full overflow-hidden flex items-center justify-center">
              {comment.user.profile_picture ? (
                <img
                  src={`${STORAGE_S3}/user/profile_pictures/${comment.user.profile_picture}`}
                  className="object-cover object-center w-full h-full"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90%"></div>
              )}
            </div>
            {comment.user.first_name} {comment.user.last_name}
          </p>
          <p className="text-sm text-gray-600">
            {new Date(comment.created_at).toLocaleString()}
          </p>
        </div>
        <button
          className="inline-flex items-center p-2 text-sm font-medium text-center text-gray-500 rounded-lg"
          onClick={() => {
            if (comment.user.uuid === user_uuid) setOpenDropdown(!openDropdown);
          }}
        >
          <svg
            className="w-4 h-4"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 16 3"
          >
            <path d="M2 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm6.041 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM14 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z" />
          </svg>
        </button>
        <DropdownMenu
          isOpen={openDropdown}
          onClose={() => setOpenDropdown(false)}
        >
          <ul className="py-1 text-sm text-gray-700">
            <li
              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
              onClick={() => {
                setOpenEdit(true);
                setOpenDropdown(false);
              }}
            >
              Edit
            </li>
            <li
              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
              onClick={() => {
                onDelete(comment.uuid);
                setOpenDropdown(false);
              }}
            >
              Remove
            </li>
          </ul>
        </DropdownMenu>
      </footer>

      {openEdit ? (
        <form className={`${!openEdit && "hidden"}`}>
          <div className="px-4 py-2 mb-2 border-2 border-[#493D9E] rounded-lg rounded-t-lg">
            <textarea
              className="w-full px-0 text-sm text-gray-900 bg-transparent border-0 focus:ring-0 focus:outline-none"
              onChange={(e) => setFormEdit(e.target.value)}
              value={formEdit}
              placeholder="Write a comment..."
              rows={4}
              required
            ></textarea>
          </div>
          <button
            onClick={() => {
              setFormEdit(comment.comment);
              setOpenEdit(false);
            }}
            className="inline-flex items-center mr-2 py-2.5 px-4 text-xs font-medium text-center text-white bg-red-500 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleEdit}
            className="inline-flex items-center py-2.5 px-4 text-xs font-medium text-center text-white bg-[#493D9E] rounded-lg"
          >
            Save Edit
          </button>
        </form>
      ) : (
        <p className="text-gray-500">{comment.comment}</p>
      )}

      <div className="flex items-center mt-4 space-x-4">
        <button
          className="flex items-center text-sm font-medium text-gray-500 hover:underline"
          onClick={() => {
            setFormReply("");
            setOpenReply(true);
          }}
        >
          <svg
            className="mr-1.5 w-3.5 h-3.5"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 18"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 5h5M5 8h2m6-3h2m-5 3h6m2-7H2a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h3v5l5-5h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1Z"
            />
          </svg>
          Reply
        </button>
      </div>

      <form className={`${!openReply && "hidden"}`}>
        <div className="px-4 py-2 mb-2 border-2 border-[#493D9E] rounded-lg rounded-t-lg">
          <textarea
            className="w-full px-0 text-sm text-gray-900 bg-transparent border-0 focus:ring-0 focus:outline-none"
            onChange={(e) => setFormReply(e.target.value)}
            value={formReply}
            placeholder="Write a comment..."
            rows={4}
            required
          ></textarea>
        </div>
        <button
          onClick={() => {
            setFormReply("");
            setOpenReply(false);
          }}
          className="inline-flex items-center mr-2 py-2.5 px-4 text-xs font-medium text-center text-white bg-red-500 rounded-lg"
        >
          Cancel
        </button>
        <button
          onClick={handleReply}
          className="inline-flex items-center py-2.5 px-4 text-xs font-medium text-center text-white bg-[#493D9E] rounded-lg"
        >
          Send Reply
        </button>
      </form>

      {comment.replies?.length > 0 && (
        <div className="ml-8">
          {comment.replies.map((reply: any) => (
            <CommentItem
              key={reply.uuid}
              user_upload_uuid={user_upload_uuid}
              comment={reply}
              user_uuid={user_uuid}
              onDelete={onDelete}
              setRefreshComment={setRefreshComment}
              refreshComment={refreshComment}
            />
          ))}
        </div>
      )}
    </article>
  );
}

function DropdownMenu({
  isOpen,
  onClose,
  children,
}: {
  isOpen: any;
  onClose: any;
  children: any;
}) {
  const menuRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);
  return (
    <div
      ref={menuRef}
      className={`z-10 absolute right-0 top-10 bg-white divide-y divide-gray-100 rounded shadow-md w-36 ${
        !isOpen && "hidden"
      }`}
    >
      {children}
    </div>
  );
}
