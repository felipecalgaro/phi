import { env } from "./env";
import type { Metadata } from "next";

export const SITE_NAME = "Guide to Studienkolleg";
export const SITE_URL = new URL(env.NEXT_PUBLIC_URL);
export const SITE_ORIGIN = SITE_URL.origin;
export const DEFAULT_DESCRIPTION =
  "Tailor-made support from a former Studienkolleg student to your admission.";
export const DEFAULT_IMAGE_PATH = "/guide.png";
export const SITE_LOGO_PATH = "/logo.svg";

export const AUTHOR_NAME = "Felipe Calgaro";
export const AUTHOR_PATH = "/blog/author";
export const AUTHOR_URL = absoluteUrl(AUTHOR_PATH);

export const HOME_PATH = "/";
export const COURSE_PATH = "/acing-aufnahmetest";
export const EXERCISES_PATH = "/exercises";
export const MATH_EXERCISES_PATH = "/exercises/math";
export const C_TEST_EXERCISES_PATH = "/exercises/c-test";

export const HOME_DESCRIPTION =
  "Personalized Studienkolleg roadmap, Aufnahmetest preparation, practice exercises, and practical guides for international students applying to Germany.";

export const COURSE_DESCRIPTION =
  "A practical Studienkolleg Aufnahmetest preparation course with exam strategy, math and German guidance, mock tests, community support, and private guidance.";

export const EXERCISES_DESCRIPTION =
  "Free Studienkolleg Aufnahmetest practice exercises, including math problems and C-Tests from real entrance exam preparation scenarios.";

export const MATH_EXERCISES_DESCRIPTION =
  "Practice math exercises for the Studienkolleg Aufnahmetest, including algebra, functions, geometry, and exam-style problem solving.";

export const C_TEST_EXERCISES_DESCRIPTION =
  "Practice German C-Tests for the Studienkolleg Aufnahmetest with searchable entrance exam preparation exercises.";

export const COURSE_IMAGE_PATH = "/aat.png";
export const EXERCISES_IMAGE_PATH = "/book-germany.png";
export const BLOG_IMAGE_PATH = "/blog-posts.png";
export const AUTHOR_IMAGE_PATH = "/me.png";

export const SITE_KEYWORDS = [
  "Studienkolleg",
  "Aufnahmetest",
  "study in Germany",
  "German university admission",
  "international students Germany",
  "Studienkolleg roadmap",
  "Studienkolleg preparation",
];

export const COURSE_KEYWORDS = [
  "Acing Aufnahmetest",
  "Aufnahmetest course",
  "Studienkolleg entrance exam",
  "Studienkolleg math preparation",
  "Studienkolleg C-Test preparation",
  "Aufnahmetest mock test",
];

export const EXERCISES_KEYWORDS = [
  "Aufnahmetest exercises",
  "Studienkolleg exercises",
  "Aufnahmetest math exercises",
  "C-Test exercises",
  "Studienkolleg practice",
];

export const BLOG_DESCRIPTION =
  "Practical Studienkolleg guides for international students applying to Germany, preparing for the Aufnahmetest, and planning their admission journey.";

export const BLOG_KEYWORDS = [
  "Studienkolleg",
  "Aufnahmetest",
  "Feststellungsprufung",
  "study in Germany",
  "German university admission",
  "international students Germany",
];

const ORGANIZATION_ID = absoluteUrl("/#organization");
const WEBSITE_ID = absoluteUrl("/#website");

type OpenGraphImageInput = {
  path: string;
  alt: string;
  width?: number;
  height?: number;
};

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  image?: OpenGraphImageInput;
  robots?: Metadata["robots"];
};

type BreadcrumbItem = {
  name: string;
  path: string;
};

type JsonLdNode = Record<string, unknown>;

export const NO_INDEX_FOLLOW: Metadata["robots"] = {
  index: false,
  follow: true,
};

export const NO_INDEX_NO_FOLLOW: Metadata["robots"] = {
  index: false,
  follow: false,
};

export function absoluteUrl(path: string) {
  return new URL(path, SITE_URL).toString();
}

export function createPageMetadata({
  title,
  description,
  path,
  keywords,
  image,
  robots,
}: PageMetadataInput): Metadata {
  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title,
      description,
      url: path,
      images: image
        ? [
            {
              url: image.path,
              width: image.width,
              height: image.height,
              alt: image.alt,
            },
          ]
        : undefined,
    },
    robots,
  };
}

export function stringifyJsonLd(jsonLd: unknown) {
  return JSON.stringify(jsonLd).replace(/</g, "\\u003c");
}

export function createJsonLdGraph(nodes: JsonLdNode[]) {
  return {
    "@context": "https://schema.org",
    "@graph": nodes,
  };
}

export function createOrganizationJsonLd(): JsonLdNode {
  return {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: SITE_NAME,
    url: SITE_ORIGIN,
    logo: absoluteUrl(SITE_LOGO_PATH),
    founder: {
      "@type": "Person",
      name: AUTHOR_NAME,
      url: AUTHOR_URL,
    },
  };
}

export function createWebSiteJsonLd(): JsonLdNode {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: SITE_NAME,
    url: SITE_ORIGIN,
    description: HOME_DESCRIPTION,
    publisher: {
      "@id": ORGANIZATION_ID,
    },
    inLanguage: "en",
  };
}

export function createWebPageJsonLd({
  path,
  title,
  description,
  imagePath,
}: {
  path: string;
  title: string;
  description: string;
  imagePath?: string;
}): JsonLdNode {
  const pageUrl = absoluteUrl(path);

  return {
    "@type": "WebPage",
    "@id": absoluteUrl(`${path}#webpage`),
    url: pageUrl,
    name: title,
    description,
    isPartOf: {
      "@id": WEBSITE_ID,
    },
    publisher: {
      "@id": ORGANIZATION_ID,
    },
    primaryImageOfPage: imagePath
      ? {
          "@type": "ImageObject",
          url: absoluteUrl(imagePath),
        }
      : undefined,
    inLanguage: "en",
  };
}

export function createBreadcrumbJsonLd(items: BreadcrumbItem[]): JsonLdNode {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function createCourseJsonLd(): JsonLdNode[] {
  const offer = {
    "@type": "Offer",
    price: "19",
    priceCurrency: "EUR",
    availability: "https://schema.org/InStock",
    url: absoluteUrl(COURSE_PATH),
  };

  return [
    {
      "@type": "Course",
      "@id": absoluteUrl(`${COURSE_PATH}#course`),
      name: "Acing Aufnahmetest",
      description: COURSE_DESCRIPTION,
      url: absoluteUrl(COURSE_PATH),
      image: absoluteUrl(COURSE_IMAGE_PATH),
      provider: {
        "@id": ORGANIZATION_ID,
      },
      offers: offer,
      inLanguage: "en",
    },
    {
      "@type": "Product",
      "@id": absoluteUrl(`${COURSE_PATH}#product`),
      name: "Acing Aufnahmetest",
      description: COURSE_DESCRIPTION,
      image: absoluteUrl(COURSE_IMAGE_PATH),
      brand: {
        "@id": ORGANIZATION_ID,
      },
      offers: offer,
    },
  ];
}

export function createCollectionPageJsonLd({
  path,
  title,
  description,
  itemCount,
  items,
}: {
  path: string;
  title: string;
  description: string;
  itemCount?: number;
  items?: BreadcrumbItem[];
}): JsonLdNode[] {
  const pageUrl = absoluteUrl(path);
  const itemListId = absoluteUrl(`${path}#itemlist`);

  return [
    {
      "@type": "CollectionPage",
      "@id": absoluteUrl(`${path}#collection`),
      url: pageUrl,
      name: title,
      description,
      isPartOf: {
        "@id": WEBSITE_ID,
      },
      mainEntity: {
        "@id": itemListId,
      },
      inLanguage: "en",
    },
    {
      "@type": "ItemList",
      "@id": itemListId,
      name: title,
      numberOfItems: itemCount ?? items?.length,
      itemListElement: items?.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        url: absoluteUrl(item.path),
      })),
    },
  ];
}

export function blogPostPath(slug: string) {
  return `/blog/posts/${slug}`;
}

export function blogPostUrl(slug: string) {
  return absoluteUrl(blogPostPath(slug));
}

export function blogPostImagePath(slug: string) {
  return `/blog-images/${slug}.png`;
}

export function blogPostImageUrl(slug: string) {
  return absoluteUrl(blogPostImagePath(slug));
}

export function blogPostImageAlt(title: string) {
  return `Illustration for ${title}`;
}

export function getLastModifiedDate(createdAt: Date, updatedAt: Date) {
  return updatedAt.getTime() > createdAt.getTime() ? updatedAt : createdAt;
}
