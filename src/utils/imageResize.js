const sharp = require('sharp');
sharp.cache(false);

const resizeImage = (inputFilePath, outputFilePath, width) => {
    return new Promise((resolve, reject) => {
        sharp(inputFilePath)
            .resize({ width: width })
            .toFile(outputFilePath, (err, resizedImgInfo) => {
                if (err) {
                    console.error(`Error when resizing image(${inputFilePath}):`, err);
                    reject(err);
                } else {
                    resolve(resizedImgInfo);
                }
            });
    });
};

module.exports = resizeImage;
