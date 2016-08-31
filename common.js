'use strict';

var knex = require('knex');
var yaml = require('js-yaml');
var fs = require('fs');

// Gets the YAML config file
try {
	var config = yaml.safeLoad(fs.readFileSync(__dirname + '/config/db.yml', 'utf8'));
	// console.log(config);
} catch (err) {
	console.log(err);
}

module.exports = {
	// Exports the config for other files to use
	config: config,

	// Exports one shared DB connection function
	db: knex({
		client: 'mysql',
		connection: {
			host: config.host,
			user: config.user,
			password: config.password,
			database: config.database
		}
	})

};