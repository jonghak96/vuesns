// "express는 미들웨어 알면 다 아는 것이다." (미들웨어 : use, get, post,,)
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const passport = require("passport");
const session = require("express-session");
const cookie = require("cookie-parser"); // npm i cookie-parser
const morgan = require("morgan");
const hpp = require("hpp");
const helmet = require("helmet");
const dotenv = require("dotenv");


const prod = process.env.NODE_ENV === "production";
const db = require("./models");
const passportConfig = require("./passport");
const userRouter = require("./routes/user");
const postRouter = require("./routes/post");
const postsRouter = require("./routes/posts");
const hashtagRouter = require("./routes/hashtag");
const app = express();

dotenv.config();

// **************** 서버 시작될 때, 기존 db 날리고 생성 ********************
// db.sequelize.sync({ force: true });
db.sequelize.sync();
passportConfig();

if(prod) {
    app.use(helmet());
    app.use(hpp());
    app.use(morgan("combined"));
    app.use(cors({
        origin: "http://jellyforest.shop",
        credentials: true,
    }));

} else {
    // 요청이 왔을 때, 콘솔에 요청에 대해서 기록해줌.
    app.use(morgan("dev"));
    // 모든 포트 접근을 허용하는 미들웨어.(npm i cors)
    app.use(cors({
        origin: "http://localhost:3080",
        credentials: true,
    }));

}

// uploads 안에 들어있는 정적 이미지 파일 가져올 수 있게 함.
// 보안상 이유로 프론트와 백엔드의 주소가 다름.
app.use('/', express.static("uploads"));
// express가 기본적으로 json을 못 받아서,
// 이거 넣어주면 json을 바디(req.body.)로 받을 수 있음.
// 요청해서 온 json 데이터를 parsing해서 req.body.에 넣어줌.
app.use(express.json()); 
// form에서 action을 통해서 전송할 때,
// 그 데이터를 해석해서 req.body.에 넣어줌.
app.use(express.urlencoded({ extended: false }));
app.use(cookie(process.env.COOKIE_SECRET));
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
        httpOnly: true,
        secure: false,
        domain: prod && ".jellyforest.shop",
    }
})); // npm i express-session
// 미들웨어의 기능 : request, response 조작, login, logout 넣어줌.
app.use(passport.initialize());
app.use(passport.session());


app.get("/", (req, res) => {
    res.status(200).send("Hello Backend!~");
});
app.use("/user", userRouter);
app.use("/post", postRouter);
app.use("/posts", postsRouter);
app.use("/hashtag", hashtagRouter);



app.listen(prod ? process.env.PORT : 3085, () => {
    console.log(`Backend Server is working at port ${prod ? process.env.PORT : 3085}.`);
});