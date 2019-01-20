var express = require('express');
var fs = require('fs-extra');
var router = express.Router();

var Product = require('../models/product');

// get all products

router.get('/', function (req, res) {
    Product.find(function (err, products) {

        if (err) {
            console.log(err);
        }

        res.render('all_products', {
            // todo make home page
            title: 'All products',
            products: products
        });
    });
});

router.get('/:slug', function (req, res) {
    var slug = req.params.slug;

    Page.findOne({ slug: slug }, function (err, page) {

        if (err) {
            console.log(err);
        }


        if (!page) {
            res.redirect('/');
        }
        else {

            res.render('index', {
                title: page.title,
                content: page.content
            });
        }
    });
});

//get product view

router.get('/:category/:product', function (req, res) {

    var galleryImages = null;

    Product.findOne({ slug: req.params.product }, function (err, product) {
        if(err) {
            console.log(err);
        } else {

            console.log('++++++');
            console.log(product);
            var galleryDir = 'public/product_images/' + product._id + '/gallery';

            fs.readdir(galleryDir, function(err, files) {
                if(err) {
                    console.log(err);
                } else {
                    galleryImages = files;

                    res.render('product', {
                        title: product.title,
                        p: product,
                        galleryImages: galleryImages
                    });
                }
            });
        }
    });
});

module.exports = router;