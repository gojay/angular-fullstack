'use strict';

var express = require('express');
var controller = require('./service.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/seed', controller.seed);
router.post('/calculate', controller.calculate);
router.post('/reference', controller.addReference);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;
