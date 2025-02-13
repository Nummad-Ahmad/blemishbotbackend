const { transporter } = require("./email.config");

const sendVerificationCode = async (email, verificationCode) => {
    try {
        const response = await transporter.sendMail({
            from: '"Blemishbot" <nummad222@gmail.com>',
            to: email,
            subject: 'Verify your email',
            text: "Verify your email",
            html: `Verify your email to get started. Your verification code is ${verificationCode}.`,
        });
        console.log('Email sent', response);
    } catch (e) {
        console.log(e);
    }
}

const sendFeedback = async (email, message, name) => {
    try {
        const response = await transporter.sendMail({
            from: '"Blemishbot" <nummad222@gmail.com>', 
            to: "nummad222@gmail.com",
            subject: 'User feedback',
            text: "User feedback",
            html: message,
        });
        console.log('Email sent', response);
    } catch (e) {
        console.log(e);
    }
}


module.exports = { sendVerificationCode, sendFeedback };