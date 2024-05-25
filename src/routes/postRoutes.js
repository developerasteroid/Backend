const express = require('express');
const router = express.Router();
const authMiddleWare = require('../middlewares/authMiddleWare');
const { uplaodPost, uploadPostFile, handleMulterUploadPostFileError, deletePost, likePost, disLikePost, commentPost, servePosts, servePostContent, serveUserPosts, reportPost, servePostComment, deleteCommentPost } = require('../controllers/postController');
const uriMiddleWare = require('../middlewares/uriMiddleWare');

router.post('/upload', authMiddleWare, uploadPostFile.single('file'), handleMulterUploadPostFileError, uplaodPost);
router.post('/delete', authMiddleWare, deletePost);
router.get('/like/:postId', authMiddleWare, likePost);
router.get('/dislike/:postId', authMiddleWare, disLikePost);
router.post('/comment', authMiddleWare, commentPost);
router.post('/comment/delete', authMiddleWare, deleteCommentPost);
router.get('/serve', authMiddleWare, servePosts);
router.get('/serve/:uid', authMiddleWare, serveUserPosts);
router.get('/comment/serve/:postId', authMiddleWare, servePostComment);
router.get('/content/:token/:category/:filename', uriMiddleWare, servePostContent);
router.post('/report', authMiddleWare, reportPost);

// router.post('/login', LoginUser);
// router.post('/check/username', UsernameExist);


module.exports = router;