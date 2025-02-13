const { transporter } = require("./email.config");

const sendVerificationCode = async (email, verificationCode) => {
    try{
        const response = await transporter.sendMail({
        from: '"Blemishbot" <nummad222@gmail.com>', // sender address
        to: email, // list of receivers
        subject: 'Verify your email', // Subject line
        text: "Verify your email", // plain text body
        html: `Verify your email to get started. Your verification code is ${verificationCode}.`, // html body
    }); 
    console.log('Email sent', response);
    }catch(e){
        console.log(e);
    }
}

const sendFeedback = async (email, message) => {
    try{
        const response = await transporter.sendMail({
        to: '"Blemishbot" <nummad222@gmail.com>', 
        from: email, 
        subject: 'User feedback', 
        text: "User feedback",
        html: message,
    }); 
    console.log('Email sent', response);
    }catch(e){
        console.log(e);
    }
}


module.exports = { sendVerificationCode, sendFeedback };