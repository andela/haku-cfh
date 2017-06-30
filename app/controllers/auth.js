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

exports.login = function (req, res) {
    "use strict";
    if (!req.body.email || !req.body.password) {
        return res.status(400).send("You must send the username and the password");
    }

    passport.authenticate('local', function (err, user, info) {
        if (err) {
            return res.status(400).send({
                message: 'Error occurred'
            });
        }

        // If a user is found
        if (user) {
            var token = user.generateToken();
            res.status(200).json({ token: token });
        } else {
            // If user is not found
            return res.redirect('/#!/signin?error=invalid');
        }
    })(req, res);
};