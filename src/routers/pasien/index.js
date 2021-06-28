const express = require('express');
const {body} = require('express-validator');
const router = express.Router();

//import controller
const pasienController = require('../../controllers/pasien');

//Setting endpoin pasien
router.get('/', pasienController.index);            //Done
router.post('/',pasienController.search);           //Done
router.post('/create',pasienController.create);     //Done
router.post('/detail',pasienController.detail);     //Done
router.put('/update',pasienController.update);      //Done
router.delete('/delete',pasienController.delete);   //Done  

module.exports = router;