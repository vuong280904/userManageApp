const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');

// 🧩 API thêm admin (dùng để test trong MongoDB Compass)
router.post('/add', async (req, res) => {
  try {
    const { name, password } = req.body;
    const newAdmin = new Admin({ name, password });
    await newAdmin.save();
    res.status(201).json({ message: 'Admin created successfully', admin: newAdmin });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { name, password } = req.body;

    if (!name || !password) {
      return res.status(400).json({ message: "Thiếu name hoặc password" });
    }

    const admin = await Admin.findOne({ name });

    if (!admin || admin.password !== password) {
      return res.status(401).json({ message: "Sai thông tin đăng nhập admin" });
    }

    res.json({ message: "Admin login thành công" });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
