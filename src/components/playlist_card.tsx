import { Link } from "react-router-dom";
import { TO_PUBLIC_PLAYLIST_DETAIL, TO_USER_PROFILE } from "../utils/paths";
import { truncateText } from "../utils/truncate_text";

export default function PlaylistCard({
  uuid,
  first_name,
  last_name,
  playlist_name,
  background_color,
  user_uuid,
}: {
  uuid: string;
  first_name: string;
  last_name: string;
  playlist_name: string;
  background_color: string;
  user_uuid: string;
}) {
  return (
    <div className="w-28 shrink-0">
      <Link
        to={`${TO_PUBLIC_PLAYLIST_DETAIL}/${uuid}`}
        title={`${playlist_name} - Upload By ${first_name} ${last_name}`}
      >
        <div className="bg-[#DBD2FE] relative w-full h-28 shrink-0 rounded-lg shadow-md overflow-hidden">
          <div
            style={{
              backgroundColor: background_color,
            }}
            className="w-full h-full"
          ></div>
        </div>

        <p className="mx-1 mt-1 text-xs font-semibold">
          {truncateText(playlist_name, 22)}
        </p>
      </Link>

      <Link
        to={`${TO_USER_PROFILE}/${user_uuid}`}
        className="mx-1 text-xs font-semibold text-gray-500"
      >
        {truncateText(`${first_name} ${last_name}`, 15)}
      </Link>
    </div>
  );
}
