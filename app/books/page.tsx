import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { SectorPage, EmptyState } from "@/components/hq/SiteShell";
import { SectorHeader } from "@/components/hq/SectorHeader";
import { BookShelf } from "@/components/hq/BookShelf";
import { getBooks, getContentBlocks, findBlock } from "@/lib/data";

export const metadata: Metadata = pageMeta({
  title: "Reading",
  description:
    "Books on architecture, cities and making that Mariem Nasser Elsbelgy has read, and what she took from each.",
  path: "/books",
});

export default async function BooksPage() {
  const [books, blocks] = await Promise.all([getBooks(), getContentBlocks()]);
  const block = findBlock(blocks, "books_intro");

  return (
    <SectorPage>
      <SectorHeader
        sector="08"
        label="Books"
        title={block?.title ?? "Books"}
        intro={
          block?.body ??
          "Books read, the lines that stuck, and what each one changed."
        }
      />
      <div className="mt-10">
        {books.length === 0 ? <EmptyState what="books" /> : <BookShelf books={books} />}
      </div>
    </SectorPage>
  );
}
