import { notFound } from "next/navigation";
import { client } from "@/sanity/lib/client";
import { ARTICLE_BY_SLUG_QUERY } from "@/sanity/lib/queries";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;

  const article = await client.fetch(ARTICLE_BY_SLUG_QUERY, { slug });

  if (!article) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-4xl px-6 py-24">
        <h1 className="mb-6 text-5xl font-bold">
          {article.title}
        </h1>

        {article.summary && (
          <p className="mb-8 text-xl text-gray-400">
            {article.summary}
          </p>
        )}

        <div className="rounded-xl border border-white/10 bg-zinc-900 p-6">
          <p className="text-gray-300">
            Article content rendering is coming next.
          </p>
        </div>
      </div>
    </main>
  );
}