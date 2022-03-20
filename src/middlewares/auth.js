const {nextTick }= require("process");
const BlogModel = require("../models/blogModel")
const jwt = require("jsonwebtoken");
 
function mid (req,res,next) {

let token= req.headers['x-api-key'];
if(!token) return res.send({ status: false, msg: "token must be present" });
let validToken= jwt.verify(token,'Functionup')
if(!validToken){
    res.status(401).send({status: false,msg:"Invalid token"})
}
next()

}

const authorisation=async function mid1(req,res,next){
    try{
    let token= req.headers['x-api-key'];
    let validToken= jwt.verify(token,'Functionup')
    if(!validToken) return res.status(401).send({error:"You are not authenticated user"})
    let blogId = req.params.blogId
    
    if( !blogId )   blogId = req.query.blogId
    
    if( !blogId)   return res.status(400).send({error : " Please , enter blogId "})
    const data = await BlogModel.find({ _id : blogId})
    if(!data)  return res.status(400).send({error : "Invalid blogId"})


    let authorId= await BlogModel.findById(blogId).select({authorId:1})
    console.log(authorId)
    let Blogtobemodified=authorId.authorId
    console.log(Blogtobemodified)
    let Authorloggedin=validToken.authorId
    console.log(Authorloggedin)

     //let userId= req.query.authorId
    // if(userId!=Blogtobemodified) {return res.status(403).send({msg:"Authorisation failed"})}

    
    if(Blogtobemodified!=Authorloggedin){return res.status(403).send({msg:"Authorisation failed"})}

    // let authorId = await BlogModel.find({ _id : blogId }).select({ authorId : 1 , _id : 0})
    
    // authorId = authorId.map( x => x.authorId)
    
    // if ( validToken.authorId != authorId ) {
    //     return res.status(403).send({ error : " LogedIn author is not authorize to change with requested userid"})
    // }
    
    next();
    }catch(err){
        res.status(500).send({error:err.message})
    }


}


module.exports.mid=mid
module.exports.authorisation=authorisation


// const authentication = function ( req , res , next ) {
//     let isToken = req.headers["x-api-key"]
//     if ( !isToken ) {
//         return res.status(400).send({ status: false, msg: "token must be present" });
//     }
 
//     let decodedToken = jwt.verify(isToken, "secuiretyKeyToCheckToken");
//     if ( !decodedToken ) {
//         return res.status(401).send({ status: false, msg: "token is invalid" });
//     }

//     next();

// }


// const authorization = async function ( req , res , next ) {
//     let isToken = req.headers["x-api-key"]
 
//     let decodedToken = jwt.verify(isToken, "secuiretyKeyToCheckToken");

//     let blogId = req.params.blogId
//     if( !blogId )   blogId = req.query.blogId
//     if( !blogId )   return res.status(400).send({error : " Please , enter blogId"})

//     const data = await blogModel.find({ _id : blogId})
//     if(!data)  return res.status(400).send({error : "Invalid blogId"})

//     let authorId = await blogModel.find({ _id : blogId }).select({ authorId : 1 , _id : 0})
//     authorId = authorId.map( x => x.authorId)

//     if ( decodedToken.authorId != authorId ) {
//         return res.status(403).send({ error : " LogedIn author is not authorize to change with requested userid"})
//     }
    
//     next();

// }


// module.exports.authorization = authorization
// module.exports.authentication = authentication




//|| userId!=Authorloggedin