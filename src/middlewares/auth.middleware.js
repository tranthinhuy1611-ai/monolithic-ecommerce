const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({
      error:
        "Không có token, vui lòng đăng nhập (Không dùng token -> báo lỗi).",
    });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Token không hợp lệ." });
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET || "msa_monolithic_secret_2026",
    (err, user) => {
      if (err) {
        return res
          .status(403)
          .json({ error: "Token hết hạn hoặc không chính xác." });
      }
      req.user = user; // Lưu thông tin user decoded (uid, roleid,...)
      next();
    },
  );
}

const verifyAdmin = (req, res, next) => {
  if (req.user && req.user.roleid === 2) {
    next();
  } else {
    return res.status(403).json({ error: "Bạn không có quyền admin." });
  }
};

module.exports = { verifyToken, verifyAdmin };
