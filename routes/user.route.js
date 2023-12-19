const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
const  jwt  = require('jsonwebtoken');
const bcrypt = require('bcrypt');


//Register

router.post('/register', async (req, res, )=> {
    const{email,password,role,firstname,lastname,isActive,avatar}=req.body;
    
    const user = await User.findOne({ email })
    if (user) return res.status(404).send({ success: false, message: "User already exists" })

    const salt=await bcrypt.genSalt(10);
    const hash=await bcrypt.hash(password,salt);
    
    const newUser=new User({
      email:email,
      password:hash,
      role:role||"user",
      firstname:firstname ||"myfirstname",
      lastname:lastname||"mylastname",
      isActive:isActive ||true,
      avatar:avatar||"avatar.jpg"
        });
    
    try {
           await newUser.save();
           return res.status(201).send({ success: true, message: "Account created successfully", user: newUser })
 
       } catch (error) {
           res.status(409).json({ message: error.message });
       }
  
});

// se connecter
router.post('/login', async (req, res) =>  {
  let expires = Date.now() + 1
  try {
      let { email, password } = req.body

      if (!email || !password) {
          return res.status(404).send({ success: false, message: "All fields are required" })
      }

       const user = await User.findOne({email});

         const isMatch=await bcrypt.compare(password,user.password);
           if(!isMatch) {res.status(400).json({msg:'mot de passe incorrect'});
           return} ;
  
      if (!user) {

          return res.status(404).send({ success: false, message: "Account doesn't exists" })

      } else {

    let isCorrectPassword = await bcrypt.compare(password, user.password)
     if (isCorrectPassword) {

              delete user._doc.password
              if (!user.isActive) return res.status(200).send({ success: false, message: 'Your account is inactive, Please contact your administrator' })

              const token = generateAccessToken(user);
 
             const refreshToken = generateRefreshToken(user);
       
          

              return res.status(200).send({ success: true, user, token,refreshToken,expiresIn: expires  })

          } else {

              return res.status(404).send({ success: false, message: "Please verify your credentials" })

          }

      }

  } catch (err) {
      return res.status(404).send({ success: false, message: err.message })
  }

 });

//Access Token 
const generateAccessToken=(user) =>{
    return jwt.sign({user}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '60s' });
  }

  // Refresh
function generateRefreshToken(user) {
    return jwt.sign({user}, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1y' });
  }
  
  //Refresh Route
  
  router.post('/refreshToken', async (req, res, )=> { 
    let expires = Date.now() + 3600 
  const refreshtoken = req.body.refreshToken;
  console.log("REFRESH : ",refreshtoken);
    if (!refreshtoken) {
     return res.status(404).json({ message: 'Token Not Found' });
        }
    else {
        jwt.verify(refreshtoken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
          if (err) {
            return res.status(406).json({ message: 'Unauthorized' });
          }
          else {
           const token = generateAccessToken(user);
 
           const refreshToken = generateRefreshToken(user);
   
          res.status(200).json({
            token,
           refreshToken,
           expiresIn: expires
         })
            }
        });
       }
 
  
  });


  /**
 * as an admin i can disable or enable an account 
 */
  router.put('/status/edit',  async (req, res) =>  {
    try {

        let { idUser } = req.body
        let user = await User.findById(idUser).select('+isActive')
        user.isActive = !user.isActive
        user.save()
        res.status(200).send({ success: true, user })
    } catch (err) {
        return res.status(404).send({ success: false, message: err })
    }
   })

// afficher la liste des utilisateurs.
router.get('/', async (req, res, )=> {
  try {
      const users = await User.find().select("-password");              
      res.status(200).json(users);
  } catch (error) {
      res.status(404).json({ message: error.message });
  }

});

  module.exports = router;


