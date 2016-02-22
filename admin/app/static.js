/**
 * Returns an Express Router with bindings for the Admin UI static resources,
 * i.e files, less and browserified scripts.
 *
 * Should be included before other middleware (e.g. session management,
 * logging, etc) for reduced overhead.
 */

var browserify = require('./browserify');
var express = require('express');
var less = require('less-middleware');
var path = require('path');
var router = express.Router();

/* Prepare browserify bundles */

var bundles = {
  fields: browserify('fields.js', 'FieldTypes'),
  home: browserify('views/home.js'),
  item: browserify('views/item.js'),
  list: browserify('views/list.js'),
  twitter: browserify('views/twitter.js'),
  facebook: browserify('views/facebook.js'),
  instagram: browserify('views/instagram.js'),
  youtube: browserify('views/youtube.js')
};

router.prebuild = function() {
  bundles.fields.build();
  bundles.home.build();
  bundles.item.build();
  bundles.list.build();
  bundles.twitter.build();
  bundles.facebook.build();
  bundles.instagram.build();
  bundles.youtube.build();
};

/* Prepare LESS options */

var reactSelectPath = path.join(path.dirname(require.resolve('react-select')), '..');

var lessOptions = {
  render: {
    modifyVars: {
      reactSelectPath: JSON.stringify(reactSelectPath)
    }
  }
};

/* Configure router */

router.use('/styles', less(__dirname + '../../public/styles', lessOptions));
router.use(express.static(__dirname + '../../public'));
router.get('/js/fields.js', bundles.fields.serve);
router.get('/js/home.js', bundles.home.serve);
router.get('/js/item.js', bundles.item.serve);
router.get('/js/list.js', bundles.list.serve);
router.get('/js/twitter.js', bundles.twitter.serve);
router.get('/js/facebook.js', bundles.facebook.serve);
router.get('/js/instagram.js', bundles.instagram.serve);
router.get('/js/youtube.js', bundles.youtube.serve);

module.exports = router;
