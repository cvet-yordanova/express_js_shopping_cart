var express = require('express');
var router = express.Router();

var Page = require('../models/page');


router.get('/', function (req, res) {
    Page.find({}).sort({ sorting: 1 }).exec(function (err, pages) {
        res.render('admin/pages', {
            pages: pages
        });
    })
});



//get add page
router.get('/add-page', function (req, res) {
    var title = '';
    var slug = '';
    var content = '';


    res.render('admin/add_page', {
        title: title,
        slug: slug,
        content: content
    });
});



//post add page
router.post('/add-page', function (req, res) {

    req.checkBody('title', 'Title must have a value').notEmpty();
    req.checkBody('content', 'Content must have a value').notEmpty();
    req.checkBody('slug', 'Slug must have a value').notEmpty();

    var title = req.body.title;

    var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    console.log(slug);
    // if (slug == "") slug = title.replace(/\\s+/g, '-').toLowercase;
    var content = req.body.content;
    console.log(slug);



    var errors = req.validationErrors();

    if (errors) {
        res.render('admin/add_page', {
            errors: errors,
            title: title,
            slug: slug,
            content: content
        });
    } else {
        Page.findOne({ slug: slug }, function (err, page) {
            if (page) {

                req.flash('danger', "Page slug exists, choose another!");
                res.render('admin/add_page', {
                    title: title,
                    slug: slug,
                    content: content
                });
            } else {
                var page = new Page({
                    title: title,

                    slug: slug,
                    content: content,
                    sorting: 0
                });

                page.save(function (err) {
                    if (err) {
                        return console.log(err);
                    }

                    req.flash('success', 'Page added');
                    res.redirect('/admin/pages');
                });
            }
        })
    }
});


// GET EDIT PAGE
router.get('/edit-page/:id', function (req, res) {
    Page.findById(req.params.id, function (err, page) {

        if (err) {
            return console.log(err);
        }

        res.render('admin/edit_page', {
            title: page.title,
            slug: page.slug,
            content: page.content,
            id: page._id

        });
    });
})

//post edit page
router.post('/edit-page/:id', function (req, res) {

    req.checkBody('title', 'Title must have a value').notEmpty();
    req.checkBody('content', 'Content must have a value').notEmpty();
    req.checkBody('slug', 'Slug must have a value').notEmpty();

    var title = req.body.title;

    var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();

    var content = req.body.content;
    var id = req.body.id;

    var errors = req.validationErrors();

    if (errors) {
        res.render('admin/edit_page', {
            errors: errors,
            title: title,
            slug: slug,
            content: content,
            id: id
        });
    } else {
        Page.findOne({ slug: slug, _id: {'$ne': id } }, function (err, page) {
            if (page) {

                req.flash('danger', "Page slug exists, choose another!");
                res.render('admin/edit_page', {
                    title: title,
                    slug: slug,
                    content: content,
                    id: id
                });
            } else {
                Page.findById(id, function(err, page) {
                    if(err)
                    return console.log(err);

                    page.title = title;
                    page.slug = slug;
                    page.content = content;

                    page.save(function (err) {
                        if (err) {
                            return console.log(err);
                        }
    
                        req.flash('success', 'Page edited');
                        res.redirect('/admin/pages');
                    });

                });
             
            }
        });
    }
});


router.get('/delete-page/:id', function(req, res) {
    Page.findOneAndRemove(req.params.id, function(err) {
        if(err){
            console.log(err);
        }

        req.flash('success', 'Page deleted');
        res.redirect('/admin/pages/');
    });


});




module.exports = router;