const express = require('express');
const router = express.Router()

const mongoose = require('mongoose');
const Post = mongoose.model("Post");
const requireLogin = require('../middleware/requireLogin')


router.get('/allpost', (req, res) => {
    Post.find()
        .populate("postedBy", "_id name")
        .sort('-createdAt')
        .then(posts => {
            res.json({ posts: posts })
        })
        .catch(err => {
            console.log(err); 
        })
})
 

router.get('/getfollowingsposts',requireLogin, (req, res) => {
    Post.find({postedBy:{$in:req.user.following}})
        .populate("postedBy", "_id name")
        .sort('-createdAt')
        .then(posts => {
            res.json({ posts: posts }) 
        })
        .catch(err => {
            console.log(err);
        }) 
}) 
 


router.post('/createpost', requireLogin, (req, res) => {
    const { title, body, photo } = req.body

    if (!title || !body || !photo) {
        return res.status(422).json({ error: "Please enter title and body" })
    }

    req.user.password = undefined // to not send password here   
    const post = new Post({
        title: title,
        body: body,
        photo: photo,
        postedBy: req.user //from JWT verfication
    })

    post.save().then(result => {
        res.json({ post: result })
    })
        .catch(err => {
            console.log(err);
        })
})
 
router.get('/mypost', requireLogin, (req, res) => {
    Post.find({ postedBy: req.user._id })
        .populate("postedBy", "_id name")
        .then(mypost => {
            res.json({ mypost: mypost })
        })
        .catch(err => {
            console.log(err);
        })
})
 

router.get('/post/:id', requireLogin, (req, res) => {
    Post.findOne({ _id: req.params.id })
       .populate("postedBy", "_id name image")
        .then(post => {
            res.json({ post: post })
        })
        .catch(err => { 
            console.log(err);
        })
})
 

router.put('/comment', requireLogin, async(req, res) => {
    const comment = {
        name:req.user.name,
        text:req.body.text,
        postedBy:req.user._id
    }
    Post.findByIdAndUpdate(req.body.postId,
        {
            $push: { comments: comment }  
        },
        {
            new: true  
        })
        .populate("comments.postedBy","_id name")
        .then((result)=>{             
                res.json(result)
        })  

}) 

router.put('/like', requireLogin, async(req, res) => {
    
    Post.findByIdAndUpdate(req.body.postId,
        {
            $push: { likes: req.user._id }
        },
        {
            new: true
        }).then((result)=>{             
                res.json(result)
        })

})

router.put('/unlike', requireLogin, (req, res) => {
    Post.findByIdAndUpdate(req.body.postId,
        {
            $pull: { likes: req.user._id }
        },
        {  
            new: true
        }).exec((err,result)=>{
            if(err)
            {
                return res.status(422).json({error:err})
            }
            else
            {   
                res.json(result)
            }
        })

})
                                                                                  

router.delete('/deletepost/:postId',requireLogin,(req,res)=>{
    Post.deleteOne({_id :req.params.postId})
    .then(post=>{ 
            res.json({post});
    })
    .catch(err=>{
        console.log(err); 
    })
}) 
 

module.exports = router 

