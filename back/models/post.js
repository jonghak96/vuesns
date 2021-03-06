module.exports = (sequelize, DataTypes) => {

    const Post = sequelize.define("Post", // 테이블명 : posts
    {
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
    },
    {
        charset: "utf8mb4", // mb4 : 이모티콘 가능.
        collate: "utf8mb4_general_ci"
    }
    );

    // 모델 간의 관계
    // hasOne, belongsTo
    // hasMany, belongsTo
    // belongsToMany
    Post.associate = (db) => {
        db.Post.belongsTo(db.User);
        db.Post.hasMany(db.Comment);
        db.Post.hasMany(db.Image);
        db.Post.belongsToMany(db.User, {through: "Like", as: "Likers" });
        db.Post.belongsToMany(db.Hashtag, { through: "PostHashtag" });
        db.Post.belongsTo(db.Post, { as: "Retweet" }); // RetweetId
    };

    return Post;

};