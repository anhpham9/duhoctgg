import { logError } from "../utils/logger.js";
import { getPublicNewsDetailData, getPublicNewsListData } from "../services/news.service.js";

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

export const getPublicNewsBySlug = async (req, res) => {
    try {
        const payload = await getPublicNewsDetailData(req.params.slug);

        if (!payload) {
            return res.status(404).json({
                success: false,
                message: "News article not found"
            });
        }

        res.json({
            success: true,
            ...payload
        });
    } catch (error) {
        logError("Get public news by slug failed", error, {
            params: req.params,
            ip: req.ip
        });

        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
