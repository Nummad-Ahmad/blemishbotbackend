
const successGoogleLogin = (req, res) => {
    if(!req.user){
        res.redirect('/failure');
    }
    console.log(req.user.email);
    res.status(200).json({ message: 'Login successful', user: req.user });
}
const failureGoogleLogin = (req, res) => {
    res.status(500).json({ error: 'Error while logging in' });
}
module.exports = {
    successGoogleLogin, 
    failureGoogleLogin,
}