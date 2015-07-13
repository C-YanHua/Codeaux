'use strict';

var appMongoose = require('../config/lib/mongoose');
var config = require('../config/config');
var mongoose = require('mongoose');
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport(config.mailer.options);
// PUT reset link here.
var link = 'reset link here';

appMongoose.connect(function() {
  var User = mongoose.model('User');

  User.find().exec(function(err, users) {
    if (err) {
      throw err;
    }

    var email = {
      from: 'noreply@xyz.com',
      subject: 'Security update'
    };

    for (var i = 0; i < users.length; i++) {
      var text = [
      'Dear ' + users[i].displayName,
      '\n',
      'We have updated our password storage systems to be more secure and more efficient, ',
      'please click the link below to reset your password so you can login in the future.',
      link,
      '\n',
      'Thanks,',
      'The Team'
      ].join('\n');

      email.to = users[i].email;
      email.text = text;
      email.html = text;

      transporter.sendMail(email, function(err) {
        if (err) {
          console.log('Error: ', err);
          console.log('Could not send email for ', users[i].displayName);
        } else {
          console.log('Sent reset password email for ', users[i].displayName);
        }
      });
    }

    console.log('Sent all emails');
    process.exit(0);
  });
});
