const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'bobirok@abv.bg',
        subject: 'Welcome onboard!',
        text: 'Hey, ' + name + ' welcome to the application for notes!'
    })
}

const sendCancelationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'bobirok@abv.bg',
        subject: 'We are sorry to hear that you want to quit!',
        text: 'Hey, ' + name + '. We are sorry you hear that you would like to quit, is ther something we could have done to keep you with us?'
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
}