## What ?
`adb-cli` is a nodejs wrapper for ADB (Android Debug Bridge)
to enable multi device support.

## How to get ?

    npm install adb-cli -g


## How to use ?

@command line

    adb-cli //for adb help

    adb-cli command  //example: adb-cli get-serialno to get serialno of connected phones
    adb-cli program  //example: abd-cli cordova.bat launch to launch cordova app on all connected phones (windows)


@your NodeJS Project:

    var adb_cli = require('adb-cli');

        //do a adb call
        adb_cli.call({
            command : 'your adb command',
            program : 'or your program',
            output  : 'display message true/false'
        });

        //get connected phones as array
        adb_cli.getPhones();

