# Ratish Nair — Personal Profile Website

A lightweight, mobile-first static portfolio based on the supplied resume.

## Live Site

- Cloudflare Pages: <https://mydemoapps-5as.pages.dev/>

## Deploy for $0

### GitHub Pages

1. Create a public GitHub repository.
2. Upload all files in this folder.
3. Go to Settings → Pages.
4. Select Deploy from branch → main → /root.
5. Open the HTTPS URL on iPhone Safari.
6. Use Share → Add to Home Screen.

No server, database, framework or build step is required.

### Cloudflare Pages

1. Push this project to GitHub.
2. In Cloudflare, go to Workers & Pages -> Create -> Pages -> Connect to Git.
3. Select repository Ratish007/MyDemoApps.
4. Use build settings: Framework preset = None, Build command = empty, Build output directory = .
5. Deploy to get a pages.dev URL.

## Included

- Responsive iPhone-first design
- Dark/light mode (dark default)
- Experience timeline
- Skills toolkit
- LinkedIn link
- Email contact

## Blog Content

`blogs.json` is the single source of truth for every post. Edit a post there,
including its title, date, summary, image path, and HTML body, then run:

```powershell
npm run build:blog
```

The build validates required fields, duplicate IDs and slugs, dates, and image
paths before generating `blog/index.html`, the post pages, and the service-worker
cache entries. Generated files under `blog/` should not be edited manually.

### How to Add a New Blog

1. Add a new object to the `posts` array in `blogs.json`.
2. Use the next unused numeric `id` and a unique lowercase hyphenated `slug`.
3. Set `date` to `YYYY-MM-DD`, then add the `title`, `summary`, and HTML `body`.
4. Add the hero image under `blog/og/` and set `ogImage` to its site path, for example `/blog/og/my-new-post.png`.
5. Run the build and review the generated page:

   ```powershell
   npm run build:blog
   ```

6. Open `http://localhost:8000/blog/my-new-post.html` locally and check the title, image, links, and mobile layout.
7. Commit `blogs.json`, the new image, and the generated output under `blog/` and `sw.js`.

The build stops with an error if required fields, IDs, slugs, dates, or image
paths are invalid.

## PWA

This site is now configured as a production-ready static PWA while staying framework-free.

## How It Works

- `manifest.webmanifest` defines install metadata, theme colors, app name, and icons.
- `sw.js` provides offline support with a versioned cache (`ratish-profile-v1`).
- Core shell assets are cached for offline startup.
- Navigation requests use network-first with cached fallback.
- iOS metadata is configured for Safari Add to Home Screen behavior.

## Files Added for PWA

- `manifest.webmanifest`
- `sw.js`
- `offline.html`
- `icons/icon-192.png`
- `icons/icon-512.png`
- `icons/icon-192-maskable.png`
- `icons/icon-512-maskable.png`
- `icons/apple-touch-icon.png`
- `icons/favicon-32.png`
- `icons/og-image-1200x630.png`

## Local Testing

Use any static HTTP server from repo root (service workers do not run on plain file paths):

```powershell
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Verify Service Worker

In browser dev tools:

1. Open Application (or Storage) panel.
2. Confirm `sw.js` is registered and controlling the page.
3. Confirm cache named `ratish-profile-v1` exists.
4. Switch to offline mode and reload to validate shell fallback.

## iPhone Install

1. Open `https://ratishnair.co.in` in Safari.
2. Tap Share.
3. Select Add to Home Screen.
4. Confirm the application name.
5. Launch it from the Home Screen.

## Cache Version Update Strategy

When core assets change (`index.html`, `styles.css`, `app.js`, icons, manifest, offline page), bump the cache name in `sw.js`:

```js
const CACHE_NAME = "ratish-profile-v2"
```

This forces old caches to be cleaned during service worker activation.

## Cloudflare Pages Deployment

Deployment remains zero-build:

- Framework preset: None
- Build command: empty
- Build output directory: `.`

After deploy, verify:

- `https://ratishnair.co.in/`
- `https://ratishnair.co.in/manifest.webmanifest`
- `https://ratishnair.co.in/sw.js`
