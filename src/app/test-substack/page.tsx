import { getSubstackPosts } from "@/lib/substack";

export default async function TestSubstackPage() {
  const posts = await getSubstackPosts();

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <h1 className="mb-8 text-4xl font-bold">
        Substack Test
      </h1>

      <div className="space-y-6">
        {posts.map((post) => (
          <div
            key={post.link}
            className="rounded-lg border border-white/10 p-6"
          >
            <h2 className="text-2xl font-semibold">
              {post.title}
            </h2>

            <p className="mt-2 text-gray-400">
              {post.pubDate}
            </p>

            <a
              href={post.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400"
            >
              Read on Substack
            </a>
          </div>
        ))}
      </div>
    </main>
  );
}
