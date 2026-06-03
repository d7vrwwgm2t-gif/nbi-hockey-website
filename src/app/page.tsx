import Image from "next/image";
import { getSubstackPosts } from "@/lib/substack";

export default async function Home() {
  const posts = await getSubstackPosts();

  const featuredPost = posts[0];
  const latestPosts = posts.slice(1, 4);

  return (
    <main className="min-h-screen text-white">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <section className="mb-20">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#4DB5FF]">
            NBI Hockey
          </p>

          <h1 className="mb-6 max-w-4xl text-5xl font-bold leading-tight md:text-7xl">
            Hockey Analysis Built Around Data.
          </h1>

          <p className="max-w-3xl text-xl text-gray-300">
            Research, player evaluation, team analysis, and custom hockey
            analytics designed to bring context to the game.
          </p>
        </section>

        <section className="mb-20">
          <h2 className="mb-6 text-3xl font-bold">Featured Analysis</h2>

          {featuredPost ? (
            <a
              href={featuredPost.link}
              target="_blank"
              rel="noopener noreferrer"
              className="grid gap-8 rounded-xl border border-white/10 bg-[#0D1B2A]/95 p-8 transition hover:border-[#4DB5FF]/50 hover:bg-[#10243A] md:grid-cols-[1.2fr_1fr]"
            >
              <div>
                <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#FFD54A]">
                  Newest Article
                </p>

                <h3 className="mb-4 text-3xl font-semibold">
                  {featuredPost.title}
                </h3>

                {featuredPost.contentSnippet && (
                  <p className="mb-6 text-gray-300">
                    {featuredPost.contentSnippet}
                  </p>
                )}

                <p className="text-sm text-gray-500">{featuredPost.pubDate}</p>

                <p className="mt-6 text-sm font-semibold text-[#4DB5FF]">
                  Read on Substack →
                </p>
              </div>

              {featuredPost.image && (
                <div className="overflow-hidden rounded-xl border border-white/10">
                  <Image
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    width={800}
                    height={500}
                    className="h-full w-full object-cover"
                    priority
                  />
                </div>
              )}
            </a>
          ) : (
            <div className="rounded-xl border border-white/10 bg-[#0D1B2A] p-8">
              <h3 className="mb-3 text-2xl font-semibold">
                No featured article yet
              </h3>

              <p className="text-gray-400">
                Publish your first Substack article and it will appear here.
              </p>
            </div>
          )}
        </section>

        <section className="mb-20">
          <h2 className="mb-6 text-3xl font-bold">Latest Articles</h2>

          {latestPosts.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-3">
              {latestPosts.map((post) => (
                <a
                  key={post.link}
                  href={post.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="overflow-hidden rounded-xl border border-white/10 bg-[#0D1B2A]/95 transition hover:border-[#4DB5FF]/50 hover:bg-[#10243A]"
                >
                  {post.image && (
                    <div className="overflow-hidden border-b border-white/10">
                      <Image
                        src={post.image}
                        alt={post.title}
                        width={600}
                        height={360}
                        className="h-48 w-full object-cover"
                      />
                    </div>
                  )}

                  <div className="p-6">
                    <h3 className="mb-3 text-lg font-semibold">
                      {post.title}
                    </h3>

                    {post.contentSnippet && (
                      <p className="mb-4 text-sm text-gray-400">
                        {post.contentSnippet}
                      </p>
                    )}

                    <p className="text-xs uppercase tracking-widest text-gray-500">
                      {post.pubDate}
                    </p>

                    <p className="mt-4 text-sm font-semibold text-[#4DB5FF]">
                      Read on Substack →
                    </p>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 bg-[#0D1B2A] p-6">
              <p className="text-gray-400">
                Publish more Substack articles and they will appear here.
              </p>
            </div>
          )}
        </section>

        <section className="rounded-xl border border-[#4DB5FF]/20 bg-[#0D1B2A]/95 p-8">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#FFD54A]">
            Coming Soon
          </p>

          <h2 className="mb-4 text-3xl font-bold">
            NBI Hockey Model
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