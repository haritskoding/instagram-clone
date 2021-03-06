const express = require('express');
const router = express.Router()
const mongoose = require('mongoose')
const User = mongoose.model("User")
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('../keys')
const requireLogin = require('../middleware/requireLogin')
router.get('/', (req, res) => {
    res.send("hello")
})

router.get('/protected',requireLogin, (req, res) => {
    res.send("hello user")
})

router.post('/signup', (req, res) => {
    const { name, email, password } = req.body;
    if (!email || !password || !name) {
        return res.status(422).json({ error: "Please add all the fields" })
    }
    // res.json({ message: "successfully send" })
    User.findOne({ email: email })
        .then((SavedUser) => {
            if (SavedUser) {
                return res.status(422).json({ error: "User already exists with that email" })
            }
            bcrypt.hash(password, 12)
                .then(hashedPassword => {
                    const user = new User({
                        email,
                        password: hashedPassword,
                        name
                    })
                    user.save()
                        .then(user => {
                            res.json({ message: "saved successfully" })
                        })
                        .catch(err => {
                            console.log(err)
                        })
                })

        })
        .catch(err => {
            console.log(err)
        })
})

router.post('/signin', (req, res) => {
    const { email, password } = req.body
    if (!email || !password) {
        return res.status(422).json({ error: "please add email or passord" })
    }
    User.findOne({ email: email })
        .then(savedUser => {
            if (!savedUser) {
                return res.status(422).json({ error: "Invaalid Email or password" })
            }
            bcrypt.compare(password, savedUser.password)
                .then(doMatch => {
                    if (doMatch) {
                        // res.json({ message: "Successfullly signed in" })
                        const token = jwt.sign({ _id: savedUser._id }, JWT_SECRET)
                        res.json({ token })
                    } else {
                        return res.status(422).json({ error: "Invaalid Email or password" })
                    }
                })
                .catch(err => {
                    console.log(err)
                })
        })
})

module.exports = router