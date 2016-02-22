var keystone = require('../../../');
var request = require('request');
var AccessToken = keystone.list('AccessToken');

exports = module.exports = function(req, res) {

	if (!req.query.code) {
		keystone.render(req, res, 'youtube', {
	    section: 'youtube',
	    page: 'youtube',
	    title: keystone.get('name') || 'Keystone'
	  });
	} else {

		var url = 'https://accounts.google.com/o/oauth2/token';
		var redirect_uri = keystone.get('env') == 'development' ? 'http://localhost:3000/keystone/medias/youtube' : 'http://costao.com.br/keystone/medias/youtube';
		var params ={
			client_id: '867553353887-ogkmdg74kjbg6mhqs6m21jn11ap5ga2n.apps.googleusercontent.com',
			client_secret: '_zIXCAIHGSEG-fSLEfozsKX5',
			grant_type: 'authorization_code',
			redirect_uri: redirect_uri,
			code: req.query.code

		}

		request.post({url: url, form: params}, function(err, httpResponse, body) { 

			if (err) {
				return res.status(500).send('Erro ao obter token de acesso' + JSON.stringify(err));
			}

			var result = JSON.parse(body);
			

			AccessToken.model.remove({}, function(err) {
				if (err) {
					return res.status(500).send('Erro ao deleter tokens antigos' + JSON.stringify(err));
				}

				try {
					var doc = new AccessToken.model({
					  type:         'youtube',
					  clientId:     params.client_id,
					  clientSecret: params.client_secret,
					  code:         params.code,
					  accessToken:  result.access_token,
					  expires:      result.expires_in
					});
				} catch (e) {
					return res.status(500).send('Não foi possível criar o documento Mongoose ' + JSON.stringify(e));
				}

				doc.save(function(err) {
		      if (err) {
		        return res.status(500).send('Não foi possível salvar token' + JSON.stringify(err));
		      } 

		      keystone.render(req, res, 'youtube', {
				    section: 'youtube',
				    page: 'youtube',
				    title: keystone.get('name') || 'Keystone'
				  });
		    });
			})

		})
	}


};
