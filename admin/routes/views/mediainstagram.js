var keystone = require('../../../');

exports = module.exports = function(req, res) {

  keystone.render(req, res, 'instagram', {
    section: 'instagram',
    page: 'instagram',
    title: keystone.get('name') || 'Keystone',
    orphanedLists: keystone.getOrphanedLists()
  });

};
