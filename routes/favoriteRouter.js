const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

var authenticate = require('../authenticate');
const Favorites = require('../models/favorite');
const cors = require('./cors');
const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorites.find({user: req.user._id})
    .populate('user')
    .populate('dishes')
    .then((favorite) => {
        console.log(favorite + ' Gett');
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorite) => {
        if (favorite != null)
        {
            for (i=(req.body.length -1); i>=0; i--)
            {
                if (favorite.dishes.indexOf(req.body[i]._id) === -1)
                {
                    favorite.dishes.push(req.body[i]._id);
                }
            }
            favorite.save()
            .then((favorite) => {
              res.status = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(favorite);
            }, err => next(err));
            
        }
        else{
            Favorites.create({user: req.user._id})
            .then((favorite) => {
                for (i=(req.body.length -1); i>=0; i--)
                {
                    favorite.dishes.push(req.body[i]._id);
                }
                favorite.save()
                .then((favorite) => {
                    res.status = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                }, (err) => next(err));
            })
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /dishes');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.remove({user: req.user._id})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));    
});

favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('get operation not supported');
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorite) => {
        if (favorite != null)
        {
            if (favorite.dishes.indexOf(req.params.dishId) === -1)
            {
              favorite.dishes.push(req.params.dishId);
            }
            favorite.save()
            .then((favorite) => {
              res.status = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(favorite);
            }, err => next(err));
        }
        else{
            Favorites.create({user: req.user._id})
            .then((favorite) => {
                favorite.dishes.push(req.params.dishId);
                favorite.save()
                .then((favorite) => {
                    res.status = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                }, (err) => next(err));
            })
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorite) => {
        favorite.dishes.remove(req.params.dishId);
        favorite.save()
        .then((favorite) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
        }, (err) => next(err));
}, (err) => next(err))
    .catch((err) => next(err));    
});

module.exports = favoriteRouter;