/* eslint-disable @typescript-eslint/no-explicit-any */
import Swal from "sweetalert2";
import LayoutUser from "../../components/layout_user";
import { Link, useNavigate, useParams } from "react-router-dom";
import { usePlayer } from "../../context/player";
import { useEffect, useState, type ReactNode } from "react";
import type { masterDataType } from "../../types/music";
import AXIOS_INSTANCE from "../../utils/axios_instance";
import { truncateText } from "../../utils/truncate_text";
import { formatDuration } from "../../utils/format_duration";
import { TO_PLAY_MUSIC, TO_USER_PROFILE } from "../../utils/paths";
import LoadingSpinner from "../../components/loading";
import { STORAGE_S3 } from "../../utils/constant";
import { TbArrowBarToDown, TbArrowBarToUp } from "react-icons/tb";
import { deleteData } from "../../components/delete_data";
import { IoMenu } from "react-icons/io5";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function MyPlaylistDetailPage() {
  const { user_playlist_uuid } = useParams<{ user_playlist_uuid: string }>();
  const navigate = useNavigate();
  const { playTrack } = usePlayer();
  const sensors = useSensors(useSensor(PointerSensor));
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingMove, setLoadingMove] = useState(false);
  const [playlistName, setPlaylistName] = useState("");
  const [refreshMyMusicPlaylist, setRefreshMyMusicPlaylist] = useState(false);
  const [myMusic, setMyMusic] = useState<
    { uuid: string; user_upload: masterDataType }[]
  >([]);

  useEffect(() => {
    if (!user_playlist_uuid) {
      setLoadingPage(false);
      return;
    }
    (async () => {
      try {
        const { data: resMyPlaylist } = await AXIOS_INSTANCE.get(
          `/user_playlist/get_by_uuid`,
          { params: { uuid: user_playlist_uuid } }
        );
        setPlaylistName(resMyPlaylist.playlist_name);

        const { data: resMyMusicPlaylist } = await AXIOS_INSTANCE.get(
          `/user_playlist_detail/get_by_user_playlist`,
          {
            params: {
              limit: "999999",
              offset: "0",
              user_playlist_uuid,
            },
          }
        );
        setMyMusic(resMyMusicPlaylist.data);
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
  }, [user_playlist_uuid, refreshMyMusicPlaylist]);

  async function handleMovePlaylistItem(uuid: string, direction: string) {
    if (loadingMove) return;
    setLoadingMove(true);
    try {
      await AXIOS_INSTANCE.post("/user_playlist_detail/move_playlist_item", {
        uuid,
        direction,
      });
      setRefreshMyMusicPlaylist(!refreshMyMusicPlaylist);
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingMove(false);
    }
  }

  function handleDragEnd(event: any) {
    const { active, over } = event;
    if (active.id !== over.id) {
      setMyMusic((items) => {
        const oldIndex = items.findIndex((i) => i.uuid === active.id);
        const newIndex = items.findIndex((i) => i.uuid === over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        AXIOS_INSTANCE.post("/user_playlist_detail/reorder_playlist", {
          user_playlist_uuid,
          ordered_uuids: newOrder.map((x) => x.uuid),
        });
        return newOrder;
      });
    }
  }

  return loadingPage ? (
    <LoadingSpinner />
  ) : (
    <LayoutUser>
      <div className="h-full mt-2 overflow-hidden lg:mt-0">
        <p className="mb-2 font-bold">{playlistName}</p>
        <div className="w-full h-full p-4 bg-white rounded-lg shadow-md">
          <div className="h-[calc(100vh-200px)] overflow-y-auto hide-scrollbar">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <table className="w-full">
                <thead className="text-[#493D9E] font-bold sticky top-0 bg-white">
                  <tr>
                    <td className="pb-2">Title Song</td>
                    <td>Upload By</td>
                    <td className="px-2 text-center text-nowrap">
                      Duration Song
                    </td>
                    <td className="px-2 text-center text-nowrap">
                      Remove From Playlist
                    </td>
                    <td className="px-2 text-center text-nowrap">Move</td>
                  </tr>
                </thead>

                <tbody>
                  <SortableContext
                    items={myMusic.map((i) => i.uuid)}
                    strategy={verticalListSortingStrategy}
                  >
                    {myMusic.map((item) => {
                      return (
                        <SortableItem
                          key={item.uuid}
                          id={item.uuid}
                          className="text-xs"
                        >
                          {(listeners) => (
                            <>
                              <td className="pr-2 text-nowrap">
                                <div className="flex items-center gap-2 mb-2">
                                  <IoMenu
                                    className="text-xl cursor-grab"
                                    {...listeners}
                                  />

                                  <div
                                    className="flex items-center gap-2 cursor-pointer"
                                    title={item.user_upload.title}
                                    onDoubleClick={() =>
                                      navigate(
                                        `${TO_PLAY_MUSIC}/${item.user_upload.uuid}`
                                      )
                                    }
                                    onClick={() =>
                                      playTrack(
                                        {
                                          uuid: item.user_upload.uuid,
                                          title: truncateText(
                                            item.user_upload.title,
                                            30
                                          ),
                                          url: `${STORAGE_S3}/user_uploads/musics/${item.user_upload.music_filename}`,
                                          thumbnail:
                                            item.user_upload.thumbnail_filename,
                                          ai_rating_result:
                                            item.user_upload.ai_rating_result,
                                          background_color:
                                            item.user_upload.background_color,
                                        },
                                        true
                                      )
                                    }
                                  >
                                    <div className="w-9 h-9 bg-[#DBD2FE] rounded overflow-hidden">
                                      {item.user_upload.thumbnail_filename ? (
                                        <img
                                          className="object-cover object-center w-full h-full"
                                          src={`${STORAGE_S3}/user_uploads/thumbnails/${item.user_upload.thumbnail_filename}`}
                                        />
                                      ) : (
                                        <div
                                          style={{
                                            backgroundColor:
                                              item.user_upload.background_color,
                                          }}
                                          className="w-full h-full"
                                        ></div>
                                      )}
                                    </div>
                                    <p className="font-medium">
                                      {truncateText(item.user_upload.title, 40)}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="pr-4 text-nowrap">
                                <Link
                                  to={`${TO_USER_PROFILE}/${item.user_upload.user.uuid}`}
                                >
                                  {item.user_upload.user.first_name}{" "}
                                  {item.user_upload.user.last_name}
                                </Link>
                              </td>
                              <td className="pr-2 text-center text-nowrap">
                                {formatDuration(item.user_upload.duration)}
                              </td>
                              <td className="font-bold text-center text-red-500">
                                <span
                                  className="cursor-pointer"
                                  onClick={async () =>
                                    await deleteData(
                                      `/user_playlist_detail?uuid=${item.uuid}`,
                                      setRefreshMyMusicPlaylist,
                                      refreshMyMusicPlaylist
                                    )
                                  }
                                >
                                  Remove
                                </span>
                              </td>
                              <td className="font-bold text-center text-[#493D9E] text-2xl">
                                <div className="flex items-center justify-center gap-4">
                                  <TbArrowBarToUp
                                    className="cursor-pointer"
                                    title="Move to Top"
                                    onClick={() =>
                                      handleMovePlaylistItem(item.uuid, "top")
                                    }
                                  />
                                  <TbArrowBarToDown
                                    className="cursor-pointer"
                                    title="Move to Down"
                                    onClick={() =>
                                      handleMovePlaylistItem(item.uuid, "down")
                                    }
                                  />
                                </div>
                              </td>
                            </>
                          )}
                        </SortableItem>
                      );
                    })}
                  </SortableContext>
                </tbody>
              </table>
            </DndContext>
          </div>
        </div>
      </div>
    </LayoutUser>
  );
}

function SortableItem({
  id,
  children,
  className,
}: {
  id: string;
  children: (listeners: any) => ReactNode;
  className?: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <tr ref={setNodeRef} style={style} {...attributes} className={className}>
      {children(listeners)}
    </tr>
  );
}
