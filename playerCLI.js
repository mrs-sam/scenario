var  argv  =  require('yargs')
    .usage('$0 playerCLI.js --url=[string] --sce=[string]').argv;

var fs = require('fs');
var Scenario = require('./scenario.js').Scenario;

var url = argv.url || 'http://localhost:8080';
var sce = argv.sce;

//Import of other modules (this should be improved somehow)
var Player = require('./player.js').Player;

var sceJSON = JSON.parse(fs.readFileSync(sce, 'utf8'));
var scenario = new Scenario(sceJSON.actions);

var scenari = [];
scenari.push(scenario);

var player = new Player(url, scenari);
player.start(err => console.log(err), (executed) => {
    console.log(`${executed} has been played. `);
});
