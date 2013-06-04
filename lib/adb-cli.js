(function () {

	"use strict";

	var _               = require('underscore');
	var exec            = require('child_process').exec;
	var spawn           = require('child_process').spawn;
	var deferred        = require('deferred');
	var asyncforEach    = require('async-foreach').forEach;

	//node functions

	function execute(command, callback, opts) {

		opts = opts || {};
		if (opts.new_window !== void 0 &&
			opts.new_window === true) {

			command = "START " + command;
		}

		exec(command, function(error, stdout, stderr) {

			if (error)  console.log(error);
			if (stderr) console.log(stderr);
			if (opts.output !== void 0  &&
				opts.output === true    &&
				stdout) {
				process.stdout.write(stdout + '\r\n');
			}

			callback(stdout);
		});
	}

	function spawning(command, callback, opts) {

	    opts = opts || {};
	    opts.programm_attributes = opts.programm_attributes || [];

	    var adb = spawn(command, opts.programm_attributes);
	        adb.on('error', function(error) {
	            console.log(error);
	        });

	        adb.on('close', function (code) {
	            callback();
	        });

	        adb.stdout.on('data', function (data) {
	          process.stdout.write(data);
	        });

	        adb.stderr.on('data', function (data) {
	          process.stdout.write(data);
	        });
	}

	function setPhoneActive(phone) {

		if (phone       === void 0 ||
			phone.id    === void 0) {
			throw new Error('no phone given');
		}

		process.env['ANDROID_SERIAL'] = phone.id;
		message(phone.id);
	}

	function message(msg) {

		process.stdout.write('\r\nADB-CLI :: ' + msg);
		process.stdout.write('\r\n----------------------------- \r\n\r\n');
	}

	//adb functions

	function startServer() {

		var def = deferred();
		execute('adb start-server', def.resolve());
		return def.promise;
	}

	function exitNode() {

		process.exit();
	}


	var root = module.exports;
	var Adb = {};



		Adb.getPhones	= function() {

			var def = deferred();
			execute('adb devices', function(data) {
                var device_array = [];
                _(data.split("\r\n")).each(function(value, key) {
                    var tmp = value.split("\t");
                    if (tmp.length === 2) {
                        device_array.push({
                            'id'    : tmp[0],
                            'type'  : tmp[1]
                        });
                    }
                });

                def.resolve(device_array);
            });

    		return def.promise;
		};

		Adb.call = function(params) {

			params = params || {};

			if (params.command === void 0 &&
				params.program === void 0) {
				return true;
			}

			startServer()
				.done(function() {

					Adb.getPhones()
						.done(function(phones) {

							if (phones.length === 0) {
								message('no phones connected');
								exitNode();
								return true;
							}

							var doThatOpts = _.extend({output : true}, params);
							var doThat = params.command || params.program || null;
							if (doThat === null) {
								message('nothing to do');
								exitNode();
								return true;
							}

							asyncforEach(phones, function(phone, key) {

								if (phone.id !== void 0) {

									//activate phone
									setPhoneActive(phone);

									//execute it
									var done = this.async();
									var doThatAfer = function() {
										done();
									};

									if (params.program !== void 0) {
										spawning(doThat, doThatAfer, doThatOpts);
									} else {
										execute(doThat, doThatAfer, doThatOpts);
										if (doThatOpts.new_window) {
											done();
										}
									}
								}

							}, exitNode);
						});
				});
		};


		root.call			= Adb.call;
		root.getPhones		= Adb.getPhones;
})();