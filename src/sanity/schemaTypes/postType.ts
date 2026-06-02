import {DocumentTextIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const postType = defineType({
  name: 'post',
  title: 'Article',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Article Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: 'articleType',
      title: 'Article Type',
      type: 'string',
      initialValue: 'internal',
      options: {
        list: [
          {title: 'NBI Hockey Article', value: 'internal'},
          {title: 'Published Elsewhere', value: 'external'},
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: 'externalUrl',
      title: 'External Article URL',
      type: 'url',
      description: 'Use this for Brock articles or articles published on another website.',
      hidden: ({parent}) => parent?.articleType !== 'external',
      validation: (rule) =>
        rule.custom((value, context) => {
          const articleType = (context.parent as {articleType?: string})?.articleType

          if (articleType === 'external' && !value) {
            return 'External articles need a URL.'
          }

          return true
        }),
    }),

    defineField({
      name: 'externalPublisher',
      title: 'External Publisher',
      type: 'string',
      description: 'Example: Brock University, The Brock Press, Substack',
      hidden: ({parent}) => parent?.articleType !== 'external',
    }),

    defineField({
      name: 'slug',
      title: 'URL Slug',
      type: 'slug',
      options: {
        source: 'title',
      },
      hidden: ({parent}) => parent?.articleType === 'external',
    }),

    defineField({
      name: 'summary',
      title: 'Article Summary',
      type: 'text',
      rows: 3,
      description: 'A short description that appears on article cards.',
    }),

    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: {type: 'author'},
    }),

    defineField({
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
        }),
      ],
    }),

    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: {type: 'category'}})],
    }),

    defineField({
      name: 'publishedAt',
      title: 'Published Date',
      type: 'datetime',
    }),

    defineField({
      name: 'body',
      title: 'Article Body',
      type: 'blockContent',
      hidden: ({parent}) => parent?.articleType === 'external',
    }),
  ],

  preview: {
    select: {
      title: 'title',
      articleType: 'articleType',
      publisher: 'externalPublisher',
      media: 'mainImage',
    },
    prepare(selection) {
      const {articleType, publisher} = selection

      return {
        ...selection,
        subtitle:
          articleType === 'external'
            ? `Published elsewhere${publisher ? `: ${publisher}` : ''}`
            : 'NBI Hockey article',
      }
    },
  },
})