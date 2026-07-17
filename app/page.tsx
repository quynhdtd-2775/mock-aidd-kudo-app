import { redirect } from "next/navigation";

// Root route: the homepage now lives at /home-page-saa (awards system at /home-awards-page).
export default function RootPage() {
  redirect("/home-page-saa");
}
