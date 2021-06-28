const express = require('express');
const router = express.Router();

//import controller
const dashboardController = require('../../controllers/dashboard');

//setting endpoint dashboard
router.get('/', dashboardController.index);             //Done
router.get('/get', dashboardController.getDataGrafik);    //Done

module.exports = router;