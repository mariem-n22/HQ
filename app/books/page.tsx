import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { SectorPage, EmptyState } from "@/components/hq/SiteShell";
import { SectorHeader } from "@/components/hq/SectorHeader";
import { BookShelf } from "@/components/hq/BookShelf";
import { getBooks, getContentBlocks, findBlock } from "@/lib/data";

export const metadata: Metadata = pageMeta({
  title: "Books — what the studio reads",
  description:
    "A reading log kept by the studio: books on architecture, cities and making, and what was taken from each.",
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
          "Books read by the studio, the lines that stuck, and what each one changed in how the practice thinks."
        }
      />
      <div className="mt-10">
        {books.length === 0 ? <EmptyState what="books" /> : <BookShelf books={books} />}
      </div>
    </SectorPage>
  );
}
