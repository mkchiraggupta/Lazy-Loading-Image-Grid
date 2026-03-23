# Lazy Loading Image Grid

This project is a simple, real-world implementation of an infinite image gallery.
It uses the Picsum API as a data source, renders a responsive grid, and loads more images only when the user approaches the end of the page.

The main goal is to demonstrate a clean lazy-loading flow using `IntersectionObserver` with solid UX states (loading, retry, end-of-list).

## What This Project Does

- Shows a responsive grid of images.
- Fetches image data page by page from the Picsum API.
- Loads the next batch automatically while scrolling.
- Lets you open a full image preview in a modal.
- Avoids duplicate images in the UI.
- Handles fetch failures with a retry option.

## How It Works (Step by Step)

1. On initial render, the app requests the first page of image metadata.
2. Images are displayed in a CSS grid with lazy loading enabled.
3. A small hidden sentinel element is placed at the bottom of the page.
4. `IntersectionObserver` watches that sentinel.
5. When the sentinel enters the viewport, the app increments the page number.
6. A new API request is made and results are appended to existing images.
7. If the API returns no items, the app marks the list as finished (`hasMore = false`).

## Why `IntersectionObserver` Here?

Using `IntersectionObserver` is lighter and cleaner than manual scroll event math.
It lets the browser tell us when the user is near the end, which helps keep scrolling smooth and avoids unnecessary work.

## Tech Stack

- Next.js 15 (App Router)
- React 19
- TypeScript
- CSS
- [Picsum Photos API](https://picsum.photos/)

## Project Structure

```text
src/app/
  layout.tsx      # App metadata and root layout
  page.tsx        # Image fetching + infinite scroll logic
  ImageGrid.css   # Gallery and UI styles
  globals.css     # Global app styles
```

## Run Locally

1) Install dependencies:

```bash
npm install
```

2) Start the dev server:

```bash
npm run dev
```

3) Open:

[http://localhost:3000](http://localhost:3000)

## NPM Scripts

- `npm run dev` - start development server
- `npm run build` - create production build
- `npm run start` - run production build
- `npm run lint` - run lint checks

## Notes for Production

- Images currently come from an external domain (`picsum.photos`).
- The app uses `next/image` with `unoptimized` for compatibility out of the box.
- If you want full Next.js image optimization, add `images.remotePatterns` in `next.config.ts` and remove `unoptimized` from the image component.
