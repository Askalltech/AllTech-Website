import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default('AllTech'),
    heroImage: z.string().optional(),
    // Visible "Photo: Name" attribution link rendered over the hero image —
    // same shape/pattern as Services13PhotoCredit (src/components/services13.tsx).
    heroImageCredit: z.object({ name: z.string(), url: z.string() }).optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

const caseStudies = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    client: z.string(),
    industry: z.string(),
    services: z.array(z.string()),
    summary: z.string(),
    outcome: z.string(),
    pubDate: z.coerce.date(),
    heroImage: z.string().optional(),
    // Optional proof points:
    testimonial: z.string().optional(),        // short client quote
    testimonialAuthor: z.string().optional(),  // e.g. "IT Director, Manufacturing"
    pentestSnippet: z.string().optional(),     // sanitized pentest finding(s)
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog, caseStudies };
