const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const userModel = require('./models/users');
const bcrypt = require('bcrypt');
const { sendVerificationCode, sendFeedback } = require('./email');
const mongoURI = 'mongodb+srv://nummad:12345@cluster0.ixnpx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const multer = require('multer');
const cloudinary = require('./cloudinaryConfig');
const imageModel = require('./models/image');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const session = require('express-session');
require('dotenv').config();
const passport = require('passport');
require('./passport');
const cookieParser = require("cookie-parser");


const constantFunctions = require('./constants');

dotenv.config();
const app = express();
const port = 3000;

const corsOptions = {
    origin: '*',
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(session(
    {
        resave: false,
        saveUninitialized: true,
        secret: process.env.SESSION_SECRET
    }));
app.use(passport.initialize());
app.use(passport.session());


app.get('/', (req, res) => {
    res.status(200).json({ message: 'Backend deployed successfully' });
});
app.get('/history', async (req, res) => {
    try {
        const email = req.query.email;
        const data = await imageModel.find({ sender: email });
        res.status(200).json({ message: 'Data found.', data: data });
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: 'Server error', error: e.message });
    }
});
app.get('/auth/google', passport.authenticate('google', {scope: 
    ['email', 'profile']
}));
app.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/failure' }),
    (req, res) => {
        res.cookie("email", req.user.emails[0].value, { 
            maxAge: 50 * 365 * 24 * 60 * 60 * 1000, 
            httpOnly: false, 
            secure: true, 
            sameSite: "none", // Change from "lax" to "none" for cross-origin
            domain: "blemish-bot.vercel.app" // Ensure this matches your frontend domain
        });
        res.redirect('https://blemish-bot.vercel.app/chat');
    }
);
app.get('/success', constantFunctions.successGoogleLogin);
app.get('/failure', constantFunctions.failureGoogleLogin);
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const existingUser = await userModel.findOne({ email });

        if (!existingUser) {
            return res.status(400).json({ error: 'User not found. Please sign up first.' });
        }
        const isPasswordValid = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        res.status(200).json({ message: 'Login successful', user: existingUser });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
});

app.post('/signup', async (req, res) => {
    const { email, password, name } = req.body;
    try {
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const newUser = await userModel.create({ email, password: hashedPassword, name, isVerified: false, verificationCode });
        await sendVerificationCode(email, verificationCode);
        res.status(201).json(newUser);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
});

app.post('/feedback', async (req, res) => {
    const { email, message, name } = req.body;
    try {
        await sendFeedback(email, message, name);
        res.status(200).json({ message: "Feedback sent" });
    } catch (e) {
        res.status(500).json({ error: 'An error occurred while processing your request' });

    }
});

app.post('/verify', async (req, res) => {
    const { email, verificationCode } = req.body;
    try {
        const user = await userModel.findOneAndUpdate(
            { email, verificationCode },
            { $set: { isVerified: true }, $unset: { verificationCode: "" } },
            { new: true }
        );
        if (!user) {
            return res.status(404).json({ error: 'Invalid verification code' });
        }
        res.status(200).json({ message: 'Account verified successfully' });
    } catch (e) {
        console.error('Error:', e);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
});
app.post("/upload", upload.single("file"), async (req, res) => {
    try {
        const file = req.file;
        const email = req.body.email;
        const title = req.body.title;
        if (!file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        console.log("File received:", file);
        const filename = file.originalname || `image_${Date.now()}`;
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: "fyp_storage",
                    resource_type: "image",
                    public_id: filename,
                    chunk_size: 20 * 1024 * 1024,
                },
                (error, result) => (error ? reject(error) : resolve(result))
            );
            uploadStream.end(file.buffer);
        });
        const newImage = new imageModel({
            url: result.secure_url,
            sender: email,
            title: title,
            date: new Date(),
        });
        await newImage.save();
        res.status(201).json({
            success: true,
            message: "Image uploaded successfully",
            imageUrl: result.secure_url,
            filename,
        });
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
});
app.post('/forgotpassword', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.verificationCode = verificationCode;
        await user.save();
        await sendVerificationCode(email, verificationCode);
        return res.status(200).json({ message: 'Check your email for an OTP!' });
    } catch (error) {
        return res.status(500).json({ error: 'Server error. Please try again later.' });
    }
});
app.post('/verifyforgotpassword', async (req, res) => {
    const { email, verificationCode, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await userModel.findOneAndUpdate(
            { email, verificationCode },
            { $set: { password: hashedPassword }, $unset: { verificationCode: "" } },
            { new: true }
        );
        if (!user) {
            return res.status(404).json({ error: 'Invalid verification code' });
        }
        res.status(200).json({ message: 'Account verified successfully' });
    } catch (e) {
        console.error('Error:', e);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
});


mongoose.connect(mongoURI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log('Could not connect to MongoDB', err));

app.listen(port, () => {
    console.log('server started');
})




