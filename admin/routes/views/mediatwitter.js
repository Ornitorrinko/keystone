var keystone = require('../../../');

exports = module.exports = function(req, res) {

  keystone.render(req, res, 'twitter', {
    section: 'twitter',
    page: 'twitter',
    title: keystone.get('name') || 'Keystone',
    orphanedLists: keystone.getOrphanedLists()
  });

};
