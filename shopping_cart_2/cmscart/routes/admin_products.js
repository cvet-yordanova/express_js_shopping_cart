var express = require('express');
var router = express.Router();
var mkdirp = require('mkdirp');
var fs = require('fs-extra');
var resizeImg = require('resize-img');

var Product = require('../models/product');
var Category = require('../models/category');

//get products index
router.get('/', function (req, res) {

    var count;

    Product.count(function (err, c) {
        count = c;
    });

    Product.find(function (err, products) {
        res.render('admin/products', {
            products: products,
            count: count
        });
    });
});



//get add product
router.get('/add-product', function (req, res) {
    var title = '';
    var desc = '';
    var price = '';

    Category.find(function (err, categories) {
        res.render('admin/add_product', {
            title: title,
            desc: desc,
            categories: categories,
            price: price
        });
    });
});



//post add product
router.post('/add-product', function (req, res) {

    var imageFile = typeof req.files.image !== 'undefined' ? req.files.image.name : "";

    req.checkBody('title', 'Title must have a value').notEmpty();
    req.checkBody('desc', 'Description must have a value').notEmpty();
    req.checkBody('price', 'Price must have a value').isDecimal();
    req.checkBody('image', "You must upload an image").isImage(imageFile);

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var desc = req.body.desc;
    var price = req.body.price;
    var category = req.body.category;
    var errors = req.validationErrors();

    console.log('here');

    if (errors) {
        Category.find(function (err, categories) {
            res.render('admin/add_product', {
                title: title,
                desc: desc,
                categories: categories,
                price: price
            });
        });
    } else {
        Product.findOne({ slug: slug }, function (err, product) {
            if (product) {
                req.flash('danger', 'PRoduct title exists, choose another');
                Category.find(function (err, categories) {
                    res.render('admin/add_product', {
                        errros: errors,
                        title: title,
                        desc: desc,
                        categories: categories,
                        price: price
                    });
                });
            } else {
                var price2 = parseFloat(price).toFixed(2);

                var product = new Product({
                    title: title,
                    slug: slug,
                    desc: desc,
                    price: price2,
                    category: category,
                    image: imageFile
                });

                product.save(function (err) {
                    if (err)
                        return console.log(err);

                    mkdirp('public/product_images/' + product._id, function (err) {
                        return console.log(err);
                    });

                    mkdirp('public/product_images/' + product._id + '/gallery', function (err) {
                        return console.log(err);
                    });

                    mkdirp('public/product_images/' + product._id + '/gallery/thumbs', function (err) {
                        return console.log(err);
                    });

                    if (imageFile != "") {
                        var productImage = req.files.image;
                        var path = 'public/product_images/' + product._id + "/" + imageFile;

                        productImage.mv(path, function (err) {
                            return console.log(err);
                        });
                    }

                    req.flash('success', 'Product added');
                    res.redirect('/admin/products');
                });
            }

        });

    }
});

//get edit product\
router.get('/edit-product/:id', function (req, res) {

    var errors;

    if (req.session.errors) {
        errors = req.session.errors;
        req.session.errors = null;
    }

    Category.find(function (err, categories) {
        Product.findById(req.params.id, function (err, p) {
            if (err) {
                console.log(err);
                res.redirect('/admin/products');
            } else {
                var galleryDir = 'public/product_images/' + p._id + '/gallery';
                var galleryImages = null;


                fs.readdir(galleryDir, function (err, files) {
                    if (err) {
                        console.log(err);
                    } else {
                        galleryImages = files;


                        res.render('admin/edit_product', {
                            title: p.title,
                            errors: errors,
                            desc: p.desc,
                            slug: p.slug,
                            categories: categories,
                            category: p.category.replace(/\s+/g, '-').toLowerCase(),
                            price: parseFloat(p.price).toFixed(2),
                            image: p.image,
                            galleryImages: galleryImages,
                            id: p._id
                        });

                    }
                });
            }
        });

    });

});

//post edit product

router.post('/edit-product/:id', function (req, res) {

    var imageFile = typeof req.files.image !== 'undefined' ? req.files.image.name : "";

    req.checkBody('title', 'Title must have a value').notEmpty();
    req.checkBody('desc', 'Description must have a value').notEmpty();
    req.checkBody('price', 'Price must have a value').isDecimal();
    // req.checkBody('image', "You must upload an image").isImage(imageFile);

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var desc = req.body.desc;
    var price = req.body.price;
    var category = req.body.category;
    var pimage = req.body.pimage;
    var id = req.params.id;
    var errors = req.validationErrors();
//isul

    if (errors) {
        req.session.errors = errors;
        res.redirect('admin/products/edit-product/' + id);
        console.log("here bla bla");

    } else {
        Product.findOne({ slug: slug, _id: { '$ne': id } }, function (err, p) {
            if (err) {
                console.log(err);
            }

            if (p) {
                req.flash('danger', 'Product title exists1, choose another.')
                res.redirect('admin/products/edit-product/' + id);
            } else {

                Product.findById(id, function (err, p) {
                    if (err) {
                        console.log(err);
                    }

                    p.title = title;
                    p.slug = slug;
                    p.desc = desc;
                    p.price = parseFloat(price).toFixed(2);
                    p.category = category;

                    if (imageFile != "") {
                        p.image = imageFile;
                    }

                    p.save(function (err) {
                        if (err) {
                            console.log(err);
                        }

                        if (imageFile != "") {
                            if (pimage != "") {
                                fs.remove('public/product_images/' + id + '/' + pimage, function (err) {
                                    if (err) {
                                        console.log(err);
                                    }
                                });
                            }

                            var productImage = req.files.image;
                            var path = 'public/product_images/' + id + "/" + imageFile;


                            productImage.mv(path, function (err) {
                                return console.log(err);
                            });
                        }

                        req.flash('success', "Product edited");
                        res.redirect('/admin/products/edit-product/' + id);
                    });
                });
            }
        });
    }

});

// post product gallery

router.post('/product-gallery/:id', function (req, res) {
    var productImage = req.files.file;
    var id = req.params.id;

    var path = 'public/product_images/' + id + '/gallery/' + req.files.file.name;
    var thumbsPath = 'public/product_images/' + id + '/gallery/thumbs/' + req.files.file.name;

    productImage.mv(path, function (err) {
        if (err)
            console.log(err);


        resizeImg(fs.readFileSync(path), { width: 100, height: 100 }).then(function (buf) {
            fs.writeFileSync(thumbsPath, buf);
        });
    });

    res.sendStatus(200);
});

//get delete image

router.get('/delete-image/:image', function (req, res) {

    var originalImage = 'public/product_images/' + req.query.id + '/gallery/' + req.params.image;
    var thumbImage = 'public/product_images/' + req.query.id + '/gallery/thumbs/' + req.params.image;

    fs.remove(originalImage, function (err) {
        if (err) {
            console.log(err);
        } else {
            fs.remove(thumbImage, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    req.flash('success', 'Image deleted');
                    res.redirect('/admin/products/edit-product/' + req.query.id);
                }
            });
        }
    });
});


// GET delete product

router.get('/delete-product/:id', function (req, res) {

    console.log(req.params.id);

    var id = req.params.id;
    var path = 'public/product_images/' + req.params.id;


    fs.remove(path, function (err) {
        if (err) {
            console.log(err);
        } else {
            Product.findByIdAndRemove(req.params.id, function (err) {
                console.log(err);
            });

            req.flash('success', 'Product deleted');
            res.redirect('/admin/products');
        }
    });
});


// GET EDIT CATEGORY
router.get('/edit-category/:id', function (req, res) {


    Category.findById(req.params.id, function (err, category) {

        if (err) {
            return console.log(err);
        }

        res.render('admin/edit_category', {
            title: category.title,
            id: category._id
        });
    });
})

//post edit category
router.post('/edit-category/:id', function (req, res) {

    req.checkBody('title', 'Title must have a value').notEmpty();

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var id = req.params.id;


    var errors = req.validationErrors();

    if (errors) {
        res.render('admin/edit_page', {
            errors: errors,
            title: title,
            id: id
        });
    } else {
        Category.findOne({ slug: slug, _id: { '$ne': id } }, function (err, category) {
            if (category) {

                req.flash('danger', "Category exists, choose another!");
                res.render('admin/edit_category', {
                    title: title,
                    id: id
                });
            } else {
                Category.findById(id, function (err, category) {
                    if (err)
                        return console.log(err);



                    console.log("-----" + category);
                    category.title = title;
                    category.slug = slug;


                    category.save(function (err) {
                        if (err) {
                            return console.log(err);
                        }

                        req.flash('success', 'Category edited');
                        res.redirect('/admin/categories');
                    });

                });

            }
        });
    }
});

//get delete page
router.get('/delete-category/:id', function (req, res) {
    Category.findOneAndRemove(req.params.id, function (err) {
        if (err) {
            console.log(err);
        }

        req.flash('success', 'Category deleted');
        res.redirect('/admin/categories/');
    });


});




module.exports = router;