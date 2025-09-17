const rateLimit = require("express-rate-limit");
const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const app = express();
app.use(cors({
  origin: "https://lhtrungtrung87864.github.io/website_react_DongThap", 
  credentials: true
}));
app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;
const SECRET = process.env.JWT_SECRET || "supersecret";

// ✅ Admin giữ nguyên trong code
const ADMINS = [
  { username: "lhtrungAdmin", password: "trung", fullname: "Admin", role: "admin" }
];

// ✅ User lấy từ file
const USERS_FILE = path.join(__dirname, "api/auth/users.json");

// 🔒 Rate limit login
const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 phút
  max: 5,              // tối đa 5 lần thử
  message: "Quá nhiều lần đăng nhập, vui lòng thử lại sau."
});

// 🔑 Login
app.post("/auth/login", loginLimiter, (req, res) => {
  const { username, password } = req.body;

  // đọc user trong file
  let fileUsers = [];
  try {
    const data = fs.readFileSync(USERS_FILE, "utf8");
    fileUsers = JSON.parse(data);
  } catch (e) {
    fileUsers = [];
  }

  // gộp admin + users
  const allUsers = [...ADMINS, ...fileUsers];

  const user = allUsers.find(u => u.username === username && u.password === password);

  if (!user) return res.status(401).json({ error: "Sai username hoặc password" });

  // phát token
  const token = jwt.sign(
    { username: user.username, role: user.role },
    SECRET,
    { expiresIn: "1h" }
  );

  res.json({
    token,
    user: {
      username: user.username,
      fullname: user.fullname,
      role: user.role
    }
  });
});

// 📝 Register user mới (chỉ lưu vào file)
app.post("/api/auth/register", (req, res) => {
  const newUser = req.body;

  let users = [];
  try {
    const data = fs.readFileSync(USERS_FILE, "utf8");
    users = JSON.parse(data);
  } catch (e) {
    users = [];
  }

  if (users.find(u => u.username === newUser.username)) {
    return res.status(400).json({ error: "Username already exists" });
  }

  users.push({ ...newUser, role: "user" }); // mặc định role=user
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

  res.json({ message: "User registered successfully" });
});

// Middleware kiểm tra JWT
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Thiếu token" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(403).json({ error: "Token không hợp lệ" });
  }
}

// ✅ Route public
app.get("/api/public", (req, res) => {
  res.json({ message: "Dữ liệu public" });
});

// ✅ Route private
app.get("/api/private", authMiddleware, (req, res) => {
  res.json({ message: `Xin chào ${req.user.username}, đây là dữ liệu bí mật.` });
});

app.use(cors());
app.use(express.json());


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
// app.post("/api/auth", (req, res) => {
//   const newUser = req.body;

//   fs.readFile(USERS_FILE, "utf8", (err, data) => {
//     if (err) return res.status(500).json({ error: "Cannot read users" });

//     let users;
//     try {
//       users = JSON.parse(data);
//     } catch (e) {
//       users = [];
//     }

//     if (!Array.isArray(users)) users = [];

//     if (users.find(u => u.username === newUser.username)) {
//       return res.status(400).json({ error: "Username already exists" });
//     }

//     users.push(newUser);
//     fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), (err) => {
//       if (err) return res.status(500).json({ error: "Cannot save user" });
//       res.json({ message: "User registered successfully" });
//     });
//   });
// });

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
    //apiAuthUrl: process.env.API_AUTH_URL,
  });
});

// Backend trực tiếp gọi Gemini API bằng API_KEY
app.get("/gemini",geminiLimiter, async (req, res) => {
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
