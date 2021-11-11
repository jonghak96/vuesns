const passport = require("passport");
const bcrypt = require("bcrypt");
const { Strategy: LocalStrategy } = require("passport-local");
const db = require("../models");

// 전략 localStrategy :
// SNS별로 로그인할 수 있는 방법이 많기 때문에
// passport가 틀을 만들어서 어떤 로그인을 하든
// 전략 틀만 유지해주면 다 됨.

module.exports = () => {
    passport.use(new LocalStrategy(
        {
            usernameField: "email",     // req.body.email
            passwordField: "password",  // req.body.password
        },
        async (email, password, done) => { // done(에러, 성공, 실패)
            try {
                const exUser = await db.User.findOne({ where: { email } });
                if(!exUser) {
                    return done(null, false, { reason: "존재하지 않는 사용자입니다." });
                }
                const result = await bcrypt.compare(password, exUser.password);
                if(result) {
                    return done(null, exUser);
                } else {
                    return done(null, false, { reason : "비밀번호가 일치하지 않습니다." });
                }
            } catch(err) {
                console.error(err);
                return done(err);
            }
        }
    ));
};