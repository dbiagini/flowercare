'use strict';
var express = require('express');
module.exports = class HTMLServer {

	constructor(){
		this.app = express();
		this.port = 8000;
		this.engine = 'ejs';

	}

	init(){
		this.app.use(express.static('public'));
		this.app.set('view engine', this.engine);

	}

	start(config_plants){
		//register index
		this.app.get('/', function(req, res) {
			res.render('pages/indexPl',{
				plants: config_plants,
			});
		});
		//register the about page
		this.app.get('/about', function(req, res) {

			res.render('pages/about');
		});


		this.app.listen(this.port);

		console.log("Server running at http://127.0.0.1:8000/");

	}

	stopServer(){
	
	}
	


}

