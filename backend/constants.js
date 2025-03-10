
const successGoogleLogin = (req, res) => {
    if (!req.user) {
        return res.redirect('/failure');
    }
    const email = req.user.email;
    res.redirect(`https://blemish-bot.vercel.app/chat?email=${encodeURIComponent(email)}`);
};

const failureGoogleLogin = (req, res) => {
    res.status(500).json({ error: 'Error while logging in' });
}
module.exports = {
    successGoogleLogin, 
    failureGoogleLogin,
}