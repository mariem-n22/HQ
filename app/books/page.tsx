import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { SectorPage, EmptyState } from "@/components/hq/SiteShell";
import { SectorHeader } from "@/components/hq/SectorHeader";
import { BookShelf } from "@/components/hq/BookShelf";
import { getBooks, getContentBlocks, findBlock } from "@/lib/data";

export const metadata: Metadata = pageMeta({
  title: "Books — what Mahmoud Hammad reads",
  description:
    "A reading log: the books Mahmoud Hammad has read, the lines worth keeping from each, and what he actually took away from them.",
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
        title={block?.title ?? "Reading log"}
        intro={
          block?.body ??
          "What I have read, the lines that stuck, and what actually changed in how I think. Not summaries."
        }
      />
      <div className="mt-10">
        {books.length === 0 ? <EmptyState what="books" /> : <BookShelf books={books} />}
      </div>
    </SectorPage>
  );
}
