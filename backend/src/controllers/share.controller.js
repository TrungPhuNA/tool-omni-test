const shareService = require('../services/share.service');

/**
 * Create a new share for a collection
 */
exports.createShare = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const share = await shareService.createShare(userId, req.body);

        res.status(201).json({
            success: true,
            data: share
        });
    } catch (error) {
        if (error.message === 'Bạn không có quyền chia sẻ collection này') {
            return res.status(403).json({ success: false, message: error.message });
        }
        if (error.message === 'Collection đã được chia sẻ với email này' || error.message === 'Không tìm thấy collection') {
            return res.status(400).json({ success: false, message: error.message });
        }
        next(error);
    }
};

/**
 * Get all shares for a collection
 */
exports.getShares = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { collectionId } = req.params;
        const shares = await shareService.getShares(userId, collectionId);

        res.status(200).json({
            success: true,
            data: shares
        });
    } catch (error) {
        if (error.message === 'Bạn không có quyền xem thông tin chia sẻ của collection này') {
            return res.status(403).json({ success: false, message: error.message });
        }
        if (error.message === 'Không tìm thấy collection') {
            return res.status(404).json({ success: false, message: error.message });
        }
        next(error);
    }
};

/**
 * Delete a share
 */
exports.deleteShare = async (req, res, next) => {
    try {
        const userId = req.user.id;
        await shareService.deleteShare(userId, req.params.id);

        res.status(200).json({
            success: true,
            message: 'Đã xoá quyền chia sẻ'
        });
    } catch (error) {
        if (error.message === 'Bạn không có quyền xoá thông tin chia sẻ này') {
            return res.status(403).json({ success: false, message: error.message });
        }
        if (error.message === 'Không tìm thấy thông tin chia sẻ') {
            return res.status(404).json({ success: false, message: error.message });
        }
        next(error);
    }
};

/**
 * Get collection data via public token
 */
exports.getPublicCollection = async (req, res, next) => {
    try {
        const { token } = req.params;
        const collection = await shareService.getPublicCollection(token);

        res.status(200).json({
            success: true,
            data: collection
        });
    } catch (error) {
        if (error.message === 'Mã chia sẻ không hợp lệ hoặc đã hết hạn') {
            return res.status(404).json({ success: false, message: error.message });
        }
        next(error);
    }
};
