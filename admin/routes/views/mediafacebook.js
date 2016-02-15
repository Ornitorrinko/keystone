var keystone = require('../../../');

exports = module.exports = function(req, res) {

  keystone.render(req, res, 'facebook', {
    section: 'facebook',
    page: 'facebook',
    title: keystone.get('name') || 'Keystone',
    orphanedLists: keystone.getOrphanedLists()
  });

};
