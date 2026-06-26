#!/usr/bin/env node

import { existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";
import { parseArgs } from "node:util";

const usage = `
Usage:
  node create-dev-post.mjs --title "<title>" --slug "<slug>" --excerpt "<excerpt>" --reading-time <minutes>

Options:
  --title          Blog post title for Prisma Post.title
  --slug           ASCII slug matching data/blog/<slug>.mdx
  --excerpt        Short SEO excerpt for Prisma Post.excerpt
  --reading-time   Integer minutes for Prisma Post.readingTime
  --dry-run        Validate inputs without connecting to the database
  --help           Show this help
`;

const { values } = parseArgs({
  options: {
    title: { type: "string" },
    slug: { type: "string" },
    excerpt: { type: "string" },
    "reading-time": { type: "string" },
    "dry-run": { type: "boolean", default: false },
    help: { type: "boolean", default: false },
  },
  allowPositionals: false,
});

if (values.help) {
  process.stdout.write(usage.trimStart());
  process.exit(0);
}

function fail(message, code = 1) {
  process.stderr.write(`Error: ${message}\n`);
  process.exit(code);
}

const title = values.title?.trim();
const slug = values.slug?.trim();
const excerpt = values.excerpt?.trim();
const readingTime = Number.parseInt(values["reading-time"] ?? "", 10);

if (!title) fail("Missing --title.");
if (!slug) fail("Missing --slug.");
if (!excerpt) fail("Missing --excerpt.");
if (!Number.isInteger(readingTime) || readingTime < 1) {
  fail("--reading-time must be a positive integer.");
}
if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
  fail("--slug must use lowercase ASCII letters/digits separated by hyphens.");
}

const projectRoot = process.cwd();
const packageJsonPath = path.join(projectRoot, "package.json");
const schemaPath = path.join(projectRoot, "prisma", "schema.prisma");
const mdxPath = path.join(projectRoot, "data", "blog", `${slug}.mdx`);

if (!existsSync(packageJsonPath) || !existsSync(schemaPath)) {
  fail("Run this script from the Phi repository root.");
}
if (!existsSync(mdxPath)) {
  fail(`Expected MDX file does not exist: data/blog/${slug}.mdx`);
}

const metadata = { title, slug, excerpt, readingTime };

if (values["dry-run"]) {
  process.stdout.write(`Validated dev post metadata for slug "${slug}".\n`);
  process.stdout.write(`${JSON.stringify(metadata, null, 2)}\n`);
  process.exit(0);
}

const requireFromProject = createRequire(packageJsonPath);

async function importFromProject(specifier) {
  const resolved = requireFromProject.resolve(specifier);
  return import(pathToFileURL(resolved).href);
}

const dotenvModule = await importFromProject("dotenv");
const dotenv = dotenvModule.default ?? dotenvModule;
dotenv.config({ path: path.join(projectRoot, ".env") });

if (!process.env.DATABASE_URL) {
  fail("DATABASE_URL is not set in the environment or project .env.");
}

const jitiModule = await importFromProject("jiti");
const createJiti =
  jitiModule.createJiti ??
  jitiModule.default?.createJiti ??
  jitiModule.default;

if (typeof createJiti !== "function") {
  fail("Could not load jiti from the project dependencies.");
}

const { PrismaPg } = await importFromProject("@prisma/adapter-pg");
const jiti = createJiti(packageJsonPath);
const clientPath = path.join(projectRoot, "generated", "prisma", "client.ts");
const { PrismaClient } = await jiti.import(clientPath);

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

try {
  const existing = await prisma.post.findUnique({
    where: { slug },
    select: { id: true, slug: true },
  });

  if (existing) {
    fail(`A dev Post row already exists for slug "${slug}".`, 2);
  }

  const post = await prisma.post.create({
    data: metadata,
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      readingTime: true,
    },
  });

  process.stdout.write(`Created dev Post row for slug "${post.slug}" with id ${post.id}.\n`);
} finally {
  await prisma.$disconnect();
}
