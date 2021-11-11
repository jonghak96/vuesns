const express = require("express");

const db = require("../models");

const router = express.Router();

router.get("/:tag", async (req, res, next) => {
    try {
        let where = {};
        // lt: less than / lte / gt / gte / ne / in / nin
        if(parseInt(req.query.lastId, 10)) {
            where = {
                id: {
                    [db.Sequelize.Op.lt]: parseInt(req.query.lastId, 10),
                }
            };
        }
        const posts = await db.Post.findAll({
            where,
            include: [{
                model: db.Hashtag,
                where: {
                    name: decodeURIComponent(req.params.tag),
                },
            },{
                model: db.User,
                attributes: ["id", "nickname"],
            }, {
                model: db.Image,
            }, {
                model: db.User,
                as: "Likers",
                attributes: ["id", "nickname"],
            }, {
                model: db.Post,
                as: "Retweet",
                include: [{
                    model: db.User,
                    attributes: ["id", "nickname"],
                },{
                    model: db.Image,
                }],
            }],
            order: [["createdAt", "DESC"]],
            // offset: parseInt(req.query.offset, 10) || 0,
            limit: parseInt(req.query.limit, 10) || 10,
        });
        return res.json(posts);
    } catch (e) {
        console.error(e);
        next(e);
    }
});

module.exports = router;