const passport = require("passport");
const local = require("./local");
const db = require("../models");

module.exports = () => {
    passport.serializeUser( (user, done) => { // user = req.login(sucess=user)
        return done(null, user.id);
    });
    passport.deserializeUser( async (id, done) => {
        try {
            const user = await db.User.findOne({
                where: {
                    id
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
            return done(null, user); // 모든 요청마다 사용자 정보를 복구해서 req.user에 넣어줌. & req.isAuthenticated() === true, 만들어줌.
        } catch(err) {
            console.error(err);
            return done(err);
        }
    });
    local();
}