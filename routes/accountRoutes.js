const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/register', accountController.createAccount);
router.post('/login', accountController.login);
router.get('/accounts', authMiddleware, accountController.getAccounts);
router.put('/accounts/:id', authMiddleware, accountController.updateAccount);
router.delete('/accounts/:id', authMiddleware, accountController.deleteAccount);

module.exports = router;