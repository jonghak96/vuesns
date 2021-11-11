exports.isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()) {
        return next();
    }
    return res.status(401).send("로그인이 필요합니다.");
};

exports.isNotLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        return next();
    }
    return res.status(401).send("이미 로그인한 사용자는 이용할 수 없습니다.");
};

// exports.이름 = 설명부; : 

// exports === {
    // isLoggedIn: (req, res, next) => {}
    // } : 객체(속성들로 구성)

// next : 인수로 아무것도 안 주었을 때, 다음 미들웨어로 넘어감. / 인수가 있으면 에러처리로 넘어감.

// module.exports = ""; : 대표적인 것. 우선권이 exports보다 높음. 같이쓰면 module.exports만 실행 됨.

// module.exports = {
//     isLoggedIn: (req, res, next) => {}
//     isNotLoggedIn: (req, res, next) => {}
// }