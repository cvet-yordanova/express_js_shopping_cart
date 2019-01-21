var express = require('express');
var router = express.Router();

//Get page model
var Page = require('../models/page');
var Product = require('../models/product');

router.get('/', function (req, res) {
    Product.find(function (err, products) {

        if (err) {
            console.log(err);
        }

        res.render('all_products', {
            // todo make home page
            title: 'ALl products',
            products: products
        });
    });
});




//exports
module.exports = router;