const express = require('express');
const router = express.Router();
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ====== TẠO THƯ MỤC UPLOAD NẾU CHƯA CÓ ======
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// ====== CẤU HÌNH MULTER ======
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// ====== ROUTES ======

/**
 * @route POST /api/users/add
 * @desc Thêm người dùng mới
 */
router.post('/add', upload.single('image'), async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Ảnh sẽ được truy cập qua: http://<server>/uploads/<filename>
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const newUser = new User({ username, email, password, image });
    await newUser.save();

    res.status(201).json(newUser);
  } catch (err) {
    console.error("❌ Lỗi thêm user:", err);
    res.status(400).json({ error: err.message });
  }
});

/**
 * @route GET /api/users
 * @desc Lấy danh sách tất cả người dùng
 */
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route GET /api/users/:id
 * @desc Lấy thông tin người dùng theo ID
 */
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route PUT /api/users/:id
 * @desc Cập nhật thông tin người dùng
 */
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { username, email, password } = req.body;
    let image;

    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    } else {
      const existingUser = await User.findById(req.params.id);
      image = existingUser ? existingUser.image : null;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { username, email, password, image },
      { new: true }
    );

    if (!updatedUser)
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });

    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @route DELETE /api/users/:id
 * @desc Xóa người dùng
 */
router.delete('/:id', async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser)
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });

    res.json({ message: 'Xóa người dùng thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route POST /api/users/login
 * @desc Đăng nhập
 */

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body; // login bằng username

    // Kiểm tra input
    if (!username || !password) {
      return res.status(400).json({ message: "Vui lòng nhập username và mật khẩu" });
    }

    // Tìm user theo username
    const user = await User.findOne({ username });

    // Sai thông tin đăng nhập
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Sai thông tin đăng nhập" });
    }

    // Loại bỏ password trước khi trả về client
    const { password: pw, ...userData } = user.toObject();

    res.json({
      message: "User login thành công",
      user: userData,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
