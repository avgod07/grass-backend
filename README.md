# Grass Backend

Minimal REST API for items. Used by a React frontend that proxies `/api` to `http://localhost:3000`.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/items` | List all items |
| GET | `/api/items/:id` | Get one item by id |
| POST | `/api/items` | Create item (body: `{ "name": "..." }`) |
| DELETE | `/api/items/:id` | Delete item (returns 204) |

All responses use `Content-Type: application/json` except DELETE (204 No Content).

## Setup

```bash
npm install
npm start
```

Server runs at **http://localhost:3000**. Two seed items exist so `GET /api/items` and `GET /api/items/1` work immediately.

## Example

```bash
# List
curl http://localhost:3000/api/items

# Get one
curl http://localhost:3000/api/items/1

# Create
curl -X POST http://localhost:3000/api/items -H "Content-Type: application/json" -d '{"name":"New item"}'

# Delete
curl -X DELETE http://localhost:3000/api/items/1
```
# grass-backend
