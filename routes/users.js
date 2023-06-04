var express = require('express');
var router = express.Router();
const Models = require('./../models');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = Models.User;
const checkUserAccess = require('../middlewares/checkUserAccess.js');
dotenv.config();

router.post('/', checkUserAccess, async function(req, res, next) {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.post('/registration', async(req, res, next)=>{
  const user = await User.findOne({ where : {email : req.body.email }});
  if (user === null) {
    const salt = await bcrypt.genSalt(10);
    var usr = {
      first_name : req.body.name,
      status : 'unblocked',
      email : req.body.email,
      password : await bcrypt.hash(req.body.password, salt)
    };
    created_user = await User.create(usr);
    res.status(201).json({message: 'Registration is successful, now login is required'});
  } else {
    res.status(409).json({ error: "User with this Email already exists" });
  }
});

router.post('/login', async(req,res,next)=>{
  const user = await User.findOne({ where : {email : req.body.email }});
  if(user){
     const password_valid = await bcrypt.compare(req.body.password,user.password);
     if(password_valid){
        const isUnblocked = user.status === 'unblocked'
        if(isUnblocked) {
          token = jwt.sign({ "id" : user.id,"email" : user.email,"first_name":user.first_name },process.env.SECRET);
          user.lastLogin = new Date();
          await user.save();
          res.status(200).json({ token : token });
        } else {
          res.status(403).json({ error : 'Sorry, you have been blocked and not allowed to login' });
        }
     } else {
       res.status(400).json({ error : "Password Incorrect" });
     }
   
   }else{
     res.status(404).json({ error : "User does not exist" });
   }
});

router.put('/update-status',  async (req, res) => {
  const { userIds, status } = req.body;
  try {
    const updatedUsers = await User.update(
      { status},
      { where: { id: userIds } }
    );
    res.json({ updatedCount: updatedUsers[0] });
  } catch (error) {
    console.error('Error blocking user:', error);
    res.status(500).json({ error: 'Failed to block user' });
  }
});

router.delete('/delete',  async (req, res) => {
  const { userIds } = req.body;
  try {
    await User.destroy({ where: { id: userIds } });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;