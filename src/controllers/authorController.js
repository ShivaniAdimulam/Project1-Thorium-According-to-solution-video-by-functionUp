const AuthorModel= require("../models/authorModel")
const jwt = require("jsonwebtoken");
const authorModel = require("../models/authorModel");

const isValid = function(value){
  if(typeof value === 'undefined' || value===null) return false
  if(typeof value === 'string' && value.trim().length ===0) return false
  return true;
}

const isValidTitle = function(title){
   return['Mr','Mrs','Miss'].indexOf(title) !== -1
}

const isValidRequestBody = function(requestBody){
  return Object.keys(requestBody).length>0
}

const createAuthor = async function (req, res) {
  //You can name the req, res objects anything.
  //but the first parameter is always the request 
  //the second parameter is always the response
  try {
      let requestBody = req.body;
      
      if(!isValidRequestBody(requestBody)){
        res.status(400).send({status:false, message:'invalid request parameters.please provide blog details'})
        return
      }

      const {fname,lname,title,email,password} = requestBody;

      if (!isValid.fname) {return res.status(400).send({status:false, msg:"first name is required"})}
      if (!isValid.lname) {return res.status(400).send({status:false, msg:"last name is required"})}
      if (!isValid.email) {return res.status(400).send({status:false, msg:"email is required"})}
      if (!isValid.password) {return res.status(400).send({status:false, msg:"password is required"})}

      const isEmailAlreadyUsed = await authorModel.findOne({email});
      if(isEmailAlreadyUsed){
        res.status(400).send({status:false, message:'${email} is already registerd email address'})
        return
      }
      const emailToValidate = req.body.email;
      const emailRegexp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

      let valid = emailRegexp.test(req.body.email);

      const passwordtovalidate= req.body.password;
      const passRegex= /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
      let passvalid= passRegex.test(passwordtovalidate);

      let authorData = {fname,lname,title,email,password}

      if (valid == true && passvalid== true) {
          let savedData = await AuthorModel.create(authorData);

          res.status(200).send({ msg:'author created successfully',data: savedData });
      } else {
          res.send("please enter valid email id or password")
      }
  }
  catch (error) {
      console.log(error)
      res.status(500).send({ msg: error.message })
  }
};



const loginAuthor = async function (req, res) {
  try{
    let email = req.body.email;
    let password = req.body.password;
    let requestBody = req.body

    if(!isValidRequestBody(requestBody)){
      res.status(400).send({status:false, message:'invalid request parameters.please provide blog details'})
      return
    }

    if (!isValid.email) {return res.status(400).send({status:false, msg:"email is required"})}

    const emailRegexp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    if(emailRegexp.test(req.body.email)){
      res.status(400).send({status:false, message:'email should be va;lid email address'}) 
      return
    }


    if (!isValid.password) {return res.status(400).send({status:false, msg:"password is required"})}

  
    let author = await AuthorModel.findOne({ email: email, password: password });
    if (!author)
      return res.status(401).send({
        status: false,
        msg: "username or the password is not corerct",
      });
  
    // Once the login is successful, create the jwt token with sign function
    // Sign function has 2 inputs:
    // Input 1 is the payload or the object containing data to be set in token
    // The decision about what data to put in token depends on the business requirement
    // Input 2 is the secret
    // The same secret will be used to decode tokens
    let token = jwt.sign(
      {
        authorId: author._id.toString(),
        batch: "thorium",
        
      },
      "Functionup"
    );
    res.setHeader("x-api-key", token);
    res.status(200).send({ status: true, data: token });
  }catch(err){
    console.log(err)
        res.status(500).send({ msg: err.message })
  }
  }; 


  module.exports.loginAuthor=loginAuthor
  module.exports.createAuthor = createAuthor