
const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const USERS_FILE = path.join(__dirname, "api/auth/users.json");
const DIADIEM_FILE = path.join(__dirname, "api/diadiem/diadiem.json"); // ✅ đường dẫn đến file
const AMTHUC_FILE = path.join(__dirname, "api/amthuc/amthuc.json"); // ✅ đường dẫn đến file
const SECTIONS_FILE = path.join(__dirname, "api/sections/section.json");
const VANHOA_FILE = path.join(__dirname, "api/vanhoa/vanhoa.json");

// GET users
app.get("/api/auth", (req, res) => {
  fs.readFile(USERS_FILE, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Cannot read users" });

    let users;
    try {
      users = JSON.parse(data);
    } catch (e) {
      users = [];
    }

    if (!Array.isArray(users)) users = [];

    res.json(users);
  });
});

// POST new user
app.post("/api/auth", (req, res) => {
  const newUser = req.body;

  fs.readFile(USERS_FILE, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Cannot read users" });

    let users;
    try {
      users = JSON.parse(data);
    } catch (e) {
      users = [];
    }

    if (!Array.isArray(users)) users = [];

    if (users.find(u => u.username === newUser.username)) {
      return res.status(400).json({ error: "Username already exists" });
    }

    users.push(newUser);
    fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), (err) => {
      if (err) return res.status(500).json({ error: "Cannot save user" });
      res.json({ message: "User registered successfully" });
    });
  });
});

// GET diadiem
app.get("/api/diadiem", (req, res) => {
  fs.readFile(DIADIEM_FILE, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Cannot read diadiem" });

    let places;
    try {
      places = JSON.parse(data);
    } catch (e) {
      places = [];
    }

    if (!Array.isArray(places)) places = [];

    res.json(places);
  });
});

// GET amthuc
app.get("/api/amthuc", (req, res) => {
  fs.readFile(AMTHUC_FILE, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Cannot read amthuc" });

    let places;
    try {
      places = JSON.parse(data);
    } catch (e) {
      places = [];
    }

    if (!Array.isArray(places)) places = [];

    res.json(places);
  });
});

app.get("/api/sections", (req, res) => {
  fs.readFile(SECTIONS_FILE, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Cannot read sections" });

    let places;
    try {
      places = JSON.parse(data);
    } catch (e) {
      places = [];
    }

    if (!Array.isArray(places)) places = [];

    res.json(places);
  });
});

app.get("/api/vanhoa", (req, res) => {
  fs.readFile(VANHOA_FILE, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Cannot read sections" });

    let places;
    try {
      places = JSON.parse(data);
    } catch (e) {
      places = [];
    }

    if (!Array.isArray(places)) places = [];

    res.json(places);
  });
});

// API trả về các config an toàn cho frontend
app.get("/config", (req, res) => {
  res.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    // apiUrl: process.env.API_URL,
    // apiAuthUrl: process.env.API_AUTH_URL,
  });
});

// Backend trực tiếp gọi Gemini API bằng API_KEY
app.get("/gemini", async (req, res) => {
  try {
    const response = await fetch("https://api.gemini.com/v1/some-endpoint", {
      headers: {
        Authorization: `Bearer ${process.env.GEMINI_API_KEY}`
      }
    });
    const data = await response.json();
    res.json(data); // trả kết quả về frontend
  } catch (error) {
    res.status(500).json({ error: "Lỗi gọi Gemini API" });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
