import { logError } from "../utils/logger.js";
import { getPublicNewsListData } from "../services/news.service.js";

export const getPublicNewsList = async (req, res) => {
    try {
        const payload = await getPublicNewsListData({
            page: req.query.page,
            limit: req.query.limit,
            search: req.query.search,
            categorySlug: req.query.category
        });

        res.json({
            success: true,
            ...payload
        });
    } catch (error) {
        logError("Get public news list failed", error, {
            query: req.query,
            ip: req.ip
        });

        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
