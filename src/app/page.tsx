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

export default async function Home() {
  const articles = await client.fetch<Article[]>(ARTICLES_QUERY);

  const featuredArticle = articles[0];
  const latestArticles = articles.slice(1, 4);

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <section className="mb-20">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-blue-400">
            NBI Hockey
          </p>

          <h1 className="mb-6 max-w-4xl text-5xl font-bold leading-tight md:text-7xl">
            Hockey Analysis Built Around Data.
          </h1>

          <p className="max-w-3xl text-xl text-gray-400">
            Research, player evaluation, team analysis, and custom hockey
            analytics designed to bring context to the game.
          </p>
        </section>

        <section className="mb-20">
          <h2 className="mb-6 text-3xl font-bold">Featured Analysis</h2>

          {featuredArticle ? (
            <Link
              href={getArticleHref(featuredArticle)}
              target={featuredArticle.articleType === "external" ? "_blank" : undefined}
              className="grid gap-8 rounded-xl border border-white/10 bg-zinc-900 p-8 transition hover:border-blue-400/50 hover:bg-zinc-800 md:grid-cols-[1.3fr_1fr]"
            >
              <div>
                <div className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-400">
                  Newest Article
                </div>

                <h3 className="mb-3 text-3xl font-semibold">
                  {featuredArticle.title}
                </h3>

                {featuredArticle.summary && (
                  <p className="text-gray-400">{featuredArticle.summary}</p>
                )}
              </div>

              {featuredArticle.mainImage?.asset && (
                <div className="overflow-hidden rounded-xl border border-white/10">
                  <Image
                    src={urlFor(featuredArticle.mainImage).width(700).height(450).fit("crop").url()}
                    alt={featuredArticle.title}
                    width={700}
                    height={450}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </Link>
          ) : (
            <div className="rounded-xl border border-white/10 bg-zinc-900 p-8">
              <h3 className="mb-3 text-2xl font-semibold">
                No featured article yet
              </h3>

              <p className="text-gray-400">
                Publish your first article in Sanity Studio and it will appear here.
              </p>
            </div>
          )}
        </section>

        <section className="mb-20">
          <h2 className="mb-6 text-3xl font-bold">Latest Articles</h2>

          {latestArticles.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-3">
              {latestArticles.map((article) => (
                <Link
                  key={article._id}
                  href={getArticleHref(article)}
                  target={article.articleType === "external" ? "_blank" : undefined}
                  className="block overflow-hidden rounded-xl border border-white/10 bg-zinc-900 transition hover:border-blue-400/50 hover:bg-zinc-800"
                >
                  <div className="p-6">
                    <h3 className="mb-3 font-semibold">{article.title}</h3>

                    {article.mainImage?.asset && (
                      <div className="mb-4 overflow-hidden rounded-lg border border-white/10">
                        <Image
                          src={urlFor(article.mainImage).width(600).height(360).fit("crop").url()}
                          alt={article.title}
                          width={600}
                          height={360}
                          className="h-auto w-full object-cover"
                        />
                      </div>
                    )}

                    {article.summary && (
                      <p className="text-sm text-gray-400">{article.summary}</p>
                    )}

                    <div className="mt-4 text-xs uppercase tracking-widest text-gray-500">
                      {article.articleType === "external"
                        ? article.externalPublisher ?? "External"
                        : "NBI Hockey"}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 bg-zinc-900 p-6">
              <p className="text-gray-400">
                Publish more articles and they will appear here.
              </p>
            </div>
          )}
        </section>

        <section className="rounded-xl border border-blue-500/20 bg-blue-950/20 p-8">
          <h2 className="mb-4 text-3xl font-bold">
            Coming Soon: NBI Hockey Model
          </h2>

          <p className="max-w-3xl text-gray-300">
            Custom player ratings, team projections, analytics dashboards, and
            model-driven insights built from original research and statistical
            analysis.
          </p>
        </section>
      </div>
    </main>
  );
}