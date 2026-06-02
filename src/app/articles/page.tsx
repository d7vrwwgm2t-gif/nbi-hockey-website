import Link from "next/link";
import { client } from "@/sanity/lib/client";
import { ARTICLES_QUERY } from "@/sanity/lib/queries";

type Article = {
  _id: string;
  title: string;
  slug?: string;
  articleType: "internal" | "external";
  externalUrl?: string;
  externalPublisher?: string;
  summary?: string;
  publishedAt?: string;
};

export default async function ArticlesPage() {
  const articles = await client.fetch<Article[]>(ARTICLES_QUERY);

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <h1 className="mb-6 text-5xl font-bold">Articles</h1>

        <p className="mb-12 max-w-2xl text-xl text-gray-300">
          Analysis, research, and hockey writing from NBI Hockey.
        </p>

        <div className="space-y-6">
          {articles.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-zinc-900 p-6">
              <p className="text-gray-400">
                No articles published yet.
              </p>
            </div>
          ) : (
            articles.map((article) => (
              <div
                key={article._id}
                className="rounded-xl border border-white/10 bg-zinc-900 p-6"
              >
                <h2 className="mb-2 text-2xl font-semibold">
                  {article.articleType === "external" ? (
                    <a
                      href={article.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-400"
                    >
                      {article.title}
                    </a>
                  ) : (
                    <Link
                      href={`/articles/${article.slug}`}
                      className="hover:text-blue-400"
                    >
                      {article.title}
                    </Link>
                  )}
                </h2>

                {article.summary && (
                  <p className="mb-4 text-gray-400">
                    {article.summary}
                  </p>
                )}

                <div className="text-sm text-gray-500">
                  {article.articleType === "external"
                    ? `Published by ${article.externalPublisher ?? "External Publication"}`
                    : "NBI Hockey Article"}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}