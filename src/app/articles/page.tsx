import Image from "next/image";
import { getSubstackPosts } from "@/lib/substack";

export default async function ArticlesPage() {
  const posts = await getSubstackPosts();

  const newestPost = posts[0];
  const olderPosts = posts.slice(1);

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <h1 className="mb-6 text-5xl font-bold">Articles</h1>

        <p className="mb-12 max-w-2xl text-xl text-gray-300">
          NBI Hockey articles, research, and data-driven analysis.
        </p>

        {newestPost && (
          <section className="mb-16">
            <h2 className="mb-6 text-3xl font-bold">Newest Article</h2>

            <a
              href={newestPost.link}
              target="_blank"
              rel="noopener noreferrer"
              className="grid gap-8 rounded-xl border border-white/10 bg-zinc-900 p-8 transition hover:border-blue-400/50 hover:bg-zinc-800 md:grid-cols-[1.2fr_1fr]"
            >
              <div>
                <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-400">
                  Latest from Substack
                </p>

                <h3 className="mb-4 text-3xl font-semibold">
                  {newestPost.title}
                </h3>

                {newestPost.contentSnippet && (
                  <p className="mb-6 text-gray-400">
                    {newestPost.contentSnippet}
                  </p>
                )}

                <p className="text-sm text-gray-500">
                  {newestPost.pubDate}
                </p>

                <p className="mt-6 text-sm font-semibold text-blue-400">
                  Read on Substack →
                </p>
              </div>

              {newestPost.image && (
                <div className="overflow-hidden rounded-xl border border-white/10">
                  <Image
                    src={newestPost.image}
                    alt={newestPost.title}
                    width={800}
                    height={500}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </a>
          </section>
        )}

        <section>
          <h2 className="mb-6 text-3xl font-bold">More Articles</h2>

          {olderPosts.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-3">
              {olderPosts.map((post) => (
                <a
                  key={post.link}
                  href={post.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="overflow-hidden rounded-xl border border-white/10 bg-zinc-900 transition hover:border-blue-400/50 hover:bg-zinc-800"
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

                    <p className="mt-4 text-sm font-semibold text-blue-400">
                      Read on Substack →
                    </p>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 bg-zinc-900 p-6">
              <p className="text-gray-400">
                Older articles will appear here once more posts are published.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}