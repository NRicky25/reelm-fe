import { MyListView } from "./my-list-view";
import { getTitles } from "@/lib/api";

export const metadata = { title: "My List" };

export default async function MyListPage() {
  return <MyListView titles={await getTitles()} />;
}
