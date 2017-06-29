var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model('User');

var avatars = require('./avatars').all();

exports.signup = function (req, res) {
    "use strict";
    if (!req.body.name || !req.body.email || !req.body.password) {
        return res.redirect('/#!/signup?error=incomplete');
    }

    User.findOne({
        email: req.body.email
    }).exec(function (err, existingUser) {
        if (err) {
            return res.redirect('/#!/signup');
        }

        if (!existingUser) {
            var user = new User(req.body);
            user.avatar = avatars[user.avatar];
            user.provider = 'local';
            user.save(function (err) {
                if (err) {
                    return res.render('/#!/signup?error=unknown', {
                        errors: err.errors,
                        user: user
                    });
                }

                var token = user.generateToken();
                res.status(201).send({ token: token });
            });
        } else {
            return res.redirect('/#!/signup?error=existinguser');
        }
    });
};