#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

// Read blogs.json
const blogsPath = path.join(__dirname, "blogs.json")
const blogsData = JSON.parse(fs.readFileSync(blogsPath, "utf-8"))

function validateBlogs(data) {
  if (!data || !Array.isArray(data.posts) || data.posts.length === 0) {
    throw new Error("blogs.json must contain a non-empty posts array")
  }

  const ids = new Set()
  const slugs = new Set()
  const requiredFields = [
    "id",
    "date",
    "slug",
    "title",
    "summary",
    "ogImage",
    "body",
  ]

  data.posts.forEach((post, index) => {
    requiredFields.forEach((field) => {
      if (typeof post[field] !== "string" && field !== "id") {
        throw new Error(`Post ${index + 1} is missing string field: ${field}`)
      }
    })

    if (!Number.isInteger(post.id) || ids.has(post.id)) {
      throw new Error(`Post ${index + 1} has a missing or duplicate numeric id`)
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.slug) || slugs.has(post.slug)) {
      throw new Error(
        `Post ${index + 1} has an invalid or duplicate slug: ${post.slug}`,
      )
    }
    if (Number.isNaN(Date.parse(`${post.date}T00:00:00Z`))) {
      throw new Error(`Post ${index + 1} has an invalid date: ${post.date}`)
    }
    if (
      !post.ogImage.startsWith("/") ||
      !fs.existsSync(path.join(__dirname, post.ogImage))
    ) {
      throw new Error(
        `Post ${index + 1} references a missing image: ${post.ogImage}`,
      )
    }

    ids.add(post.id)
    slugs.add(post.slug)
  })
}

validateBlogs(blogsData)

// Sort posts by date (most recent first)
const posts = blogsData.posts.sort(
  (a, b) => new Date(b.date) - new Date(a.date) || b.id - a.id,
)

// Ensure blog directory exists
const blogDir = path.join(__dirname, "blog")
if (!fs.existsSync(blogDir)) {
  fs.mkdirSync(blogDir, { recursive: true })
}

// Helper to format date for display
function formatDate(dateStr) {
  const date = new Date(dateStr + "T00:00:00Z")
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

// Helper to escape HTML
function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}

// Template for individual post page
function postPageTemplate(post, allPosts) {
  const currentIndex = allPosts.findIndex((p) => p.slug === post.slug)
  const prevPost =
    currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null
  const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null

  return `<!doctype html>
<html lang="en">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="#08111f">
  <meta name="author" content="Ratish Nair">
  <meta name="description" content="${escapeHtml(post.summary)}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${escapeHtml(post.title)}">
  <meta property="og:description" content="${escapeHtml(post.summary)}">
  <meta property="og:url" content="https://ratishnair.co.in/blog/${post.slug}.html">
  <meta property="og:image" content="https://ratishnair.co.in${post.ogImage}">
  <meta property="og:image:alt" content="${escapeHtml(post.title)}">
  <meta property="article:published_time" content="${post.date}">
  <meta property="article:author" content="Ratish Nair">
  <link rel="manifest" href="/manifest.webmanifest">
  <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">
  <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32.png">
  <link rel="icon" href="/icons/icon-192.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/styles.css">
  <title>${escapeHtml(post.title)} | Ratish Nair</title>
</head>

<body>
  <header class="nav">
    <a class="brand" href="/">RN</a>
    <nav aria-label="Primary">
      <a href="/#about">About</a>
      <a href="/#experience">Experience</a>
      <a href="/#skills">Skills</a>
      <a href="/blog/">Blog</a>
      <a href="/#contact">Contact</a>
    </nav>
    <button id="theme" class="theme-btn" type="button" aria-label="Toggle dark mode">◐</button>
  </header>

  <main id="top">
    <article class="blog-post">
      <div class="blog-header">
        <img src="${post.ogImage}" alt="${escapeHtml(post.title)}" class="blog-hero-image" loading="lazy">
        <p class="blog-meta">${formatDate(post.date)} · ${post.title}</p>
        <h1>${escapeHtml(post.title)}</h1>
        <p class="blog-summary">${escapeHtml(post.summary)}</p>
      </div>
      <div class="blog-content">
        ${post.body}
      </div>
      <div class="blog-nav">
        ${nextPost ? `<a class="blog-nav-prev" href="/blog/${nextPost.slug}.html">← ${escapeHtml(nextPost.title)}</a>` : "<div></div>"}
        <a class="blog-nav-home" href="/blog/">Back to Blog</a>
        ${prevPost ? `<a class="blog-nav-next" href="/blog/${prevPost.slug}.html">${escapeHtml(prevPost.title)} →</a>` : "<div></div>"}
      </div>
    </article>
  </main>

  <footer>© <span id="year"></span> Ratish Nair</footer>
  <script src="/app.js"></script>
</body>

</html>`
}

// Template for blog landing page
function blogLandingTemplate(allPosts) {
  const recentPost = allPosts[0]
  const olderPosts = allPosts.slice(1)

  return `<!doctype html>
<html lang="en">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="#08111f">
  <meta name="author" content="Ratish Nair">
  <meta name="description" content="Thoughts on .NET, microservices, healthcare tech, and AI-assisted development.">
  <meta property="og:type" content="website">
  <meta property="og:title" content="Blog | Ratish Nair">
  <meta property="og:description" content="Thoughts on .NET, microservices, healthcare tech, and AI-assisted development.">
  <meta property="og:url" content="https://ratishnair.co.in/blog/">
  <link rel="manifest" href="/manifest.webmanifest">
  <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">
  <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32.png">
  <link rel="icon" href="/icons/icon-192.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/styles.css">
  <title>Blog | Ratish Nair</title>
</head>

<body>
  <header class="nav">
    <a class="brand" href="/">RN</a>
    <nav aria-label="Primary">
      <a href="/#about">About</a>
      <a href="/#experience">Experience</a>
      <a href="/#skills">Skills</a>
      <a href="/blog/">Blog</a>
      <a href="/#contact">Contact</a>
    </nav>
    <button id="theme" class="theme-btn" type="button" aria-label="Toggle dark mode">◐</button>
  </header>

  <main id="top">
    <section class="hero">
      <div class="hero-copy">
        <p class="kicker">THOUGHTS · ARCHITECTURE · HEALTHCARE · AI</p>
        <h1>Writing about what I build.</h1>
        <p class="lead">Microservices, .NET, observability, spec-driven development, and the craft of building systems that last.</p>
      </div>
    </section>

    <section class="section">
      <p class="section-label">LATEST</p>
      <article class="blog-preview-featured">
        <div class="blog-preview-meta">${formatDate(recentPost.date)}</div>
        <h2><a href="/blog/${recentPost.slug}.html">${escapeHtml(recentPost.title)}</a></h2>
        <p class="blog-preview-summary">${escapeHtml(recentPost.summary)}</p>
        <a class="btn secondary" href="/blog/${recentPost.slug}.html">Read more →</a>
      </article>
    </section>

    ${
      olderPosts.length > 0
        ? `
    <section class="section">
      <p class="section-label">ARCHIVE</p>
      <div class="blog-list">
        ${olderPosts
          .map(
            (post) => `
        <article class="blog-list-item">
          <div class="blog-preview-meta">${formatDate(post.date)}</div>
          <h3><a href="/blog/${post.slug}.html">${escapeHtml(post.title)}</a></h3>
          <p>${escapeHtml(post.summary)}</p>
        </article>
        `,
          )
          .join("")}
      </div>
    </section>
    `
        : ""
    }
  </main>

  <footer>© <span id="year"></span> Ratish Nair</footer>
  <script src="/app.js"></script>
</body>

</html>`
}

// Generate blog index page
console.log("📝 Generating blog landing page...")
const indexHtml = blogLandingTemplate(posts)
fs.writeFileSync(path.join(blogDir, "index.html"), indexHtml)

// Generate individual post pages
console.log(`📝 Generating ${posts.length} blog post pages...`)
posts.forEach((post) => {
  const postHtml = postPageTemplate(post, posts)
  fs.writeFileSync(path.join(blogDir, `${post.slug}.html`), postHtml)
  console.log(`   ✓ blog/${post.slug}.html`)
})

// Update service worker with blog posts
console.log("🔧 Updating service worker cache...")
const swPath = path.join(__dirname, "sw.js")
let swContent = fs.readFileSync(swPath, "utf-8")

// Generate blog asset paths
const blogAssets = [
  "/blog/",
  "/blog/index.html",
  ...posts.map((p) => `/blog/${p.slug}.html`),
  ...posts.map((p) => p.ogImage),
]

// Find the CORE_ASSETS array and update it
const coreAssetsMatch = swContent.match(/const CORE_ASSETS = \[([\s\S]*?)\]/)
if (coreAssetsMatch) {
  const existingAssets = coreAssetsMatch[1]
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && line !== ",")
    .map((line) => line.replace(/[",]/g, "").trim())
    .filter((asset) => asset && !asset.startsWith("/blog"))

  const allAssets = [...existingAssets, ...blogAssets]
  const formattedAssets = allAssets.map((asset) => `  "${asset}"`).join(",\n")

  const newCoreAssets = `const CORE_ASSETS = [\n${formattedAssets},\n]`
  swContent = swContent.replace(coreAssetsMatch[0], newCoreAssets)

  fs.writeFileSync(swPath, swContent)
  console.log(`   ✓ Added ${blogAssets.length} blog paths to service worker`)
}

console.log("\n✨ Blog build complete!")
console.log(`   📍 Landing page: /blog/`)
console.log(
  `   📍 Posts: ${posts.map((p) => `/blog/${p.slug}.html`).join(", ")}`,
)
