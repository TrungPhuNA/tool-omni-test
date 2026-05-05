const jwt = require('jsonwebtoken');
const { User } = require('../models');

class AuthController {
  async register(req, res, next) {
    try {
      const { username, email, password } = req.body;
      
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          status: 'fail',
          code: 'BAD_REQUEST',
          message: 'Email đã được sử dụng'
        });
      }

      const user = await User.create({ username, email, password });
      
      res.status(201).json({
        status: 'success',
        code: 'SUCCESS',
        message: 'Đăng ký thành công',
        data: { id: user.id, username: user.username, email: user.email }
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      
      const user = await User.findOne({ where: { email } });
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({
          status: 'fail',
          code: 'UNAUTHORIZED',
          message: 'Email hoặc mật khẩu không chính xác'
        });
      }

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: '7d'
      });

      res.status(200).json({
        status: 'success',
        code: 'SUCCESS',
        data: {
          token,
          user: { id: user.id, username: user.username, email: user.email }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async me(req, res, next) {
    try {
      res.status(200).json({
        status: 'success',
        code: 'SUCCESS',
        data: {
          user: { id: req.user.id, username: req.user.username, email: req.user.email }
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
