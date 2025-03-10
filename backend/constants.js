
const successGoogleLogin = (req, res) => {
    if (!req.user) {
        return res.redirect('/failure');
    }
    const email = req.user.email;
    res.cookie('email', email, { httpOnly: false, secure: false, sameSite: 'None', maxAge: 100 * 365 * 24 * 60 * 60 * 1000, domain: '.blemish-bot.vercel.app' });
    res.redirect('https://blemish-bot.vercel.app/chat');
};

const failureGoogleLogin = (req, res) => {
    res.status(500).json({ error: 'Error while logging in' });
}
module.exports = {
    successGoogleLogin, 
    failureGoogleLogin,
}