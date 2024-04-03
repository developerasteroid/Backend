const User = require('./../models/userModel');
const mongoose = require('mongoose');


const searchUser = async(req, res) => {
    try {
        const data = [];
        const name = req.params.field;
        if(!name){
            return res.status(400).json({message: 'name field is required to seaarch user.'})
        }
        let user = await User.findOne({username: name});
        if(user){
            data.push({
                name:user.name,
                username:user.username,
                uid:user._id,
                profile:user.profileImageUrl
            });
        }
        user = await User.find({name});
        if(user){
            user.forEach((value) => {
                const foundUser = data.find(obj => obj.uid == value._id);

                if(!foundUser){
                    data.push({
                        name:value.name,
                        username:value.username,
                        uid:value._id,
                        profile:value.profileImageUrl
                    });
                }
            })
        }
        return res.json(data); 
        
    } catch (error) {
        console.error('Error in searchUser:', error);
        res.status(500).json({message: 'Internal server error'});
    }
}


module.exports = {searchUser};