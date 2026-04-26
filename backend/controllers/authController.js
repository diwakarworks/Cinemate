const User = require('../models/User');
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generatetoken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '60d' });
}


const register = asyncHandler(async (req, res) => {
    const { username, email, password,  profilePic} = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server Error' });
    }

    const hashedPassword = await bcrypt.hash(password, 14)

    const user = await User.create({ username, email, password: hashedPassword, profilePic });

    if (user) {
        return res.status(201).json({
            id: user._id, name: user.username, email: user.email,  profilePicture: user.profilePic, token: generatetoken(user._id),
        })
    }
    else {
       return res.status(400).json({ message: "Invalid user data" })

    }

})

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    try {

        const user = await User.findOne({ email })

        if (user && (await bcrypt.compare(password, user.password))) {
           return  res.json({
                id: user._id,
                name: user.username,
                email: user.email,
                profilePicture: user.profilePic,
                token: generatetoken(user._id),
            })
        }
        else {
            return res.status(400).json({ message: "Invalid email and passsword" })
        }
    }
    catch (error) {
        console.error("Error during login", error);
        return res.status(500).json({ message: 'Server Error' });

    }

})


const getUserProfile = asyncHandler(async (req, res) => {
    const userId = req.user._id; 
    // console.log('req.user:', userId);

    try {
        const user = await User.findById(userId).select('-password'); 
    

        
        if(user) {
           return   res.status(200).json({
            id:user._id,
            username: user.username,
            email: user.email,
            profilePic: user.profilePic,
            stats:user.stats,
            watchlist:user.watchlist,
            favorites: user.favorites, 
        });
    }
    } catch (error) {
        console.error(`Error ${error.message}`)
        return res.status(500).json({ message: 'Failed to fetch the profile' });
    }
});



module.exports = { register, login, getUserProfile };


