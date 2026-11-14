# Rugby Australia Multi-Site Website Manager

A small Next.js application for managing multiple sports websites from a shared component library. Editors create pages, add and edit nested components, and save their content to MongoDB. Public pages render the same portable JSON using the theme of the requested site.

## Run locally

Requirements: Node.js 22 (recommended) or a compatible newer LTS version, npm, and Docker running locally (or an existing MongoDB instance).

From the repository root, install dependencies:

```bash
npm ci
```

Start a local MongoDB instance:

```bash
docker run -d --name rugby-mongo -p 127.0.0.1:27017:27017 -v rugby-mongo-data:/data/db mongo:8.0
```

If the container already exists, use `docker start rugby-mongo` instead. The named volume preserves database data across restarts. This unauthenticated database is intended for local development only.

Copy `.env.example` to `.env.local` (PowerShell: `Copy-Item .env.example .env.local`; macOS/Linux: `cp .env.example .env.local`). The local configuration is:

```env
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB=rugby_page_builder
```

For an existing MongoDB instance, use its connection string and database name instead. Keep credentials out of Git.

Seed the database and start the application:

```bash
npm run seed
npm run dev
```

The seed creates Wallabies and Wallaroos, each with its own theme and initial page content. It also creates unique indexes for site slugs and site/path pairs. Running the seed again inserts missing documents without overwriting existing edits.


| Route | Purpose |
| --- | --- |
| [Manager](http://localhost:3000/manager) | Create and edit pages |
| [Wallabies](http://localhost:3000/sites/wallabies) | Wallabies homepage |
| [Wallaroos](http://localhost:3000/sites/wallaroos) | Wallaroos homepage |
| [Home](http://localhost:3000/) | Redirects to the Wallabies homepage |

These URLs are available after starting the local application with `npm run dev`.


The manager includes a component tree with titles and counts, a property inspector, a Save Page action and a View Live Page link for saved pages.

Public pages share a responsive layout, site-specific colours and a branded not-found screen.

To create another page:

1. Select a website in the manager.
2. Enter a title and a path such as `/about`.
3. Add components and edit their properties.
4. Click **Save page**.
5. Open the public page using the View Live Page link.

The public URL is `/sites/<site-slug><path>`, for example `/sites/wallabies/about`.

The seed files define the initial pages. Pages created only through the manager are stored in the local database and are not part of a Git checkout. Additional seeded pages, if present, use the same URL pattern.

## Architecture and data model

One Next.js App Router application contains the manager and public renderer. The MongoDB Node.js driver is used directly; no external CMS or page builder is required.

| File or directory | Responsibility |
| --- | --- |
| `lib/types.ts` | Site, page, theme and component prop types |
| `lib/definitions.ts` | Editable field descriptions, default props and nesting rules |
| `lib/registry.tsx` | Maps component types to React rendering functions |
| `lib/renderer.tsx` | Recursively renders the component tree with a site theme |
| `lib/tree.ts` | Create, find, update and remove component instances |
| `lib/validation.ts` | Runtime validation using field definitions and tree rules |
| `lib/db.ts`, `lib/pages.ts` | Server-only MongoDB connection and queries |
| `components/primitives/` | Shared Button, Heading and Image |
| `components/blocks/` | Section and CardGrid |
| `components/manager/` | Interactive manager, recursive tree and generic form |
| `app/manager/` | Server-side data loading and save action |
| `app/sites/[site]/[[...path]]/page.tsx` | Server-rendered public pages and not-found handling |
| `app/not-found.tsx` | Branded 404 presentation |
| `scripts/seed.ts`, `lib/sample-data.ts` | Initial sites, themes and pages |

MongoDB contains two collections:

- `sites`: slug, name and theme.
- `pages`: siteSlug, path, title and components.

Pages are embedded trees rather than separate component documents. A unique compound index on `siteSlug` and `path` allows different sites to have the same path but prevents duplicates within one site.

The manager loads saved pages on the server and passes plain data to a Client Component. The generic form reads the selected component definition and reports updated props. Tree helpers update the selected instance by ID.

Saving sends the complete page to a Server Function, which validates the tree before inserting or replacing the document.

The public route reads MongoDB directly, independently of the manager, and resolves theme tokens during rendering.

## Page JSON format

Each component instance has a unique ID within its page, a type, props and children. Only container components accept children. Theme colours live on the site, not in the page document.

Here is an example page (MongoDB's internal `_id` is omitted):

```json
{
  "siteSlug": "wallabies",
  "path": "/about",
  "title": "About Us",
  "components": [
    {
      "id": "section-1",
      "type": "Section",
      "props": {
        "layout": "full",
        "background": "brand"
      },
      "children": [
        {
          "id": "grid-1",
          "type": "CardGrid",
          "props": {
            "title": "About Australian Rugby",
            "cards": [
              {
                "image": {
                  "url": "/rugby.svg",
                  "alt": "Rugby ball"
                },
                "heading": "Our National Teams",
                "link": {
                  "label": "Meet the Wallaroos",
                  "href": "/sites/wallaroos"
                }
              }
            ]
          },
          "children": []
        }
      ]
    }
  ]
}
```

The Section supports `full` and `two-column` layouts, `none`, `light` and `brand` backgrounds, and nested Sections.

CardGrid supports a title, a list of cards with nested image URL/alt text, a heading and an optional link object.

## Adding a component

For example, to add a simple `Hero` with a title and subtitle:

1. Create `components/blocks/Hero.tsx` with the React component. Reuse the primitives and accept the site theme where needed.

2. In `lib/types.ts`, define `HeroProps` and add `Hero: HeroProps` to `PropsByType`. The supported component names and PageNode types are derived from this mapping.

3. Add a `Hero` entry to `definitions` in `lib/definitions.ts`:

   ```ts
   Hero: {
     label: "Hero",
     acceptsChildren: false,
     defaultProps: {
       title: "Welcome",
       subtitle: ""
     },
     fields: [
       {
         name: "title",
         label: "Title",
         kind: "text"
       },
       {
         name: "subtitle",
         label: "Subtitle",
         kind: "text"
       }
     ]
   }
   ```

4. Register the render function in `lib/registry.tsx`, importing the new component. For a Hero accepting `HeroProps` and `theme: Theme`:

   ```tsx
   Hero: (props, _children, id, theme) => (
     <Hero
       key={id}
       {...props}
       theme={theme}
     />
   )
   ```

5. Run the type check, add the component in the manager, edit its props, save and verify the public page.

The manager discovers new components from `definitions` and generates their forms from the supported field kinds:

- `text`
- `select`
- `object`
- `array`

The existing recursive renderer and validator can handle this new component without a component-specific editor.

A new field kind would require extending both the generic form and validator.

## Decisions and trade-offs

### Portable data

Storing an entire page tree in one document makes it easy to load, save and render without depending on the manager.

Large pages or simultaneous editing would need more granular updates and version checks.

### Custom field descriptions

A small schema format supports the required fields without an additional schema library.

TypeScript types and runtime definitions must be kept in sync. Validation checks required fields, allowed options, nested shapes, unique node IDs and nesting rules, but does not comprehensively validate URLs or content quality.

### Component composition and themes

Small shared primitives and separate layout/content blocks keep rendering reusable.

Sites supply semantic colour tokens instead of hardcoded site colours in page data.

### Server/client separation

Database access stays on the server. The manager handles interactive state in the browser and calls a Server Function to save.

Public pages use request-time rendering so saved changes are available on refresh.

Cache Components is disabled in favour of explicit dynamic routes and straightforward not-found handling.

### Simple editor

Component IDs identify tree nodes and the editor uses immutable updates.

Saving replaces the page document. Unsaved changes are discarded when switching pages; there is no concurrent editing protection or publish workflow.

Card array items use index keys; stable IDs would be preferable for reordering.

### Scope

The manager currently loads all saved pages. At larger scale, I would query by selected site, paginate the page list, and load individual pages on demand.

Authentication, permissions, deployment, reordering, live preview and draft/publish are outside this assessment implementation.

The unauthenticated manager should not be exposed as a production administration service.

## Verification

Run the TypeScript check and production build:

```bash
npx tsc --noEmit --pretty false
npm run build
npm run start
```

Stop the development server before running the production server on the same port. Keep MongoDB running.

Manual acceptance testing covered:

- Website and page selection.
- Page creation.
- Same-path reuse across different sites.
- Duplicate-path rejection within a site.
- Adding, editing and removing nested components.
- Nested two-column Section rendering.
- Persistence after refreshing the manager.
- Public website updates after saving.
- Valid-page HTTP 200 responses.
- Missing-site and missing-page HTTP 404 responses.

The 15 core acceptance checks passed, including TypeScript, the production build (Next.js 16.4.6) and production startup.

After the UI redesign, 10 further manual regression checks passed, covering responsive layouts, editing and saving, live-page navigation, demonstration content, HTTP 404 handling, TypeScript and the production build.

These are manual checks, not an automated test suite.

For a quick end-to-end check, change a CardGrid title in the manager, save and refresh the corresponding public page.

For HTTP status checks:

```bash
curl -I http://localhost:3000/sites/wallabies
curl -I http://localhost:3000/sites/wallabies/missing-page
```

On Windows PowerShell, use `curl.exe` instead of `curl`.

Expected statuses are 200 and 404 respectively.

## Time spent and AI assistance

- Approximate time spent: 7 hours.

- AI tools: ChatGPT was used extensively for architecture planning, generating substantial portions of the implementation, debugging, test guidance and drafting README.

  Google Antigravity was used to modify the manager and public website UI, including responsive layouts, component tree presentation, image handling and the custom 404 presentation.

  I integrated the implementation locally and ran the acceptance tests, regression checks and production build.