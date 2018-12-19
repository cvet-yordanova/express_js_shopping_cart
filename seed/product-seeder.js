var Product = require('../models/product');
var mongoose = require('mongoose');

mongoose.connect("mongodb://localhost:27017/shopping", { useNewUrlParser: true });

var products = [
    new Product({
        imagePath: 'dhsdhg',
        title: 'Gothic video game',
        description: 'Awesome gane',
        price: 15
    }),
    new Product({
        imagePath: 'sdfgafg',
        title: 'Gothic video game',
        description: 'Awesome gane',
        price: 14
    }),
    new Product({
        imagePath: 'aegethwrth',
        title: 'Gothic video game',
        description: 'Awesome gane',
        price: 10
    })
];

// var product = new Product({
//     imagePath: '35345345',
//     title: 'Gothic video game',
//     description: 'Awesome gane',
//     price: 10
// });

// product.save(function () {
//     mongoose.disconnect();
// });

var done = 0;

for (var i = 0; i < products.length; i++) {
   
    products[i].save(function (err, result) {
        console.log('product' + i);
        done++;
        if (done - 1 === products.length) {
            exit();
        }
    });
}


function exit() {
    mongoose.disconnect();
}