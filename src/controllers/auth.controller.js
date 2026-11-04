const prisma = require("../lib/prisma");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

async function register(req, res) {
  try {
    const username = String(req.body?.username || "").trim();
    const fullname = String(req.body?.fullname || "").trim();
    const password = String(req.body?.password || "");

    if (!username || !fullname || !password) {
      return res.status(400).json({ error: "Vui lòng nhập đầy đủ thông tin!" });
    }

    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ error: "Tên đăng nhập đã tồn tại!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        username,
        fullname,
        password: hashedPassword,
        roleid: 1,
        mid: 1,
      },
    });

    res.status(201).json({
      message: "Đăng ký thành công!",
      user: {
        uid: newUser.uid,
        username: newUser.username,
        fullname: newUser.fullname,
        roleid: newUser.roleid,
        mid: newUser.mid,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function login(req, res) {
  try {
    const username = String(req.body?.username || "").trim();
    const password = String(req.body?.password || "");

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Vui lòng nhập username và password!" });
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res.status(400).json({ error: "Tài khoản không tồn tại!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Mật khẩu không chính xác!" });
    }

    const token = jwt.sign(
      { uid: user.uid, username: user.username, roleid: user.roleid },
      process.env.JWT_SECRET || "msa_monolithic_secret_2026",
      { expiresIn: "1d" },
    );

    res.json({
      message: "Đăng nhập thành công!",
      token,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { register, login };
