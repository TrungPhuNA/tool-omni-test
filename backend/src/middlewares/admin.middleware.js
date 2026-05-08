/**
 * Middleware kiểm tra quyền Admin
 * Chỉ cho phép tiếp tục nếu req.user có role là 'admin'
 */
const adminMiddleware = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            status: 'error',
            code: 'UNAUTHORIZED',
            message: 'Bạn chưa đăng nhập'
        });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({
            status: 'error',
            code: 'FORBIDDEN',
            message: 'Bạn không có quyền truy cập khu vực này'
        });
    }

    next();
};

module.exports = adminMiddleware;
