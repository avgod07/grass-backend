const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory store with seed items
let items = [
  { id: '1', name: 'First item', createdAt: new Date().toISOString() },
  { id: '2', name: 'Second item', createdAt: new Date().toISOString() },
];
let nextId = 3;

// GET /api/items – list all items
app.get('/api/items', (req, res) => {
  res.set('Content-Type', 'application/json');
  res.json(items);
});

// GET /api/items/:id – single item by id
app.get('/api/items/:id', (req, res) => {
  const item = items.find((i) => i.id === req.params.id);
  if (!item) {
    return res.status(404).set('Content-Type', 'application/json').json({ error: 'Item not found' });
  }
  res.set('Content-Type', 'application/json');
  res.json(item);
});

// POST /api/items – create item
app.post('/api/items', (req, res) => {
  const name = req.body?.name;
  if (name === undefined || name === null) {
    return res.status(400).set('Content-Type', 'application/json').json({ error: 'name is required' });
  }
  const item = {
    id: String(nextId++),
    name: String(name),
    createdAt: new Date().toISOString(),
  };
  items.push(item);
  res.status(201).set('Content-Type', 'application/json').json(item);
});

// DELETE /api/items/:id – delete item
app.delete('/api/items/:id', (req, res) => {
  const index = items.findIndex((i) => i.id === req.params.id);
  if (index === -1) {
    return res.status(404).set('Content-Type', 'application/json').json({ error: 'Item not found' });
  }
  items.splice(index, 1);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`);
});
