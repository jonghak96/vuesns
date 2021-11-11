const express = require("express");
const bcrypt = require("bcrypt");
const passport = require("passport");
const db = require("../models");
const user = require("../models/user");
const { isLoggedIn, isNotLoggedIn } = require("./middlewares");

const router = express.Router();


router.post("/", isNotLoggedIn, async (req, res, next) => {
    try {
        const hash = await bcrypt.hash(req.body.password, 12);
        const exUser = await db.User.findOne({
            where: {
                email: req.body.email,
            },
        });
        if(exUser) {
            return res.status(403).json({ // 400번대 : 클라이언트에서의 잘못된 접근 (403:forbidden)
                errorCode: 1,
                message: "이미 가입된 이메일 주소입니다.",
            });
        }
        const newUser = await db.User.create({
            email: req.body.email,
            password: hash,
            nickname: req.body.nickname,
        }); // HTTP STATUS CODE
        passport.authenticate('local', (err, user, failure) => { // (err, user, info)
            if(err) {
                console.error(err);
                return next(err);
            }
            if(failure) {
                return res.status(401).send(failure.reason);
            }
            return req.login(user, async (err) => { // 세션에 사용자 정보를 저장해줌. (어떻게 : serializeUser)
                if(err) {
                    console.error(err);
                    return next(err);
                }
                const fullUser = await db.User.findOne({
                    where: {
                        id: user.id,
                    },
                    attributes: ["id", "email", "nickname"],
                    include: [{
                        model: db.User,
                        as: "Followings",
                        attributes: ["id"],
                    }, {
                        model: db.User,
                        as: "Followers",
                        attributes: ["id"],
                    }, {
                        model: db.Post,
                        attributes: ["id"],
                    }],
                });
                return res.json(fullUser);
            });
        })(req, res, next);
        // return res.status(201).json(newUser);
    } catch(err) {
        console.log(err);
        return next(err);
    }
});

router.post("/login", isNotLoggedIn, (req, res, next) => {
    passport.authenticate('local', (err, user, failure) => { // (err, user, info)
        if(err) {
            console.error(err);
            return next(err);
        }
        if(failure) {
            return res.status(401).send(failure.reason);
        }
        return req.login(user, async (err) => { // 세션에 사용자 정보를 저장해줌. (어떻게 : serializeUser)
            if(err) {
                console.error(err);
                return next(err);
            }
            const fullUser = await db.User.findOne({
                where: {
                    id: user.id,
                },
                attributes: ["id", "email", "nickname"],
                include: [{
                    model: db.User,
                    as: "Followings",
                    attributes: ["id"],
                }, {
                    model: db.User,
                    as: "Followers",
                    attributes: ["id"],
                }, {
                    model: db.Post,
                    attributes: ["id"],
                }],
            });
            return res.json(fullUser);
        });
    })(req, res, next);
});

router.post("/logout", isLoggedIn, (req, res) => {
    if(req.isAuthenticated()) { // 로그인 되었는지 검사 가능.
        req.logout();
        req.session.destroy(); // 세션에 사용자 정보 말고 다른 정보도 있을 수 있기 때문에 선택사항.
        return res.status(200).send("로그아웃 되었습니다.");
    }
});

router.get("/", isLoggedIn, async (req, res, next) => {
    const user = req.user;
    return res.json(user);
});

router.post("/:id/follow", isLoggedIn, async (req, res, next) => {
    try {
        const me = await db.User.findOne({
            where: {
                id: req.user.id,
            }
        });
        await me.addFollowing(req.params.id);
        res.send(req.params.id);
    } catch (e) {
        console.error(e);
        next(e);
    }
});

router.delete("/:id/follow", isLoggedIn, async (req, res, next) => {
    try {
        const me = await db.User.findOne({
            where: {
                id: req.user.id,
            }
        });
        await me.removeFollowing(req.params.id);
        res.send(req.params.id);
    } catch (e) {
        console.error(e);
        next(e);
    }
});

router.patch("/nickname", isLoggedIn, async (req, res, next) => {
    try {
        await db.User.update({
            nickname: req.body.nickname,
        }, {
            where: {
                id: req.user.id,
            },
        });
        res.send(req.body.nickname);
    } catch (e) {
        console.error(e);
        next(e);
    }
});

router.get("/:id/followings", isLoggedIn, async (req, res, next) => {
    try {
        const user = await db.User.findOne({
            where: {
                id: req.user.id,
            }
        });
        const followings = await user.getFollowings({
            attributes: ["id", "nickname"],
            limit: parseInt(req.query.limit || 3, 10),
            offset: parseInt(req.query.offset || 0, 10),
        });
        res.json(followings);
    } catch (e) {
        console.error(e);
        next(e);
    }
});

router.get("/:id/followers", isLoggedIn, async (req, res, next) => {
    try {
        const user = await db.User.findOne({
            where: {
                id: req.user.id,
            }
        });
        const followers = await user.getFollowers({
            attributes: ["id", "nickname"],
            limit: parseInt(req.query.limit || 3, 10),
            offset: parseInt(req.query.offset || 0, 10),
        });
        res.json(followers);
    } catch (e) {
        console.error(e);
        next(e);
    }
});

router.delete("/:id/follower", isLoggedIn, async (req, res, next) => {
    try {
        const me = await db.User.findOne({
            where: {
                id: req.user.id,
            }
        });
        await user.removeFollower(req.params.id);
        res.send(req.params.id);
    } catch (e) {
        console.error(e);
        next(e);
    }
});

router.get("/:id/posts", async (req, res, next) => {
    try {
        let where = {
            UserId: parseInt(req.params.id, 10),
            RetweetId: null,
        };
        if(parseInt(req.query.lastId, 10)) {
            where[db.Sequelize.Op.lt] = parseInt(req.query.lastId, 10);
        }
        const posts = await db.Post.findAll({
            where,
            include: [{
                model: db.User,
                attributes: ["id", "nickname"],
            }, {
                model: db.Image,
            }, {
                model: db.User,
                through: "Like",
                as: "Likers",
                attributes: ["id"],
            }],
            order: [["createdAt", "DESC"]],
        });
        return res.json(posts);
    } catch (error) {
        console.error(e);
        next(e);
    }
});

router.get("/:id", async (req, res, next) => {
    try {
        const user = await db.User.findOne({
            where: {
                id: parseInt(req.params.id, 10),
            },
            attributes: ["id", "nickname"],
            include: [{
                model: db.User,
                as: "Followings",
                attributes: ["id"],
            }, {
                model: db.User,
                as: "Followers",
                attributes: ["id"],
            }, {
                model: db.Post,
                attributes: ["id"],
            }],
        });
        res.json(user);
    } catch (e) {
        console.error(e);
        next(e);
    }
});

module.exports = router;