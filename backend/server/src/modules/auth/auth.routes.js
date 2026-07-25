const express = require('express');
const router = express.Router();
const { authLimiter } = require('../../middleware/rateLimiter');
const { validate }    = require('../../middleware/validate');
const { authenticate } = require('../../middleware/auth');
const { RegisterSchema, LoginSchema } = require('./auth.schema');
const ctrl = require('./auth.controller');

router.post('/register', authLimiter, validate(RegisterSchema), ctrl.register);
router.post('/login',    authLimiter, validate(LoginSchema),    ctrl.login);
router.post('/refresh',              ctrl.refresh);
router.post('/logout',               ctrl.logout);
router.get('/me',        authenticate, ctrl.me);

module.exports = router;
