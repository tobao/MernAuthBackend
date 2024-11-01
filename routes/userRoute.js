const express = require("express")
const { registerUser, loginUser, logoutUser, getUser, updateUser, deleteUser, getUsers, getLoginStatus, upgradeUser, sendAutomatedEmail } = require("../controllers/userController");
const { protect, adminOnly, authorOnly } = require("../middleware/authMiddleware");
const router = express.Router();

router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/logout', logoutUser)
router.get('/getUser',protect, getUser)
router.patch('/updateUser',protect, updateUser)

router.delete('/:id',protect, adminOnly, deleteUser)
router.get('/getUsers',protect, authorOnly, getUsers)
router.get('/getLoginStatus',getLoginStatus)
router.post('/upgradeUser',protect, adminOnly, upgradeUser)
router.post('/sendAutomatedEmail',protect, sendAutomatedEmail)


module.exports = router;