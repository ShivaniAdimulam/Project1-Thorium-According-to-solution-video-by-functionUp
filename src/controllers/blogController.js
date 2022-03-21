const { count } = require("console")
const BlogModel = require("../models/blogModel")
const AuthorModel = require("../models/authorModel");
const { default: mongoose } = require("mongoose");
//const blogModel = require("../models/blogModel");


// const createAuthor = async function (req, res) {
//     //You can name the req, res objects anything.
//     //but the first parameter is always the request 
//     //the second parameter is always the response
//     try {
//         let data = req.body;
//         if (!data.fname) {return res.status(400).send({status:false, msg:"first name is required"})}
//         if (!data.lname) {return res.status(400).send({status:false, msg:"last name is required"})}
//         if (!data.email) {return res.status(400).send({status:false, msg:"email is required"})}
//         if (!data.password) {return res.status(400).send({status:false, msg:"password is required"})}
//         const emailToValidate = req.body.email;
//         const emailRegexp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

//         let valid = emailRegexp.test(req.body.email);

//         const passwordtovalidate= req.body.password;
//         const passRegex= /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
//         let passvalid= passRegex.test(passwordtovalidate);

//         if (valid == true && passvalid== true) {
//             let savedData = await AuthorModel.create(data);

//             res.status(200).send({ msg: savedData });
//         } else {
//             res.send("please enter valid email id or password")
//         }
//     }
//     catch (error) {
//         console.log(error)
//         res.status(500).send({ msg: error.message })
//     }
// };

const isValid = function(value){
    if(typeof value === 'undefined' || value===null) return false
    if(typeof value === 'string' && value.trim().length ===0) return false
    return true;
}

const isValidRequestBody = function(requestBody){
    return Object.keys(requestBody).length>0
}

const isValidObjectId = function(objectId){
    return mongoose.Types.ObjectId.isValid(objectId)
}

const createBlog = async function (req, res) {
    try {
        
        let requestBody = req.body
        let authorid = requestBody.authorId
        
       
        

        if (!authorid) return res.status(400).send("Request is not valid as the author id (details) required")

        let author = await AuthorModel.findById(authorid)
        if (!author) return res.status(400).send("Request is not valid as no author is present with the given author id")

        if(!isValidRequestBody(requestBody)){
            res.status(400).send({status:false, message:'invalid request parameters.please provide blog details'})
            return
        }

        const {title,body,authorId,tags,category,subcategory,isPublished} = requestBody

        if (!requestBody.title) {return res.status(400).send({status:false, msg:"title is required"})}

        if (!requestBody.body) {return res.status(400).send({status:false, msg:"body is required"})}
        if (!requestBody.authorId) {return res.status(400).send({status:false, msg:"authorId is required"})}

        if (!isValidObjectId(authorId)) {return res.status(400).send({status:false, msg:"${authorId} is not valid autorId"})}
        if (!requestBody.category) {return res.status(400).send({status:false, msg:"category is required"})}
       
        
        const blogData = {
            title,
            body,
            authorId,
            category,
            isPublished: isPublished ? isPublished :false,
            publishedAt: isPublished ? new Date() : null
        }

        if(tags){
            if(Array.isArray(tags)){
                blogData['tags'] = [...tags]
            }
            if(Object.prototype.toString.call(tags)=== "[object String]"){
                blogData['subcategory'] = [subcategory]
            }
        }


        let blogCreated = await BlogModel.create(blogData)
        return res.status(200).send({ message:'new blog created successfully' ,data: blogCreated })
        
    } catch (error) {
        console.log(error)
        res.status(500).send({ msg: error.message })
    }
}


const getBlogsData = async function (req, res) {
    try {
        let filterquery = { isDeleted: false, isPublished: true }
        let queryParams = req.query

        if(isValidRequestBody(queryParams)){
            const{authorId,category,tags,subcategory} = queryParams

            if(queryParams.authorId && isValidObjectId(authorId)){
                filterquery['authorId'] = authorId
            }

            if(isValid(category)){
                filterquery['category'] = category.trim()
            }

            if(isValid(tags)){
                const tagsArr =tags.trim().split(',').map(tag => tag.trim());
                filterquery['tags'] = {$all: tagsArr}
            }

            if(isValid(subcategory)){
                const subcatArr = subcategory.trim().split(',').map(subcat => subcat.trim());
                filterquery['subcategory'] = {$all: subcatArr}

            }
        }

        
        //let allBlogs = await BlogModel.find({ isDeleted: false,isPublished: true },{$or:[{category:category},{authorId:authorId},{tags:{$all:[tags]}},{subcategory:{$all:[subcategory]}}]}).populate("authorId")
        const blogs = await BlogModel.find(filterquery)
        
        if (Array.isArray(blogs) && blogs.length===0) {
        res.status(404).send({ msg: "No blog found", status: false })
        return
        }
        
        res.status(200).send({ msg: "blogs list",data: blogs, status: true })
    } catch (err) {
        console.log(err)
        res.status(500).send({ msg: err.message })
    }
}



const updateBlogs = async function (req, res) {
    try {
        let requestBody = req.body
        let authorIdFromToken = req.authorId
        let params = req.params
        let blogId = req.params.blogId

        if(!isValidObjectId(blogId)){
            res.status(400).send({status:false,msg:'${blogId} is not a valid blog id'})
            return
        }

        // if(!isValidObjectId(authorIdFromToken)){
        //     res.status(400).send({status:false,msg:'${authorIsFromToken} is not a valid token id'})
        //     return
        // }
        let blog = await BlogModel.findOne({ _id: blogId, isDeleted: false, deletedAt:null })

        if (!blog) {
            res.status(404).send({ msg: "no blog found" })
        }

        // if(blog.authorId.toString() !== authorIdFromToken){
        //     res.status(401).send({status:false, msg:'unauthorised access ,owner info doesnt match'})
        //     return
        // }

        if(!isValidRequestBody(requestBody)){
            res.status(200).send({status:true, msg:'no parameters passed,blog unmodified', data:blog})
            return
        }

        const {title,body,tags,category,subcategory,isPublished} = requestBody;

        const updatedBlogData={}

        if(isValid(title)){
            if(!Object.prototype.hasOwnProperty.call(updatedBlogData,'$set')) updatedBlogData['$set'] ={}

            updatedBlogData['$set']['title']=title
        }

        if(isValid(body)){
            if(!Object.prototype.hasOwnProperty.call(updatedBlogData,'$set')) updatedBlogData['$set'] ={}

            updatedBlogData['$set']['body']=body
        }

        if(isValid(category)){
            if(!Object.prototype.hasOwnProperty.call(updatedBlogData,'$set')) updatedBlogData['$set'] ={}

            updatedBlogData['$set']['category']=category
        }

        if(isPublished !== undefined){
            if(!Object.prototype.hasOwnProperty.call(updatedBlogData,'$set')) updatedBlogData['$set'] ={}
            updatedBlogData['$set']['isPublished']=isPublished
            updatedBlogData['$set']['publishedAt']=isPublished ? new Date() : null
        }

        if(tags){
            if(!Object.prototype.hasOwnProperty.call(updatedBlogData,'$addToset')) updatedBlogData['$addToset'] ={}

            if(Array.isArray(tags)){
                updatedBlogData['$addToSet']['tags']={ $each:[...tags]}
            }
            if(typeof tags === "string"){
                updatedBlogData['$addToSet']['tags']=tags
            }
        }

        if(subcategory){
            if(!Object.prototype.hasOwnProperty.call(updatedBlogData,'$addToset')) updatedBlogData['$addToset'] ={}

            if(Array.isArray(subcategory)){
                updatedBlogData['$addToSet']['subcategory']={ $each:[...subcategory]}
            }
            if(typeof subcategory === "string"){
                updatedBlogData['$addToSet']['subcategory']=subcategory
            }

        }
        
       const updatedBlog = await BlogModel.findOneAndUpdate({_id:blogId}, updatedBlogData,{new:true})

        res.status(200).send({msg:'blog updated successfully', data: updatedBlog })  

        // } else 
        
    } catch (err) {
        console.log(err)
        res.status(500).send({ msg: err.message })
    }
}



const deletePath = async function (req, res) {
    try {
        let blogId = req.params.blogId
        let authorIdFromToken= req.authorId

        if(!isValidObjectId(blogId)){
            res.status(400).send({status:false,msg:'${blogId} is not a valid blog id'})
            return

        }

        // if(!isValidObjectId(authorIdFromToken)){
        //     res.status(400).send({status:false,msg:'${authorIsFromToken} is not a valid token id'})
        //     return
        // }
        let blog = await BlogModel.findOne({_id:blogId, isDeleted:false,deletedAt:null})
        if (!blog) {
            res.status(404).send({ msg: "No Blog found" })
            return
            } 

        // if(blog.authorId.toString() !== authorIdFromToken){
        //         res.status(401).send({status:false, msg:'unauthorised access ,owner info doesnt match'})
        //         return
        //     }
        await BlogModel.findOneAndUpdate({_id:blogId},{$set:{isDeleted:true,deletedAt:new Date()}})
        res.status(200).send({status:true,msg:'blog deleted successfully'})
    } catch (err) {
        console.log(err)
        res.status(500).send({ msg: err.message })
    }
}



const deleteBlog = async function (req, res) {
    try{
        const filterquery = {isDeleted:false,deletedAt:null}
        let queryParams = req.query
        const authorIdFromToken = req.authorId
        // if(!isValidObjectId(authorIdFromToken)){
        //     res.status(400).send({status:false,msg:'${authorIsFromToken} is not a valid token id'})
        //     return  
        // }

        if(!isValidRequestBody(queryParams)){
            res.status(400).send({status:false,msg:'no query params received. aborting delete operation'})
            return
        }
        
        const {authorId,category,tags,subcategory,isPublished} = queryParams

        if(isValid(authorId) && isValidObjectId(authorId)){
            filterquery['authorId'] = authorId
        }

        if(isValid(category)){
            filterquery['category']=category.trim()
        }

        if(isValid(isPublished)){
            filterquery['isPublished']=isPublished
        }

        if(isValid(tags)){
            const tagsArr =tags.trim().split(',').map(tag => tag.trim());
            filterquery['tags'] = {$all: tagsArr}
        }

        if(isValid(subcategory)){
            const subcatArr = subcategory.trim().split(',').map(subcat => subcat.trim());
            filterquery['subcategory'] = {$all: subcatArr}

        }

        const blogs =await BlogModel.findOneAndUpdate(filterquery,{$set:{isDeleted:true,deletedAt:new Date()}});

        if (Array.isArray(blogs) && blogs.length===0) {
            res.status(404).send({ msg: "No blog found", status: false })
            }
            
        
        res.status(200).send({ msg: "successfully deleted",data: blogs, status: true })

    }catch(err){
        console.log(err)
        res.status(500).send({ msg: err.message })
    }

//    const data = req.query
//         console.log(data)

//         if (data=={}) return res.status(400).send({ error: "Please enter some data to campare" })

//         //const timeDate = moment()

//         const dataforUpdation = { ...data , isDeleted : true , deletedAt : Date.now()}

//         const result = await BlogModel.updateMany(data, dataforUpdation , { new: true })

//         if (!result) res.status(404).send({ error: " No data found" })

//         res.status(200).send({ data: result })
    // let category = req.query.category
    // let authorId = req.query.authorId
    // let tags = req.query.tags
    // let subcategory = req.query.subcategory
    // let isPublished = req.query.isPublished


    // let deleteblog = await BlogModel.findOneAndUpdate(
    //     { category: category }, //condition
    //     { isDeleted: true },  //ipdate in data
    //     { new: true } // new: true - will give you back the updated document // Upsert: it finds and updates the document but if the doc is not found(i.e it does not exist) then it creates a new document i.e UPdate Or inSERT  
    // )
    // if (deleteblog === null) {
    //     res.status(404).send({ msg: "no blog found" })
    // }

    // let deletebyauthor = await BlogModel.findOneAndUpdate(
    //     { authorId: authorId }, //condition
    //     { isDeleted: true },  //ipdate in data
    //     { new: true } // new: true - will give you back the updated document // Upsert: it finds and updates the document but if the doc is not found(i.e it does not exist) then it creates a new document i.e UPdate Or inSERT  
    // )
    // if (deletebyauthor === null) {
    //     res.status(404).send({ msg: "no blog found" })
    // }

    // let deletebyTags = await BlogModel.findOneAndUpdate(
    //     { tags: tags }, //condition
    //     { isDeleted: true },  //ipdate in data
    //     { new: true } // new: true - will give you back the updated document // Upsert: it finds and updates the document but if the doc is not found(i.e it does not exist) then it creates a new document i.e UPdate Or inSERT  
    // )
    // if (deletebyTags === null) {
    //     res.status(404).send({ msg: "no blog found" })
    // }

    // let deletebySubcategory = await BlogModel.findOneAndUpdate(
    //     { subcategory: subcategory }, //condition
    //     { isDeleted: true },  //ipdate in data
    //     { new: true } // new: true - will give you back the updated document // Upsert: it finds and updates the document but if the doc is not found(i.e it does not exist) then it creates a new document i.e UPdate Or inSERT  
    // )
    // if (deletebySubcategory === null) {
    //     res.status(404).send({ msg: "no blog found" })
    // }

    // let deletebyisPublished = await BlogModel.findOneAndUpdate(
    //     { isPublished: isPublished }, //condition
    //     { isDeleted: true },  //ipdate in data
    //     { new: true } // new: true - will give you back the updated document // Upsert: it finds and updates the document but if the doc is not found(i.e it does not exist) then it creates a new document i.e UPdate Or inSERT  
    // )
    // if (deletebyisPublished === null) {
    //     res.status(404).send({ msg: "no blog found" })
    // }

}


module.exports.createBlog = createBlog
//module.exports.createAuthor = createAuthor
module.exports.getBlogsData = getBlogsData
module.exports.updateBlogs = updateBlogs
module.exports.deletePath = deletePath
module.exports.deleteBlog = deleteBlog
