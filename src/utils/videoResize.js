const ffmpeg = require('fluent-ffmpeg');


const resizeVideo = async(inputFilePath, outputFilePath, width) => {
    // Perform video resizing using FFmpeg
    return new Promise((resolve, reject) => {
       ffmpeg(inputFilePath)
           .size(`${width}x?`) // Set the desired output size
           .on('error', (err) => {
               console.error('Error during FFmpeg processing:', err);
               reject(err);
           })
           .on('end', (info) => {
               // Use ffprobe to retrieve information about the resized video
               ffmpeg.ffprobe(outputFilePath, (err, metadata) => {
                   if (err) {
                       console.error('Error retrieving video information:', err);
                       reject(err);
                   } else {
                       // console.log('Video resizing complete');
                       // console.log('Width:', metadata.streams[0].width);
                       // console.log('Height:', metadata.streams[0].height);
                       resolve(metadata);
                   }
               });
           })
           .save(outputFilePath); // Save the resized video to a new file
   });
}

module.exports = resizeVideo;