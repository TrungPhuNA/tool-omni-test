const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/user.repository');

class AuthService {
  async register(userData) {
    const { username, email, password } = userData;
    
    // Check existing user
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('Email đã được sử dụng');
    }

    // Create user
    const user = await userRepository.create({ username, email, password });
    
    return {
      id: user.id,
      username: user.username,
      email: user.email
    };
  }

  async login(email, password) {
    const user = await userRepository.findByEmail(email);
    
    if (!user || !(await user.comparePassword(password))) {
      throw new Error('Email hoặc mật khẩu không chính xác');
    }

    const token = this.generateToken(user.id);

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    };
  }

  generateToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });
  }
}

module.exports = new AuthService();
