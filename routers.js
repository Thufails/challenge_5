const express = require('express')
const router = express.Router()

const { PrismaClient } = require("@prisma/client");
const accountControllers = require('./controllers/accountControllers');
const userControllers = require('./controllers/userControllers');
const transactionControllers = require('./controllers/transactionControllers');
const checkToken = require('./middleware/checktoken')

const prisma = new PrismaClient();

router.get('/', (req, res) => {
    return res.json({
        message: "Hellow World"
    })
})

//POST USER
router.post('/auth/register', userControllers.registerUser)
    //LOGIN AUTH
router.post('/auth/login', userControllers.loginUser)
    //GET TOKEN
router.get('/auth/authenticate', checkToken, userControllers.getProfile)

//GET USER
router.get('/users', userControllers.getUser)
    // GET USER + DETAIL PROFIL
router.get('/users/:id', userControllers.getUserdetail)
    // EDIT USER
router.put('/users/edit/:id', userControllers.editUser)
    //DELETE USER
router.delete('/users/delete/:id', userControllers.deleteUser)

//POST ACCOUNT BARU
router.post('/regisAccounts', accountControllers.registerAccounts)
    //GET ACCOUNT
router.get('/accounts', accountControllers.getAccounts)
    //GET BY ID
router.get('/accounts/:id', accountControllers.getAccountsId)
    //EDIT ACCOUNT
router.put('/editAccounts/:id', accountControllers.editAccount)
router.delete('/delAccounts/:id', accountControllers.deleteAccount)

//POST TRANSACTION 
router.post('/createTransactions', transactionControllers.createTransaction)
    //GET TRANSACTION
router.get('/transactions', transactionControllers.getTransactions)
    //GET TRANSACTION by id
router.get('/transactions/:id', transactionControllers.getTransactionsId)

module.exports = router