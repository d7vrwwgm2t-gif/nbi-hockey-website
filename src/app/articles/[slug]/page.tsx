import Image from "next/image";
import { notFound } from "next/navigation";
import { PortableText, PortableTextComponents } from "@portabletext/react";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { ARTICLE_BY_SLUG_QUERY } from "@/sanity/lib/queries";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

const portableTextComponents: PortableTextComponents = {
  types: {
    image: ({ value }) => {
      if (!value?.asset) {
        return null;
      }

      return (
        <div className="my-10 mx-auto w-[70%] overflow-hidden rounded-xl border border-white/10">
          <Image
            src={urlFor(value).width(1000).fit("max").url()}
            alt={value.alt || "Article image"}
            width={1000}
            height={700}
            className="h-auto w-full"
          />
        </div>
      );
    },
  },
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
        <h1 className="mb-6 text-5xl font-bold">{article.title}</h1>

        {article.summary && (
          <p className="mb-8 text-xl text-gray-400">{article.summary}</p>
        )}

        {article.mainImage && (
          <div className="mb-12 mx-auto w-[85%] overflow-hidden rounded-xl border border-white/10">
            <Image
              src={urlFor(article.mainImage).width(1400).fit("max").url()}
              alt={article.mainImage.alt || article.title}
              width={1400}
              height={900}
              className="h-auto w-full"
              priority
            />
          </div>
        )}

        <article className="prose prose-invert max-w-none">
          <PortableText
            value={article.body}
            components={portableTextComponents}
          />
        </article>
      </div>
    </main>
  );
}