import type { genreType } from "./genre";

export type userType = {
  uuid: string;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  date_birth: string;
  is_active: boolean;
  background_color: string;
  profile_picture?: string;
  user_genres: genreType[];
};
