import { Suspense } from "react";
import { SearchView } from "./search-view";
import { getGenres } from "@/lib/api";

export const metadata = { title: "Search" };

export default async function SearchPage() {
  const animeGenres = await getGenres("anime");
  return (
    <Suspense>
      <SearchView animeGenres={animeGenres} />
    </Suspense>
  );
}
