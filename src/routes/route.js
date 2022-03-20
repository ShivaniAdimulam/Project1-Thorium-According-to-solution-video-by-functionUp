const express = require('express');
const router = express.Router();
const blogController= require("../controllers/blogController")
const authorController= require("../controllers/authorController")
const middleWare = require ("../middlewares/auth")


router.post("/authors",authorController.createAuthor)

router.post("/blogs",middleWare.mid,blogController.createBlog)

router.get("/blogs",middleWare.mid,blogController.getBlogsData)

router.put("/blogs/:blogId",middleWare.mid,middleWare.authorisation,blogController.updateBlogs)

router.delete("/blogs/:blogId",middleWare.mid,middleWare.authorisation,blogController.deletePath)

router.delete("/blogs",middleWare.mid,middleWare.authorisation,blogController.deleteBlog)

router.post("/login",authorController.loginAuthor)


module.exports=router;