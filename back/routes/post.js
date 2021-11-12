const express = require("express");
const AWS = require("aws-sdk");

const multerS3 = require("multer-s3");

const multer = require("multer");
const path = require("path");
const { nextTick } = require("process");
const db = require("../models");
const { isLoggedIn, isNotLoggedIn } = require("./middlewares");

const router = express.Router();

AWS.config.update({
    region: "us-east-2",
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
});

const upload = multer({
    storage: multerS3({
        s3: new AWS.S3(),
        bucket: "vuesns",
        key(req, file, cb) {
            cb(null, `original/${Date.now()}${path.basename(file.originalname)}`)
        },
    }),
    limits: { fileSize: 20 * 1024 * 1024 },
});

// isLoggedIn : 미들웨어 > 미들웨어
router.post("/", isLoggedIn, async (req, res, next) => {
    try {
        const hashtags = req.body.content.match(/#[^\s#]+/g);
        const newPost = await db.Post.create({
            content: req.body.content,
            UserId: req.user.id,
        });
        if(hashtags) {
            const result = await Promise.all(hashtags.map( (tag) => db.Hashtag.findOrCreate({
                    where: { name: tag.slice(1).toLowerCase() }
            })));
            await newPost.addHashtags(result.map(r => r[0]));
            // db.sequelize.query("SQL문"); : 복잡한 쿼리는 직접 할 것!!
        }
        if(req.body.image) {
            if(Array.isArray(req.body.image)) {
                await Promise.all(req.body.image.map( (image) => {
                    return db.Image.create({
                        src: image,
                        PostId: newPost.id,
                    });
                    // newPost.addImages(images); 비효율적.
                }))
            } else {
                await db.Image.create({
                    src: req.body.image,
                    PostId: newPost.id,
                });
            }
        }

        const fullPost = await db.Post.findOne({
            where: { id: newPost.id },
            include: [{
                model: db.User,
                attributes: ["id", "nickname"],
            }, {
                model: db.Image,
            }, {
                model: db.User,
                as: "Likers",
                attributes: ["id", "nickname"],
            }]
        });
        return res.json(fullPost);

    } catch(err) {
        console.error(err);
        next(err);
    }
});

router.get("/:id", async (req, res, next) => {
    try {
        const post = await db.Post.findOne({
            where: { id: req.params.id },
            include: [{
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
                }, {
                    model: db.Image,
                }],
            }]
        });
        return res.json(post);
    } catch (e) {
        console.error(e);
        next(e);
    }
});

router.delete("/:id", isLoggedIn, async (req, res, next) => {
    try {
        await db.Post.destroy({
            where: {
                id: req.params.id,
            }
        });
        res.send("삭제되었습니다."); // return 필요없을까??????????????????????????????
    } catch (e) {
        console.error(e);
        next(e);
    }
});

router.post("/images", isLoggedIn, upload.array("image"), (req, res) => {
    console.log(req.files);
    res.json(req.files.map( (v) => v.location ));
});

router.post("/:id/comment", isLoggedIn, async (req, res, next) => {
    try {
        const post = await db.Post.findOne({
            where: {
                id: req.params.id,
            }
        });
        if(!post) {
            return res.status(404).send("포스트가 존재하지 않습니다.");
        }
        console.log("req :::::", req);
        const newComment = await db.Comment.create({
            PostId: post.id,
            UserId: req.user.id,
            content: req.body.content,
        });
        const comment = await db.Comment.findOne({
            where: {
                id: newComment.id,
            },
            include: [{
                model: db.User,
                attributes: ["id", "nickname"],
            }],
        });
        return res.json(comment);
    } catch (e) {
        console.error(e);
        next(e);
    }
});

router.get("/:id/comments", async (req, res, next) => {
    try {
        const post = await db.Post.findOne({
            id: req.params.id,
        });
        if(!post) {
            return res.status(404).send("포스트가 존재하지 않습니다.");
        }
        const comments = await db.Comment.findAll({
            where: {
                PostId: req.params.id,
            },
            include: [{
                model: db.User,
                attributes: ["id", "nickname"],
            }],
            order: [["createdAt", "ASC"], ["updatedAt", "DESC"]],
        });
        return res.json(comments);
    } catch (e) {
        console.error(e);
        next(e);
    }
});

router.post("/:id/retweet", async (req, res, next) => {
    try {
        const post = await db.Post.findOne({
            where: {
                id: req.params.id,
            },
            include: [{
                model: db.Post,
                as: "Retweet",
            }],
        });
        if(!post) {
            return res.status(404).send("포스트가 존재하지 않습니다.");
        }
        if(req.user.id === post.UserId || (post.Retweet && post.Retweet.UserId === req.user.id)) {
            return res.status(403).send("본인이 작성한 글은 리트윗할 수 없습니다.");
        }
        const retweetTargetId = post.RetweetId || post.id;
        // 만약 내가 이전에 리트윗 한 적이 있다면
        const exPost = await db.Post.findOne({
            where: {
                UserId: req.user.id,
                RetweetId: retweetTargetId,
            }
        });
        if(exPost) {
            return res.status(403).send("이미 리트윗한 게시글입니다.");
        }
        const retweet = await db.Post.create({
            UserId: req.user.id,
            RetweetId: retweetTargetId,
            content: "retweet TEST",
        });
        const retweetWithPrevPost = await db.Post.findOne({
            where: {
                id: retweet.id,
            },
            include: [{
                model: db.User,
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
            }, {
                model: db.User,
                as: "Likers",
                attributes: ["id", "nickname"],
            }],
        });
        return res.json(retweetWithPrevPost);
    } catch (e) {
        console.error(e);
        next(e);
    }
});

router.post("/:id/like", isLoggedIn, async (req, res, next) => {
    try {
        const post = await db.Post.findOne({
            where: {
                id: req.params.id,
            },
        });
        if(!post) {
            return res.status(404).send("포스트가 존재하지 않습니다.");
        }
        await post.addLiker(req.user.id);
        return res.json({ userId: req.user.id });
    } catch (e) {
        console.error(e);
        next(e);
    }
});

router.delete("/:id/like", isLoggedIn, async (req, res, next) => {
    try {
        const post = await db.Post.findOne({
            where: {
                id: req.params.id,
            },
        });
        if(!post) {
            return res.status(404).send("포스트가 존재하지 않습니다.");
        }
        await post.removeLiker(req.user.id);
        return res.json({ userId: req.user.id });
    } catch (e) {
        console.error(e);
        next(e);
    }
});

module.exports = router;