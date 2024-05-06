const fs = require('fs');

const DeleteFile = (filePath) => {
    // Delete the file
    return new Promise((resolve) => {
        fs.unlink(filePath, (err) => {
            if (err) {
                console.log(`error in deleting file(${filePath}):`, err);
                resolve(false);
                return;
            }
            resolve(true);
            // File deleted successfully
        });
    })
}

module.exports = DeleteFile;