# How the Frontend and Backend Connect

## The big picture

```
┌─────────────────────────────────────────────────────────────────────────┐
│  BROWSER                                                                 │
│  ┌───────────────────────────────────────────────────────────────────┐   │
│  │  React app (e.g. http://localhost:5173)                            │   │
│  │                                                                    │   │
│  │  User clicks "Load items"  →  JavaScript runs  →  fetch("/api/...") │   │
│  └───────────────────────────────────────────────────────────────────┘   │
│                                    │                                      │
│                                    │  HTTP request (GET/POST/DELETE)       │
│                                    ▼                                      │
└────────────────────────────────────┼──────────────────────────────────────┘
                                     │
         ┌──────────────────────────┼──────────────────────────┐
         │  Option A: Proxy          │  Option B: Direct URL    │
         │  React dev server sends   │  fetch("http://localhost:3000/api/...")  │
         │  /api/* → localhost:3000   │  (needs CORS on backend) │
         └──────────────────────────┘                          │
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  BACKEND (this repo)  http://localhost:3000                              │
│  Express receives the request, runs the route handler, sends JSON back   │
└─────────────────────────────────────────────────────────────────────────┘
```

- **Frontend**: Runs in the browser (e.g. React on port 5173). It only has JavaScript; it can’t read your database or files directly.
- **Backend**: Runs on Node (this Express app on port 3000). It has the data (here, the in-memory `items` array) and exposes it via **HTTP**.
- **Connection**: The frontend **sends HTTP requests** (GET, POST, DELETE, etc.) to the backend’s URL and gets back **JSON**. That’s the only “connection”: HTTP over the network.

So: **frontend and backend “connect” by the frontend calling the backend’s URLs with `fetch()` (or axios, etc.) and the backend responding with JSON.**

---

## Option A: Proxy (recommended in development)

Your React app runs at `http://localhost:5173`. If the frontend does:

```js
fetch('/api/items')
```

the browser sends the request to `http://localhost:5173/api/items`. The **React dev server** (Vite/CRA) can be configured to **proxy** `/api` to the backend:

- Request: `GET http://localhost:5173/api/items`
- Dev server forwards it to: `GET http://localhost:3000/api/items`
- Backend responds with JSON
- Dev server forwards that response back to the browser

So the frontend code still uses **relative** URLs like `/api/items`; the dev server handles rewriting them to the backend.

**Vite (vite.config.js):**

```js
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
```

**Create React App (package.json):**

```json
"proxy": "http://localhost:3000"
```

No CORS setup is needed in this case because the browser thinks it’s talking to the same origin (the dev server).

---

## Option B: Direct URL (no proxy)

The frontend can call the backend directly:

```js
fetch('http://localhost:3000/api/items')
```

Then the browser sends the request **from** `http://localhost:5173` **to** `http://localhost:3000`. That’s a **cross-origin** request, so the backend must send **CORS** headers or the browser will block the response. This repo doesn’t set CORS; if you use this option, we’d add the `cors` middleware.

---

## Frontend code: calling the backend with `fetch`

The “connection” in code is: **use the same URL path and HTTP method as the backend, and send/parse JSON.**

### 1. GET list of items

```js
async function getItems() {
  const res = await fetch('/api/items');           // or 'http://localhost:3000/api/items'
  if (!res.ok) throw new Error('Failed to load');
  const data = await res.json();                  // backend sent JSON array
  return data;                                    // [{ id: '1', name: '...' }, ...]
}
```

- **Backend:** `app.get('/api/items', ...)` returns `res.json(items)`.
- **Frontend:** `fetch('/api/items')` → same path, then `res.json()` to read the body.

### 2. GET one item by id

```js
async function getItem(id) {
  const res = await fetch(`/api/items/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to load');
  return res.json();                              // { id: '1', name: '...', createdAt: '...' }
}
```

- **Backend:** `app.get('/api/items/:id', ...)` uses `req.params.id` and returns one object.
- **Frontend:** `fetch(\`/api/items/${id}\`)` builds the same URL.

### 3. POST create item

```js
async function createItem(name) {
  const res = await fetch('/api/items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),               // backend expects { name: "..." }
  });
  if (!res.ok) throw new Error('Failed to create');
  return res.json();                              // created item with id
}
```

- **Backend:** `app.post('/api/items', ...)` uses `express.json()` to parse `req.body`, reads `req.body.name`, creates the item, returns it with `res.json(item)`.
- **Frontend:** Same path and method, and sends a JSON body with `Content-Type: application/json`.

### 4. DELETE item

```js
async function deleteItem(id) {
  const res = await fetch(`/api/items/${id}`, { method: 'DELETE' });
  if (res.status === 404) return false;
  if (res.status !== 204 && !res.ok) throw new Error('Failed to delete');
  return true;                                    // 204 has no body; frontend handles both
}
```

- **Backend:** `app.delete('/api/items/:id', ...)` deletes and sends `res.status(204).send()` (no body).
- **Frontend:** Same path and method; 204 means success, no need to call `res.json()`.

---

## Summary

| Concept | What it means |
|--------|----------------|
| **Connection** | Frontend sends HTTP requests to backend URLs; backend responds with HTTP (here, JSON). No shared memory or direct function calls. |
| **Same “contract”** | Frontend and backend must agree on URLs (`/api/items`, `/api/items/:id`), methods (GET/POST/DELETE), and body shape (`{ name }` for POST). |
| **Proxy** | In dev, the React dev server can forward `/api/*` to `http://localhost:3000` so the frontend can use `fetch('/api/items')` and avoid CORS. |
| **fetch()** | Browser API to do HTTP from JavaScript: you pass URL, method, headers, body; you get back a `Response` and read `.json()` for JSON. |

So “how they connect” is: **frontend uses `fetch('/api/...')` (or the full backend URL) with the right method and body; backend runs the matching route and returns JSON.**
