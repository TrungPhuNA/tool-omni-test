const authService = require('../services/auth.service');

class AuthController {
    async register(req, res, next) {
        try {
            const userData = await authService.register(req.body);
            
            res.status(201).json({
                status: 'success',
                code: 'SUCCESS',
                message: 'Đăng ký thành công',
                data: userData
            });
        } catch (error) {
            if (error.message === 'Email đã được sử dụng') {
                return res.status(400).json({
                    status: 'fail',
                    code: 'BAD_REQUEST',
                    message: error.message
                });
            }
            next(error);
        }
    }

    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const result = await authService.login(email, password);

            res.status(200).json({
                status: 'success',
                code: 'SUCCESS',
                data: result
            });
        } catch (error) {
            if (error.message === 'Email hoặc mật khẩu không chính xác') {
                return res.status(401).json({
                    status: 'fail',
                    code: 'UNAUTHORIZED',
                    message: error.message
                });
            }
            next(error);
        }
    }

    async me(req, res, next) {
        try {
            res.status(200).json({
                status: 'success',
                code: 'SUCCESS',
                data: {
                    user: { 
                        id: req.user.id, 
                        username: req.user.username, 
                        email: req.user.email,
                        role: req.user.role,
                        status: req.user.status
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AuthController();
