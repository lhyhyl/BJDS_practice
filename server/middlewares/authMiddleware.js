const jwt = require('jsonwebtoken');
const { User } = require("../models/index");
const config = require("../config/config");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ code: 401, message: '未提供认证令牌' });
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      return res.status(401).json({ code: 401, message: '用户不存在' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("认证错误:", error);
    return res.status(401).json({ code: 401, message: '无效的认证令牌' });
  }
};

module.exports = authMiddleware; 