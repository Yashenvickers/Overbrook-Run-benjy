import { groq } from "next-sanity";

const imageFields = groq`
  "src": asset->url,
  "alt": coalesce(alt, ""),
  credit,
  sourceNote,
  "rightsStatus": coalesce(rightsStatus, "unknown"),
  "rightsExpiry": rightsExpiry,
  "width": asset->metadata.dimensions.width,
  "height": asset->metadata.dimensions.height
`;

const articleFields = groq`
  "slug": slug.current,
  title,
  dek,
  "category": category->slug.current,
  "author": {
    "slug": author->slug.current,
    "name": author->name,
    "role": author->role
  },
  publishedAt,
  updatedAt,
  "hero": heroImage{ ${imageFields} },
  "portableBody": body[]{
    ...,
    _type == "articleImage" => { ..., "url": asset->url }
  },
  sourceLinks[]{ label, url },
  sponsorDisclosure,
  correction{ note, date },
  "tags": tags,
  featured,
  evergreen
`;

export const articlesQuery = groq`
  *[_type == "article" && defined(slug.current) && !(_id in path("drafts.**"))]
    | order(publishedAt desc) { ${articleFields} }
`;

export const articleBySlugQuery = groq`
  *[_type == "article" && slug.current == $slug][0]{ ${articleFields} }
`;

export const episodesQuery = groq`
  *[_type == "videoEpisode" && defined(slug.current)] | order(publishedAt desc) {
    "slug": slug.current,
    title,
    guest,
    description,
    youtubeId,
    externalUrl,
    "poster": poster{ ${imageFields} },
    runtime,
    publishedAt,
    "topics": coalesce(topics, []),
    sponsorDisclosure,
    transcript,
    "relatedArticleSlugs": relatedArticles[]->slug.current,
    comingSoon
  }
`;

export const eventsQuery = groq`
  *[_type == "event"] | order(start asc) {
    "id": coalesce(slug.current, _id),
    title,
    category,
    start,
    end,
    "timezone": coalesce(timezone, "America/New_York"),
    city,
    venue,
    description,
    sourceUrl,
    ticketUrl,
    ticketsAvailable,
    featured
  }
`;

export const artistsQuery = groq`
  *[_type == "artistProfile" && defined(slug.current)] | order(_createdAt desc) {
    "slug": slug.current,
    name,
    origin,
    genre,
    oneLiner,
    bio,
    "image": image{ ${imageFields} },
    links[]{ label, url },
    spotlight
  }
`;

export const breakingQuery = groq`
  *[_type == "breakingItem" && active == true] | order(_updatedAt desc) {
    "id": _id,
    text,
    href,
    active
  }
`;
