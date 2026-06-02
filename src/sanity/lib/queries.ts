import {defineQuery} from 'next-sanity'

export const ARTICLES_QUERY = defineQuery(`
  *[_type == "post"] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    articleType,
    externalUrl,
    externalPublisher,
    summary,
    publishedAt,
    mainImage,
    "categories": categories[]->title
  }
`)

export const ARTICLE_BY_SLUG_QUERY = defineQuery(`
  *[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    articleType,
    externalUrl,
    externalPublisher,
    summary,
    publishedAt,
    mainImage,
    body,
    "categories": categories[]->title
  }
`)