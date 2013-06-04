#!/usr/bin/env node

"use strict";

//get cli options
function getParams() {

    var params = {};

    var arg;
    var args = process.argv;
        args.slice(0, 2);

    while((arg = args.shift())) {

        if (arg === '-p') {
            delete params.command;
            params.program = args.shift();
            continue;
        }

        if (params.program !== void 0) {
            if (params.programm_attributes === void 0) params.programm_attributes = [];
                params.programm_attributes.push(arg);
                continue;
        }

        if (params.program === void 0) {
            params.command = 'adb ' + arg;
            if (arg === 'logcat') {
                params.new_window = true;
            }
        }
    }

    return params;
}

var adb_cli = require('./lib/adb-cli.js');
    adb_cli.call(getParams());