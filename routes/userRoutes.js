const express = require('express');
const router = express.Router();
const User = require('./../models/user');
const { jwtAuthMiddleware, generateToken } = require('./../auth/jwt');

// Post route to add a user
router.post('/signup', async (req, res) => {
    try {
        const data = req.body; // Assuming the request body contains the user data

        // Create a new user document using the mongoose model
        const newUser = new User(data);

        // Save the new user to the database
        const response = await newUser.save();
        console.log("Data saved");

        const payload = {
            id: response.id
        }
        console.log(JSON.stringify(payload));
        const token = generateToken(payload);
        console.log("Token is: ", token);

        res.status(200).json({ response: response, token: token });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    try {
        // Extract adharCardNumber and password from request body
        const { adharCardNumber, password } = req.body;

        // Find the user by adharCardNumber
        const user = await User.findOne({ adharCardNumber: adharCardNumber }); // Corrected

        // If user does not exist or password does not match, return error
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: "Invalid username or password" });
        }

        // Generate token 
        const payload = {
            id: user.id,
        }
        const token = generateToken(payload);

        // Return the token as response
        res.json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Profile route
router.get('/profile',jwtAuthMiddleware, async (req, res) => {
    try{
        const userData = req.user;
        const userId = userData.id;
        const user = await User.findById(userId);
        res.status(200).json({user});
    }catch(err){
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

// To change the password of a user
router.put('/profile/password', jwtAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user.id; // Extract the id from the token
        const { currentPassword, newPassword } = req.body; // Corrected typo

        // Find the user with the userID
        const user = await User.findById(userId);

        // If password does not match, return error
        if (!(await user.comparePassword(currentPassword))) { // Corrected typo
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Update the user's password
        user.password = newPassword;
        await user.save();

        console.log("Password updated");
        res.status(200).json({ message: "Password updated!" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
