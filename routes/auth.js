const express = require('express');
const router = express.Router()

const mongoose = require('mongoose');
const User = mongoose.model("User");

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const {JWT_SECRET} = require('../config/keys');
const requireLogin = require('../middleware/requireLogin')



router.get('/protected',requireLogin,(req,res)=>{
    res.send("Jai Idana Maa Jai Awari Maa");
})

router.post('/signup',(req,res)=>{
  const {name,email,password,image } = req.body

  if(!name || !email || !password)
  {
    res.status(422).json({error:"Please add all the fields"});
  }
    
  User.findOne({email:email})
  .then((savedUser)=>{
    if(savedUser) 
    {
        return res.status(422).json({error:"user already exists with that emaail"});
    }

    bcrypt.hash(password,9)
      .then(hashedpassword=>{ 
        const user = new User({
          email:email,
          password:hashedpassword,
          name:name,
          image:image
      })

      user.save()
      .then(user=>{
          res.json({message:"saved data of the user"});
      })
      .catch(err=>{
          console.log(err);
      })
    })

  })
  .catch(err=>{
     console.log(err); 
  })

})

router.post('/signin',(req,res)=>{
  const {email,password} = req.body

  if(!email || !password)
  {
     return res.status(422).json({error:"please add email and password"})
  } 
  User.findOne({email:email})
  .then(savedUser=>{
    if(!savedUser)
    {
      return res.status(422).json({error:"wrong email and password"})
    }
    bcrypt.compare(password,savedUser.password)
    .then(doMatch=>{
      if(doMatch)
      {

        const token = jwt.sign({_id:savedUser._id},JWT_SECRET)
        const {_id,name,email,followers,following,image} = savedUser
        res.json({token:token,user:{_id,name,email,followers,following,image}})

      } 
      else
      {
        return res.status(422).json({error:"wrong email and password"})
      }
    })
    .catch(err=>{
        console.log(err);
    })
  })

})

module.exports  = router