const express = require('express');
const router = express.Router();

//import controller
const reportController = require('../../controllers/report');

//setting endpoint report
router.get('/', reportController.index);    //Done

module.exports = router;