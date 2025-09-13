import { Link, useNavigate } from "react-router-dom";
import { TO_PLAY_MUSIC, TO_USER_PROFILE } from "../utils/paths";
import { truncateText } from "../utils/truncate_text";
import { STORAGE_S3 } from "../utils/constant";
import { usePlayer } from "../context/player";

export default function PlayMusicCard({
  uuid,
  title,
  first_name,
  last_name,
  music_filename,
  thumbnail_filename,
  ai_rating_result,
  background_color,
  user_uuid,
}: {
  uuid: string;
  title: string;
  first_name: string;
  last_name: string;
  music_filename: string;
  thumbnail_filename: string;
  ai_rating_result: string;
  background_color: string;
  user_uuid: string;
}) {
  const navigate = useNavigate();
  const { playTrack } = usePlayer();
  let ageLabel = "";
  if (ai_rating_result === "13+") {
    ageLabel = "13.png";
  } else if (ai_rating_result === "17+") {
    ageLabel = "17.png";
  } else if (ai_rating_result === "21+") {
    ageLabel = "21.png";
  } else {
    ageLabel = "SU.png";
  }

  return (
    <div className="w-28 shrink-0">
      <div
        className="cursor-pointer"
        title={`${title} - Upload By ${first_name} ${last_name}`}
        onDoubleClick={() => navigate(`${TO_PLAY_MUSIC}/${uuid}`)}
        onClick={() =>
          playTrack(
            {
              uuid: uuid,
              title: truncateText(title, 30),
              url: `${STORAGE_S3}/user_uploads/musics/${music_filename}`,
              thumbnail: thumbnail_filename,
              ai_rating_result,
              background_color,
            },
            true
          )
        }
      >
        <div className="bg-[#DBD2FE] relative w-full h-28 shrink-0 rounded-lg shadow-md overflow-hidden">
          {thumbnail_filename ? (
            <img
              className="object-cover object-center w-full h-full"
              src={`${STORAGE_S3}/user_uploads/thumbnails/${thumbnail_filename}`}
            />
          ) : (
            <div
              style={{
                backgroundColor: background_color,
              }}
              className="w-full h-full"
            ></div>
          )}

          {ageLabel && (
            <img
              src={`/label_rating/${ageLabel}`}
              className="absolute top-0 right-0 w-72"
            />
          )}
        </div>

        <p className="mx-1 mt-1 text-xs font-semibold">
          {truncateText(title, 22)}
        </p>
      </div>

      <Link
        to={`${TO_USER_PROFILE}/${user_uuid}`}
        className="mx-1 text-xs font-semibold text-gray-500"
      >
        {truncateText(`${first_name} ${last_name}`, 15)}
      </Link>
    </div>
  );
}
