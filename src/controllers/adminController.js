const Bitmoji = require('./../models/bitmojiModel');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const DeleteFile = require('./../utils/deleteFile');
const resizeImage = require('./../utils/imageResize');
const mongoose = require('mongoose'); 

const temporaryBitmojiStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './src/uploads/temp/');
    },
    filename: function (req, file, cb) {
        cb(null, 'BIT-' + uuidv4().replace(/-/g, '') + path.extname(file.originalname));
    }
});

const uploadBitmoji = multer({ storage: temporaryBitmojiStorage});

const addNewBitmoji = async(req, res) => {
    try {
        const {name} = req.body;
        if(!req.file){
            return res.status(400).json({message: 'Bitmoji image is missing'});
        }
        if(!name){
            await DeleteFile(req.file.path);
            return res.status(400).json({message: 'Bitmoji name is missing'});
        }

        await resizeImage(req.file.path, "src/uploads/bitmojis/" + req.file.filename, 150);
        await DeleteFile(req.file.path);

        const bitmoji = new Bitmoji({name, photo: req.file.filename});

        await bitmoji.save();

        res.json({message:'Bitmoji Added Successfully'});

    } catch (error) {
        await DeleteFile(req.file.path);
        console.error('Error in addNewBitmoji:', error);
        res.status(500).json({message: 'Internal server error'});
    }
}



const deleteBitmoji = async(req, res) => {
    try {
        const { bitmoji } = req.body;
        if(!bitmoji){
            return res.status(400).json({message: 'bitmoji ID is missing'});
        }
        if(!mongoose.Types.ObjectId.isValid(bitmoji)){
            return res.status(400).json({message: 'Invalid bitmoji ID'});
        }
        const avatar = await Bitmoji.findById(bitmoji);
        if(!avatar){
            return res.status(404).json({message: 'Bitmoji does not exists'});
        }
        await Bitmoji.findByIdAndDelete(bitmoji);
        await DeleteFile("src/uploads/bitmojis/" + avatar.photo);

        res.json({message:'Bitmoji Deleted Successfully'});
    } catch (error) {
        console.error('Error in deleteBitmoji:', error);
        res.status(500).json({message: 'Internal server error'});
    }
}

module.exports = {uploadBitmoji, addNewBitmoji, deleteBitmoji};