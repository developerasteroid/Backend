const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user:process.env.MAILER_EMAIL,
        pass:process.env.MAILER_PASSWORD
    }
});

// transporter verification
transporter.verify((error, success) => {
    if (error) {
      console.log(error);
    } else {
      console.log(`Ready to send Email Messages: ${success}`);
    }
});


const SendMail = (from, to, subject, html) => {
    //Email Data
    const mailOptions = {
       from: from,
       to: to,
       subject: subject,
       html: html
   };
   // Sending email
   
   return new Promise((resolve, reject) => {
       transporter.sendMail(mailOptions, (error, info) => {
           if (error) {
               reject(error);
           } else {
               resolve(info);
               // res.send('Email sent successfully');
           }
       });
   });

}

module.exports = SendMail;