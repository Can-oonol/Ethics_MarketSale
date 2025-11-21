// server.js
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 4000;

// Allow JSON bodies and cross-origin requests
app.use(cors());
app.use(express.json());

// In-memory store for purchases (reset each time you restart the server)
let purchases = [];

// Receive a new purchase
app.post("/api/purchases", (req, res) => {
  const body = req.body || {};

  const purchase = {
    id: Date.now(),
    items: body.items || [],
    totalPrice: body.totalPrice || 0,
    totalCo2: body.totalCo2 || 0,
    totalWater: body.totalWater || 0,
    createdAt: new Date().toISOString(),
  };

  purchases.push(purchase);
  console.log("New purchase:", purchase);
  res.status(201).json({ ok: true });
});

// Return all purchases (for admin table)
app.get("/api/purchases", (req, res) => {
  res.json(purchases);
});

// Return aggregated stats (for admin summary)
app.get("/api/stats", (req, res) => {
  const stats = {
    totalPurchases: purchases.length,
    totalPrice: 0,
    totalCo2: 0,
    totalWater: 0,
    perProduct: {}, // { productName: { qty, totalPrice, totalCo2, totalWater } }
  };

  for (const p of purchases) {
    stats.totalPrice += p.totalPrice;
    stats.totalCo2 += p.totalCo2;
    stats.totalWater += p.totalWater;

    for (const item of p.items || []) {
      const key = item.name;
      if (!stats.perProduct[key]) {
        stats.perProduct[key] = {
          qty: 0,
          totalPrice: 0,
          totalCo2: 0,
          totalWater: 0,
        };
      }
      stats.perProduct[key].qty += item.qty;
      stats.perProduct[key].totalPrice += item.linePrice;
      stats.perProduct[key].totalCo2 += item.lineCo2;
      stats.perProduct[key].totalWater += item.lineWater;
    }
  }

  res.json(stats);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
