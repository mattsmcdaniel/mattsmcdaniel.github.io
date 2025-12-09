import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const writing = defineCollection({
  loader: glob({
    pattern: "**/[^_]*.md",
    base: "./src/writing"
  }),
  schema: z.object({
    title: z.string(),
    pubDate: z.date(),
  })
});

export const collections = { writing };
