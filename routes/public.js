const express = require("express");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// ✅ Hàm helper đọc JSON an toàn
function sendJsonSafe(filePath, res, errorMsg) {
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error(`❌ Lỗi đọc file ${filePath}:`, err.message);
      return res.status(500).json({ error: errorMsg || "Lỗi đọc dữ liệu" });
    }
    try {
      const jsonData = JSON.parse(data);
      res.json(jsonData);
    } catch (parseErr) {
      console.error(`❌ Lỗi parse JSON ${filePath}:`, parseErr.message);
      res.status(500).json({ error: "File JSON bị hỏng hoặc sai định dạng" });
    }
  });
}

// Public JSON data
router.get("/diadiem", (req, res) => {
  sendJsonSafe(
    path.join(__dirname, "../api/diadiem/diadiem.json"),
    res,
    "Không thể đọc dữ liệu địa điểm"
  );
});

router.get("/amthuc", (req, res) => {
  sendJsonSafe(
    path.join(__dirname, "../api/amthuc/amthuc.json"),
    res,
    "Không thể đọc dữ liệu ẩm thực"
  );
});

router.get("/sections", (req, res) => {
  sendJsonSafe(
    path.join(__dirname, "../api/sections/section.json"),
    res,
    "Không thể đọc dữ liệu sections"
  );
});

router.get("/vanhoa", (req, res) => {
  sendJsonSafe(
    path.join(__dirname, "../api/vanhoa/vanhoa.json"),
    res,
    "Không thể đọc dữ liệu văn hóa"
  );
});

module.exports = router;
