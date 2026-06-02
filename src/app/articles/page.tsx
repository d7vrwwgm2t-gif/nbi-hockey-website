import Image from "next/image";
import Link from "next/link";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
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
  mainImage?: any;
};

function getArticleHref(article: Article) {
  if (article.articleType === "external") {
    return article.externalUrl ?? "#";
  }

  return `/articles/${article.slug}`;
}

export default async function ArticlesPage() {
  const articles = await client.fetch<Article[]>(ARTICLES_QUERY);

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <h1 className="mb-6 text-5xl font-bold">Articles</h1>

        <p className="mb-12 max-w-2xl text-xl text-gray-300">
          All NBI Hockey articles, research, and published analysis.
        </p>

        <div className="space-y-6">
          {articles.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-zinc-900 p-6">
              <p className="text-gray-400">No articles published yet.</p>
            </div>
          ) : (
            articles.map((article) => (
              <Link
                key={article._id}
                href={getArticleHref(article)}
                target={article.articleType === "external" ? "_blank" : undefined}
                className="grid gap-6 rounded-xl border border-white/10 bg-zinc-900 p-6 transition hover:border-blue-400/50 hover:bg-zinc-800 md:grid-cols-[220px_1fr]"
              >
               {article.mainImage?.asset ? (
                  <div className="overflow-hidden rounded-lg border border-white/10">
                    <Image
                      src={urlFor(article.mainImage).width(500).height(300).fit("crop").url()}
                      alt={article.title}
                      width={500}
                      height={300}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="hidden rounded-lg border border-white/10 bg-zinc-800 md:block" />
                )}

                <div>
                  <h2 className="mb-2 text-2xl font-semibold">
                    {article.title}
                  </h2>

                  {article.summary && (
                    <p className="mb-4 text-gray-400">{article.summary}</p>
                  )}

                  <div className="text-sm text-gray-500">
                    {article.articleType === "external"
                      ? `Published by ${article.externalPublisher ?? "External Publication"}`
                      : "NBI Hockey Article"}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </main>
  );
}