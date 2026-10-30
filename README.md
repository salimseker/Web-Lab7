# Assignment 7 – Online Shop (React Router, Context, Zustand)

A small multi-page online shop built with React and Vite. It loads products from the public
[DummyJSON](https://dummyjson.com) API, lets visitors filter the catalogue through the URL, shows a
detail page per product, keeps a cart that survives reloads, and protects the cart page behind a
simulated login.

## Running the project

```bash
npm install
npm run dev      # development server on http://localhost:5173
npm run build    # production build into dist/
npm run lint     # oxlint
```

**Demo account**

| Username | Password |
| --- | --- |
| `230408006@st.biruni.edu.tr` | `demo123456` |

**Libraries used:** `react`, `react-dom`, `react-router` (v8) and `zustand`. No Redux, no server-state
library, no UI kit. Since React Router v7 the old `react-router-dom` package has been merged into
`react-router`, so `BrowserRouter`, `NavLink`, `useSearchParams` etc. are all imported from `react-router`.

> **Client-side protection is a user-experience feature, not security.** `ProtectedRoute` only hides
> the cart page in the browser. Anyone can read the bundled JavaScript (including the demo credentials)
> or change the in-memory state with developer tools. See question 5 below.

---

## File organization

```
src/
├─ api/
│  ├─ productsApi.js     fetchProducts / fetchProduct – fetch + AbortSignal, non-2xx → HttpError
│  └─ authApi.js         login() – simulated 500 ms server call with one fixed demo account
├─ hooks/
│  ├─ useFetch.js        { loading, error, data } with useReducer, aborts on input change/unmount
│  └─ useLocalStorage.js useState-like hook that reads from and writes to localStorage
├─ context/
│  └─ AuthContext.jsx    AuthProvider (useReducer: LOGGED_IN / LOGGED_OUT) + useAuth()
├─ store/
│  └─ cartStore.js       Zustand cart store, selectors, localStorage persistence via subscribe
├─ components/
│  ├─ Layout.jsx         NavBar + <Outlet /> + footer, owns the theme state
│  ├─ NavBar.jsx         NavLinks, cart count, theme toggle, Login or username + Logout
│  ├─ ProductCard.jsx    one product in the grid with "Add to cart"
│  └─ ProtectedRoute.jsx redirects to /login and remembers the requested location
├─ pages/
│  ├─ Home.jsx           landing page
│  ├─ ProductList.jsx    catalogue, filters stored in the URL query string
│  ├─ ProductDetail.jsx  /products/:id, Back button, previous/next links, not-found handling
│  ├─ Cart.jsx           quantities, remove, total, clear, empty state (protected)
│  ├─ Login.jsx          controlled form, loading/error, redirect back after login
│  └─ NotFound.jsx       404 page for unmatched URLs
├─ App.jsx               route table (products routes are nested under /products)
├─ main.jsx              BrowserRouter + AuthProvider around <App />
└─ index.css             minimal styles, light/dark theme with CSS custom properties
```

### Routes

| Path | Page | Access |
| --- | --- | --- |
| `/` | Home | public |
| `/products` | ProductList (index route of `/products`) | public |
| `/products/:id` | ProductDetail (child route of `/products`) | public |
| `/cart` | Cart, wrapped in `ProtectedRoute` | signed-in users |
| `/login` | Login | public |
| `*` | NotFound | public |

All routes are children of a pathless `<Route element={<Layout />}>`, so every page, including
NotFound, is rendered inside the shared NavBar and footer through `<Outlet />`.

---

## Reasoning questions

### 1. State choices

- **Signed-in user – `AuthContext` (Context + `useReducer`).** Many distant components need it (NavBar,
  ProtectedRoute, Login), but it changes very rarely (only on login and logout), so a provider at the top
  of the tree is simple and cheap. It is kept in memory only, so a reload signs the user out, which is
  acceptable for a fake login.
- **Cart – Zustand store (`cartStore.js`).** It changes often and is read or updated from many places
  (NavBar count, every ProductCard, the detail page, the cart page). A store with selectors lets each
  component subscribe to exactly the slice it needs. The items are persisted to `localStorage` through
  `useCartStore.subscribe`.
- **Filter values – the URL query string (`?q=…&category=…`).** They describe *what the page shows*, so
  they belong in the URL: the view can be shared as a link, survives a refresh and works with the
  browser's back button. ProductList reads them with `useSearchParams`; there is no `useState` copy.
- **Product list – local state inside `ProductList`, via `useFetch`.** Only that page needs the list,
  so there is no reason to make it global. The filtered list and the category list are *derived* from it
  during render and are not stored anywhere.
- **Theme – `useLocalStorage` in `Layout`.** It is a per-browser preference that must survive reloads.
  Layout owns it because it puts the theme class on the wrapper element, and passes the value and
  toggle function to NavBar as props.

### 2. Context versus store

The user changes almost never, so the main weakness of Context (every consumer re-renders whenever the
value changes) does not matter, and a reducer with `LOGGED_IN` / `LOGGED_OUT` models it cleanly. The
cart changes on every click. If it were in Context, every consumer (the NavBar and all 100 product cards
that only need `addItem`) would re-render on every quantity change, and persistence would have to be
done in a component effect. With Zustand, the NavBar selects only `selectItemCount` (a number). I
measured this with React's `Profiler`: changing the cart without changing the count causes 0 NavBar
renders. Moving the user into Zustand would technically work, but it would give no benefit for such
rarely changing state and would drop the provider/reducer structure the assignment asks for.

### 3. Custom hooks

`useFetch` shares the **logic**: the reducer with the three states (`loading`, `error`, `data`),
creating an `AbortController`, aborting in the effect cleanup and ignoring errors caused by an abort.
It deliberately does **not** share **state**. Every call creates its own `useReducer`, so ProductList
and ProductDetail each have independent loading/error/data values, and nothing is cached between them.
The same is true for `useLocalStorage`: that is why the theme hook is called once in Layout and passed
down, because calling it again in NavBar would create a second, separate theme state.

### 4. Route parameters

The `id` from `useParams()` is always a **string** (`"3"`, not `3`). It mattered in
`ProductDetail.jsx` when building the previous/next links: `id + 1` would give `"31"`, so the id is
converted with `Number(id)` first, and the links are only shown when it is an integer (not for
`/products/abc`). It is passed to the API as a string (encoded with `encodeURIComponent`), and the cart
uses the numeric `product.id` returned by the API, never the URL string, so comparisons like
`item.id === product.id` stay correct.

### 5. Protected routes

`ProtectedRoute` runs entirely in the user's browser. The cart page's code and the demo credentials
are inside the downloaded JavaScript bundle, and the "signed-in" flag is only client-side state that
can be changed with developer tools. In this app the cart data is also stored locally, so nothing is
actually protected. Real security needs a server: it checks the credentials (hashed passwords), issues
a session (an HTTP-only cookie or a token), and checks that session on **every** API request that
returns or changes private data, such as a cart stored on the server. The client-side redirect then
remains only as a convenience for the user.

### 6. Deep links

A plain static file server looks for a file at the requested path. There is no `products/3` file in
`dist/`, so reloading `/products/3` returns **404**, and React Router never gets a chance to run. The
Vite dev server works because it has an SPA fallback: for any unknown path that is not a real file, it
serves `index.html`, the app starts, and `BrowserRouter` reads the URL and renders the right page. In
production the server needs the same rewrite rule ("serve `index.html` for every unknown path"), for
example `try_files $uri /index.html` in nginx or a `_redirects` rule on Netlify. The other option is
`HashRouter`, which keeps the route after `#` so the server never sees it.

---

## Self-study notes

**Updating one query-string parameter without losing the others.** `setSearchParams(object)` replaces
the whole query string, so changing the category would drop `q`. In the React Router docs I found that
`setSearchParams` also accepts a function that receives the current params. `updateParam` in
`ProductList.jsx` creates a copy with `new URLSearchParams(previous)`, sets or deletes only one key
(an empty value removes the key so the URL stays clean) and returns the copy, so the old object is
never mutated. It also accepts navigate options: typing in the search box uses `{ replace: true }`, so
each keystroke does not add a new history entry, while a category change does add one.

**Initialising the store from `localStorage` safely.** `localStorage` can be missing, unavailable
(`getItem`/`setItem` can throw, for example in private mode or when the storage is full) or contain
data that was edited by hand. `loadItems()` in `cartStore.js` runs once when the store is created. It
wraps reading and `JSON.parse` in `try/catch`, accepts only an array, and keeps only entries that pass
`isValidItem` (integer id, string title, finite price, integer quantity ≥ 1). Anything else falls back
to an empty cart and logs a warning instead of crashing. Saving is done outside React with
`useCartStore.subscribe((state, previousState) => …)`, and it only writes when the `items` reference
changed. Because every update is immutable, comparing references is enough to detect a change.
`useLocalStorage` uses the same `try/catch` fallback and a lazy `useState` initializer, so storage is
read only on the first render.

**Light/dark theme.** I put a `theme-light` or `theme-dark` class on the `.app` wrapper. Each class
defines the same CSS custom properties (`--color-bg`, `--color-text`, `--color-surface`, …), and the
rest of the stylesheet uses only `var(--…)`, so switching the class re-colours everything without
duplicated rules. `color-scheme: dark` makes native form controls and scrollbars dark too. On the very
first visit the initial value comes from `matchMedia('(prefers-color-scheme: dark)')`, passed as a
function so it runs only when nothing is stored. Any stored value other than `"dark"` is treated as
light.

---

## Challenges

- **Logout redirected to `/login` instead of home.** Pressing Logout on `/cart` called `logout()` and
  `navigate('/')`, but the app ended up on the login page. Reading React Router's source showed that in
  v8 `BrowserRouter` applies location changes inside `startTransition`. So the logout (an urgent update)
  rendered first, the still-mounted Cart page saw "no user", and `ProtectedRoute` redirected to `/login`.
  Wrapping both calls in one `startTransition` makes them render together (`NavBar.jsx`).
- **`useFetch` dependencies.** The hook receives its dependency list from the caller, so the linter
  cannot check it statically. I also had to decide not to include `fetchFn` itself: callers pass an
  inline arrow function, which is a new reference on every render and would cause an endless refetch
  loop. Both decisions are documented next to a scoped lint exception.
- **Stale responses.** When moving quickly from `/products/3` to `/products/4`, the first response could
  arrive after the second. Aborting in the effect cleanup and ignoring aborted requests guarantees that
  only the response for the current id is shown.
- **404 vs. "product not found".** `fetch` does not reject on HTTP errors, so `productsApi.js` throws an
  `HttpError` that keeps the status code. This lets ProductDetail show "Product … was not found" for a
  404 and a generic message for other failures, while a URL that matches no route at all shows the
  NotFound page.
- **Keeping the NavBar from re-rendering.** Selecting `state.items` in the NavBar would re-render it on
  every cart change. Selecting a derived number (`selectItemCount`) means Zustand compares two numbers,
  so the NavBar only renders when the count really changes.
