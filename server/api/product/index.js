'use strict';

var express = require('express');
var controller = require('./product.controller');

var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', /*auth.hasRole('admin'), */controller.index);
router.get('/search', /*auth.hasRole('admin'), */controller.search);
router.get('/validator', /*auth.hasRole('admin'), */controller.validator);
router.get('/:id', /*auth.hasRole('admin'), */controller.show);
router.post('/', /*auth.hasRole('admin_p'), */controller.create);
router.put('/:id', /*auth.hasRole('admin_p'), */controller.update);
router.patch('/:id', /*auth.hasRole('admin_p'), */controller.update);
router.delete('/:id', /*auth.hasRole('admin_p'), */controller.destroy);

module.exports = router;