const AWS = require("aws-sdk");
const Sharp = require("sharp");

const S3 = new AWS.S3({region: "us-east-2"});

exports.handler = async (event, context, callback) => {

    const Bucket = event.Records[0].s3.bucket.name;
    const Key = event.Records[0].s3.object.key;
    const filename = Key.split('/')[Key.split('/').length - 1];
    const ext = Key.split('.')[Key.split('.').length - 1];
    const requiredFormat = ext === "jpg" ? "jpeg" : ext;

    try {
        const s3Object = await S3.getObject({
            Bucket,
            Key,
        }).promise();
        const resizedImage = await Sharp(s3Object.Body)
        .resize(800, 800, {
            fit: "inside",
        }).toFormat(requiredFormat)
        .toBuffer();
        await S3.putObject({
            Body: resizedImage,
            Bucket,
            Key: `thumbnail/${filename}`,
        }).promise();
        return callback(null, `thumbnail/${filename}`);

    } catch (e) {
        console.error(e);
        return callback(e);
    }

}