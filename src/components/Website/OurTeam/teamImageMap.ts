import type { StaticImageData } from "next/image";
import dsc04954 from "@/assets/images/DSC04954.jpg";
import dsc04960 from "@/assets/images/DSC04960.jpg";
import dsc04908 from "@/assets/images/DSC04908.jpg";
import rniFilmsImg from "@/assets/images/RNI-Films-IMG-C2361EA5-BC20-4E6F-865C-C43291D1CB96.jpg";
import dsc05038 from "@/assets/images/DSC05038.jpeg";
import dsc04932 from "@/assets/images/DSC04932.jpg";
import dsc04918 from "@/assets/images/DSC04918.jpg";
import dsc04966 from "@/assets/images/DSC04966.jpg";
import dsc05000 from "@/assets/images/DSC05000.jpg";
import dsc05022 from "@/assets/images/DSC05022.jpg";
import dsc05025 from "@/assets/images/DSC05025.jpg";
import dsc05027 from "@/assets/images/DSC05027.jpg";
import dsc05108 from "@/assets/images/DSC05108.jpg";
import jabbar from "@/assets/images/jabbar.jpeg";
import sadia from "@/assets/images/Sadia.jpg";
import hamza from "@/assets/images/Hamza.jpg";

/** Must match keys in `src/lib/websiteTeamDefaults.ts`. */
export const TEAM_IMAGE_MAP: Record<string, StaticImageData> = {
  dsc04954,
  dsc04960,
  dsc04908,
  rni_films_img_c2361ea5: rniFilmsImg,
  dsc05038,
  dsc04932,
  dsc04918,
  dsc04966,
  dsc05000,
  dsc05022,
  dsc05025,
  dsc05027,
  dsc05108,
  jabbar,
  sadia,
  hamza,
};

export type TeamAvatarSrc = string | StaticImageData | null;

export function resolveTeamImage(key: string | null | undefined): StaticImageData | null {
  if (!key || !(key in TEAM_IMAGE_MAP)) return null;
  return TEAM_IMAGE_MAP[key];
}

/** Prefer uploaded public URL; otherwise bundled asset by key. */
export function resolveTeamAvatar(
  photoUrl: string | null | undefined,
  imageKey: string | null | undefined,
): TeamAvatarSrc {
  const u = photoUrl?.trim();
  if (u && (u.startsWith("http://") || u.startsWith("https://"))) return u;
  return resolveTeamImage(imageKey);
}
