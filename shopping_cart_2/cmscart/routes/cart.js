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

//get checkout page
router.get('/checkout', function (req, res) {
    res.render('checkout', {
        title: 'Checkout',
        cart: req.session.cart
    });
});

//get add product to cart
router.get('/add/:product', function (req, res) {

    var slug = req.params.product;

    Product.findOne({ slug: slug }, function (err, p) {
        if (err) {
            consonle.log(err);
        }

        if (typeof req.session.cart == "undefined") {
            req.session.cart = [];
            req.session.cart.push({
                title: slug,
                qty: 1,
                price: parseFloat(p.price).toFixed(2),
                image: '/product_images/' + p._id + '/' + p.image
            });
        } else {
            var cart = req.session.cart;
            var newItem = true;

            for (var i = 0; i < cart.length; i++) {
                if (cart[i].title == slug) {
                    cart[i].qty++;
                    newItem = false;
                    break;
                }
            }

            if (newItem) {
                cart.push({
                    title: slug,
                    qty: 1,
                    price: parseFloat(p.price).toFixed(2)
                });
            }
        }

        console.log(req.session.cart);
        req.flash('success', 'Product added!');
        res.redirect('back');
    });

});


//get update product

router.get('update/:product', function(req, res) {
    var slug = req.params.product;
    var cart = req.session.cart;
    var action = req.query.action;


    for(var i=0; i < cart.length; i++){
        if(cart[i].title == 'slug'){
            switch(action) {
                case "add":
                cart[i].qty++;
                break;
                case "remove":
                cart[i].qty--;
                if(cart[i].qty < 1) cart.splice(i, 1);
                break;
                case "clear":
                cart.splice(i, 1);
                if(cart.length == 0) delete req.session.cart;
                break;
               default:
               console.log('update problem');
               break;
            }

            break;
        }
    }


    req.flash('success', 'Cart updated!');
    res.redirect('/cart/checkout');
});




module.exports = router;