const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const categoryNames = ["Romantic", "Wedding", "Jazz", "Instrumental", "R&B", "Pop"];

const samples = [
  {
    title: "Perfect",
    artist: "Ed Sheeran",
    category: "Romantic",
    youtubeUrl: "https://www.youtube.com/watch?v=2Vv-BfVoq4g",
    duration: 263,
    tags: ["romantic", "wedding", "first dance"]
  },
  {
    title: "Marry You",
    artist: "Bruno Mars",
    category: "Wedding",
    youtubeUrl: "https://youtu.be/dElRVQFqj-k",
    duration: 230,
    tags: ["wedding", "party", "entrance"]
  },
  {
    title: "All of Me",
    artist: "John Legend",
    category: "Romantic",
    youtubeUrl: "https://www.youtube.com/watch?v=450p7goxZqg",
    duration: 270,
    tags: ["romantic", "dinner"]
  },
  {
    title: "What a Wonderful World",
    artist: "Louis Armstrong",
    category: "Jazz",
    youtubeUrl: "https://www.youtube.com/watch?v=VqhCQZaH4Vs",
    duration: 140,
    tags: ["jazz", "background"]
  }
];

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function extractYouTubeVideoId(input) {
  const pattern = /^[a-zA-Z0-9_-]{11}$/;
  try {
    const url = new URL(input);
    const host = url.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = url.pathname.slice(1).split("/")[0];
      return pattern.test(id) ? id : null;
    }
    if (host === "youtube.com" || host === "m.youtube.com") {
      const watchId = url.searchParams.get("v");
      if (watchId && pattern.test(watchId)) return watchId;
      const parts = url.pathname.split("/").filter(Boolean);
      const id = parts[0] === "embed" || parts[0] === "shorts" ? parts[1] : null;
      return id && pattern.test(id) ? id : null;
    }
  } catch {
    return null;
  }
  return null;
}

function youtubeThumbnail(videoId) {
  return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
}

async function main() {
  for (const name of categoryNames) {
    await prisma.category.upsert({
      where: { slug: slugify(name) },
      update: {},
      create: { name, slug: slugify(name) }
    });
  }

  await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: { email: "demo@example.com", name: "Demo User" }
  });

  for (const sample of samples) {
    const category = await prisma.category.findUniqueOrThrow({ where: { slug: slugify(sample.category) } });
    const youtubeVideoId = extractYouTubeVideoId(sample.youtubeUrl);
    await prisma.music.upsert({
      where: { id: `seed-${slugify(sample.title)}` },
      update: {},
      create: {
        id: `seed-${slugify(sample.title)}`,
        title: sample.title,
        artist: sample.artist,
        sourceType: "YOUTUBE",
        youtubeUrl: sample.youtubeUrl,
        youtubeVideoId,
        coverUrl: youtubeThumbnail(youtubeVideoId),
        duration: sample.duration,
        tags: sample.tags,
        categoryId: category.id
      }
    });
  }

  await prisma.playlist.upsert({
    where: { id: "seed-wedding-dinner" },
    update: {},
    create: {
      id: "seed-wedding-dinner",
      name: "Wedding Dinner Playlist",
      description: "Soft tracks for dinner ambience."
    }
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
