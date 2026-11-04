const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth.routes");
const orderRoutes = require("./routes/order.routes");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Khai báo Routes
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);

app.get("/", (req, res) => {
  res.send("Monolithic E-commerce API is running successfully!");
});

app.listen(PORT, () => {
  console.log(`Server đang chạy tại cổng http://localhost:${PORT}`);
});
