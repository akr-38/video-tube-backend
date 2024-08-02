import {Router} from 'express'
import {changeCurrentPassword, getChannelProfile, getCurrentUser, getWatchHistory, loginUser, logoutUser, refreshTokens, registerUser, updateAccountDetails, updateAvatar, updateCoverImage} from '../controllers/user.controller.js'
import {upload} from '../middlewares/mutler.middleware.js'
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router()

router.route('/register').post(upload.fields([
    {name: 'avatar', maxCount:1},
    {name: 'coverImage', maxCount:1}
]), registerUser);

router.route('/login').post(loginUser);

//secured routes
router.route('/logout').post(verifyJWT,logoutUser);

router.route('/refresh-tokens').post(refreshTokens);

router.route('/change-password').post(verifyJWT,changeCurrentPassword);

router.route('/get-current-user').get(verifyJWT,getCurrentUser);

router.route('/update-account-details').patch(verifyJWT, updateAccountDetails);

router.route('/update-cover-image').patch(upload.single('coverImage'),verifyJWT,updateCoverImage)

router.route('/update-avatar').patch(upload.single('avatar'),verifyJWT,updateAvatar)

router.route('/get-channel-profile/:username').get(verifyJWT,getChannelProfile)

router.route('/get-watch-history').get(verifyJWT, getWatchHistory)

export default router;