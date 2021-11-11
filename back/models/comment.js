module.exports = (sequelize, DataTypes) => {

    const Comment = sequelize.define("Comment",
    {
        content: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
    },
    {
        charset: "utf8mb4", // mb4 : 이모티콘 가능.
        collate: "utf8mb4_general_ci"
    }
    );

    // 모델 간의 관계
    Comment.associate = (db) => {
        db.Comment.belongsTo(db.User);
        db.Comment.belongsTo(db.Post);
    };

    return Comment;

};