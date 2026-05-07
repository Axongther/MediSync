const router = require('express').Router();
const controller = require('./auth.controller');
const auth = require('../../middleware/auth');

router.post('/register', controller.register);
router.post('/login', controller.login);
router.get('/me', auth, controller.getMe);

module.exports = router;