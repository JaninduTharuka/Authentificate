// require('dotenv').config();
const express = require('express');
const ejs = require('ejs');
const mongoose = require('mongoose');
// const encrypt = require('mongoose-encryption');
// md5 = require('md5');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

mongoose.connect('mongodb://localhost:27017/userDB')
    .then(() => console.log('Connected to Database'))
    .catch(err => console.error('Error connecting to Database...:', err));


const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});


// userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password'] });

const User = mongoose.model('User', userSchema);


app.route('/')
    .get((req, res) => {
        res.render('home');
    });

app.route('/register')
    .get((req, res) => {
        res.render('register');
    })
    .post((req, res) => {
        bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
            const newUser = new User({
                email: req.body.username,
                password: hash
            });
            newUser.save()
                .then(() => res.render('secrets'))
                .catch(err => res.send(err));
        });
    });

app.route('/login')
    .get((req, res) => {
        res.render('login');
    })
    .post((req,res) => {
        const username = req.body.username;
        const password = req.body.password;
        console.log(username,password)
        User.findOne({ email: username })
            .then(foundUser => {
                if (foundUser) {
                    console.log(foundUser);
                    bcrypt.compare(password, foundUser.password, function(err, result) {
                        console.log(result);
                        console.log('abcd')
                        if (result) {
                            res.render('secrets');
                        } else {
                            res.send('Incorrect password');
                        }
                    });
                } else {
                    res.send('User not found');
                }
            })
            .catch(err => res.send(err));
    })

app.listen(3000, () => {
    console.log('Server started on port 3000');
});