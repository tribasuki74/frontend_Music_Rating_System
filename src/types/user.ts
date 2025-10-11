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
  role: string;
  profile_picture?: string;
  gender: string;
  user_genres: genreType[];
  report_count: number;
};
