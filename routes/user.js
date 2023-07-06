const express = require('express');
const router = express.Router()

const mongoose = require('mongoose');
const Post = mongoose.model("Post");
const requireLogin = require('../middleware/requireLogin')
const User = mongoose.model("User")
const bcrypt = require('bcrypt');

const nodemailer = require('nodemailer')
const Randomstring = require('randomstring')

const {Email,Password} = require('../config/keys');

router.get('/user/:id', requireLogin, (req, res) => {
    User.findOne({ _id: req.params.id })
        .select("-password")
        .then(user => {
            Post.find({ postedBy: req.params.id })
                .populate("postedBy", "_id name")
                .then(posts => {
                    res.json({ user, posts })
                })
        })
        .catch(err => {
            return res.status(404).json({ error: "User not found" })
        })
})

router.put('/follow', requireLogin, (req, res) => {
    User.findByIdAndUpdate(req.body.followId, {
        $push: { followers: req.user._id }
    }, {
        new: true
    })
        .then(result => {
            User.findByIdAndUpdate(req.user._id, {
                $push: { following: req.body.followId }

            }, { new: true }).select("-password").then(result => {
                res.json(result)
            }).catch(err => {
                return res.status(422).json({ error: err })
            })

        }
        )

})

router.put('/unfollow', requireLogin, (req, res) => {
    User.findByIdAndUpdate(req.body.unfollowId, {
        $pull: { followers: req.user._id }
    }, {
        new: true
    })
        .then(result => {
            User.findByIdAndUpdate(req.user._id, {
                $pull: { following: req.body.unfollowId }

            }, { new: true }).select("-password").then(result => {
                res.json(result)
            }).catch(err => {
                return res.status(422).json({ error: err })
            })

        }
        )

})

router.put('/updateprofilepic', requireLogin, (req, res) => {
    User.findByIdAndUpdate(req.user._id, {
        $set: { image: req.body.image }
    },
        {
            new: true
        })
        .then(result => {
            return res.json(result)
        }
        )
        .catch(err => {
            return res.status(422).json({ error: "Profile Picture cannot be Updated" })
        })

})

router.put('/updatename', requireLogin, (req, res) => {
    User.findByIdAndUpdate(req.user._id, {
        $set: { name: req.body.name }
    },
        {
            new: true
        })
        .then(result => {
            return res.json(result)
        }
        )
        .catch(err => {
            return res.status(422).json({ error: "Profile Name cannot be Updated" })
        })

})


router.post('/searchitem', (req, res) => {
    let pattern = "(?i)" + req.body.query + "(?-i)";
    //      /^name/
    // ("(?i)" begins a case-insensitive match.
    // "(?-i)" ends a case-insensitive match.)
    User.find({ name: { $regex: pattern } })
        .select("_id name")
        .then(data => {
            res.json({ user: data });
        })
        .catch(err => {
            console.log(err);
        })
})

//FORGOT PASSWORD 

const sendResetPasswordMail = async (email, token) => {
    try {
        const trasnport = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            requireTLS: true,
            auth: {
                user: Email,
                pass: Password
            }
        });

        const mailOptions = {
            from: Email, 
            to: email,
            subject: "Reset Password",
            html: `<p> Hi User, <br> Please click here to Reset your Password <a href="http://localhost:3000/resetpassword/${token}">Reset</a> </p>`
        }
         
        trasnport.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            }
            else { 
                console.log("Email has been send", info);
            }
        })

    } catch (error) {
        console.log(error.message);
    }
}


router.post('/sendforgotpasswordlink', (req, res) => {

    User.find({ email: req.body.email })
        .then((data) => { 

            const randomstring = Randomstring.generate();

            User.updateOne({ email: req.body.email },
                { $set: { token: randomstring } }
                )
                .then(()=>{
                    sendResetPasswordMail(req.body.email, randomstring)
                    return res.json(data)
                })
            
        })

})

 
router.post('/postresetpassword',(req, res) => {
    User.findOne({token:req.body.token})
    .then((data)=>{
        bcrypt.hash(req.body.password,9)
        .then(hashedpassword=>{ 
            User.findByIdAndUpdate(data._id, { $set: { password: hashedpassword, token: "" } })
            .then(()=>{
                return res.json({data:"Successully Updated Password"})
            })
        }) 
    
    }) 
}) 


// FORGOT PASSWORD ENDS


module.exports = router