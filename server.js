const express = require("express");
const cors = require("cors");


const authRoutes = require("./routes/auth");
const secureRoutes = require("./routes/secure");
const publicRoutes = require("./routes/public"); // 👈 import

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware chung
app.use(
  cors({
    origin: "https://lhtrungtrung87864.github.io",
    credentials: true,
  })
);
app.use(express.json());

// Mount routers
app.use("/api/auth", authRoutes);
app.use("/api/secure", secureRoutes);
app.use("/api", publicRoutes); // 👈 tất cả JSON public

// Config endpoint cho frontend
app.get("/config", (req, res) => {
  res.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
