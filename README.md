# Toyota GR Supra Mk5 Interactive Portfolio Concept

Unofficial cinematic single-page portfolio concept for the Toyota GR Supra Mk5. It demonstrates scroll-controlled image-sequence storytelling, responsive frontend engineering, accessibility, reduced-motion support, form validation, Supabase storage and Resend email integration.

This is not an official Toyota website, dealership, configurator, reservation platform or booking system. Toyota, GR Supra and related names, logos and trademarks belong to their respective owners.

## Technology Stack

- Next.js App Router, React and TypeScript
- Tailwind CSS plus custom CSS for the cinematic visual system
- GSAP ScrollTrigger for the pinned sequence
- Lenis for smooth scrolling when motion is enabled
- HTML5 Canvas image-sequence rendering
- React Hook Form and Zod validation
- Supabase server-side inserts
- Resend email delivery abstraction
- Lucide React icons
- Next.js Metadata API, sitemap, robots and manifest

## Install

```bash
npm install
npm run dev
```

Development server:

```bash
npm run dev
```

Production:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run start
```

## Asset Preparation

The source archive is available at the canonical project path:

```text
assets/jpg-sequence.zip
```

The original lower-resolution archive was extracted into `public/frames` and kept as a reference copy. The active canvas source is the user-supplied high-quality 1920x1080 sequence, normalized into:

```text
public/frames-hq/frame_0001.jpg
public/frames-hq/frame_0002.jpg
...
public/frames-hq/frame_0264.jpg
```

Legacy reference frames remain available at:

```text
public/frames/frame_0001.jpg
public/frames/frame_0002.jpg
...
public/frames/frame_0264.jpg
```

Commands:

```bash
npm run frames:extract
npm run frames:rename
npm run frames:validate
npm run frames:enhance
npm run frames:manifest
```

Useful options:

```bash
npm run frames:extract -- --zip C:\path\to\jpg-sequence.zip
npm run frames:rename -- --source work\extracted-frames --overwrite
npm run frames:validate -- --dir public\frames-hq
npm run frames:enhance -- --source public\frames-hq --dest public\frames-enhanced
```

The scripts copy or extract files and avoid deleting originals. `frames:validate` checks the 264 expected names, opens each JPEG header and verifies common dimensions.
`frames:enhance` creates a sharper 1920x1080 fallback sequence at `public/frames-enhanced`. The canvas renderer uses `FRAME_BASE_PATH` in `config/scenes.ts`; it is currently pointed at the higher-quality uploaded sequence in `public/frames-hq`.

## How The Sequence Works

`ScrollImageSequence` pins a fullscreen stage with GSAP ScrollTrigger for `1300vh`. Scroll progress maps from `0..1` to frames `1..264`, and the canvas draws the nearest loaded frame. Scrolling backward naturally moves backward through the image sequence.

Frame URLs are generated programmatically:

```ts
const getFrameUrl = (frame: number) =>
  `/frames-hq/frame_${String(frame).padStart(4, "0")}.jpg`;
```

Scene ranges live in `config/scenes.ts`. Frame math and navigation helpers live in `lib/frames.ts` and `lib/scene-progress.ts`.

## Scene, Scroll And Crop Configuration

- Scene ranges: `config/scenes.ts`
- Scroll length: `SCROLL_LENGTH_VH` in `config/scenes.ts`
- Canvas object-position controls: each scene's `position` map in `config/scenes.ts`
- Canvas cover math: `lib/canvas.ts`

The canvas preserves the 16:9 frame ratio and uses object-fit cover style drawing. Mobile scene crop positions are centralized and can be tuned after inspecting the actual frames.

## Preloading Strategy

The staged loader:

1. Loads frames 1-24 as critical opening frames.
2. Loads scene anchors plus neighboring boundary frames.
3. Loads every third frame across the sequence.
4. Loads remaining frames during idle time in small batches.

It tracks requested, loading, loaded and failed frames, retries failed requests a limited number of times, and never clears the canvas when the target frame is unavailable.
Enhanced 1080p frames are larger, so the runtime trims distant decoded images from the cache while keeping opening frames and scene boundaries available.

## Sound

The header sound control starts an opt-in procedural Web Audio layer after a click or tap. It creates a restrained engine-style hum and road texture that subtly changes with sequence progress. The site never autoplays sound, and reduced-motion/static mode stops it.

## Reduced Motion

The site respects `prefers-reduced-motion: reduce` and includes a header control for local motion preference. Reduced motion disables Lenis and the 900vh pinned sequence, then presents representative static scene sections with the same copy, navigation, configuration and enquiry form.

## Environment Variables

Create `.env.local` from `.env.example`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
ENQUIRY_NOTIFICATION_EMAIL=
NEXT_PUBLIC_SITE_URL=
```

Do not expose `SUPABASE_SERVICE_ROLE_KEY` to client code.

## Supabase Setup

Run the SQL in:

```text
supabase/migrations/001_create_enquiries.sql
```

The API route `app/api/enquiries/route.ts` validates the payload again on the server, applies honeypot protection, performs a basic in-memory throttle, stores the submission with the service-role key and records user agent/referrer headers.

When Supabase credentials are missing, the API returns a clear `503` and the form does not show success.

## Resend Setup

Set `RESEND_API_KEY` and `ENQUIRY_NOTIFICATION_EMAIL`. After a successful database insert, the API sends:

- A confirmation email to the visitor.
- A notification email to the configured administrator.

Missing email credentials do not fail a stored database submission. The API logs a non-sensitive development warning.

## Deployment

The project is ready for Vercel deployment after frames and environment variables are supplied.

1. Upload the 264 frames to `public/frames-hq`.
2. Configure Supabase and Resend environment variables.
3. Set `NEXT_PUBLIC_SITE_URL` to the production origin.
4. Run `npm run build`.
5. Deploy the Next.js app.

## Testing

Automated tests cover:

- `getFrameUrl`
- progress-to-frame and frame-to-progress calculations
- scroll-position frame calculations
- scene activation and scene progress
- enquiry schema, consent, phone and date validation

Manual QA plan:

- Preloader success and retry state
- Scrolling forward and backward
- Scene navigation and active nav state
- Replay Experience
- Mobile navigation focus trap and Escape close
- Reduced-motion mode
- Configuration controls with mouse, keyboard and touch
- Form validation, server errors and Supabase success path
- Missing frames and slow network behavior
- Canvas unsupported fallback
- Viewports: 320, 375, 390, 430, 768, 1024, 1280, 1440 and 1920 px
- Chrome, Edge, Safari, Chrome Android, Safari iPhone, tablet portrait and tablet landscape

## Known Limitations

- The final frame opens correctly but visually returns to a rear studio view; the road-away launch sequence appears in the late-frame range around frames 225-258.
- The active sequence now uses the supplied 1920x1080 frames. True native 4K clarity would require a 4K source sequence.
- Supabase and Resend require real credentials before live submissions and emails can succeed.
- The sound layer is procedural because no dedicated audio files were supplied.

## Trademark Disclaimer

Unofficial portfolio project. Not affiliated with or endorsed by Toyota Motor Corporation. Toyota, GR Supra and related trademarks belong to their respective owners.
