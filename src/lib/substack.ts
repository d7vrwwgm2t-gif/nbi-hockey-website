import Parser from "rss-parser";

const parser = new Parser();

function extractFirstImage(html: string) {
  const match = html.match(/<img[^>]+src="([^">]+)"/);

  return match?.[1] ?? "";
}

function cleanSnippet(text: string) {
  return text
    .replace(/\s+/g, " ")
    .replace("Continue reading", "")
    .trim();
}

export async function getSubstackPosts() {
  const feed = await parser.parseURL(
    "https://nbihockey.substack.com/feed"
  );

  return feed.items.map((item) => {
    const content = item.content ?? "";
    const contentEncoded =
      (item as { ["content:encoded"]?: string })["content:encoded"] ?? "";

    const image =
      extractFirstImage(contentEncoded) ||
      extractFirstImage(content);

    return {
      title: item.title ?? "",
      link: item.link ?? "",
      pubDate: item.pubDate ?? "",
      contentSnippet: cleanSnippet(item.contentSnippet ?? ""),
      image,
    };
  });
}