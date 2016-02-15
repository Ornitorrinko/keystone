var keystone = require('../../../');

exports = module.exports = function(req, res) {

  keystone.render(req, res, 'medias', {
    section: 'medias',
    page: 'medias',
    title: keystone.get('name') || 'Keystone',
    orphanedLists: keystone.getOrphanedLists()
  });

};
