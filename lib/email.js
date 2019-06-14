var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

exports.sendEmail = function(emailData){
    var transport = nodemailer.createTransport(smtpTransport({
        service: 'Gmail',
        auth: {
            user: 'webdacoder@gmail.com',
            pass: 'av@dacoder'
        }
    }))
     var mailOptions = {
        to: emailData.to,
        from: "webdacoder@gmail.com",
        subject: emailData.subject,
        text: emailData.text
    };
    transport.sendMail(mailOptions, function(err) {
        //callback(err , 'done');
    });
}
