var sce = require('./scenario.js');
var scm = require('./scenarioManager.js');
var Scenario = sce.Scenario;
var ScenarioManager = scm.ScenarioManager;

var Nightmare = require('nightmare');

class Player {
    constructor(url, scenari) {
        this.url = url;
        this.scenari = scenari;
        this.nightmare = Nightmare({show:true});
        this.response_error = [];
        this.html_error = [];
        

        this.scenarioManager = new ScenarioManager(100);
        this.scenari.forEach(sc => {
            var new_scenario = new Scenario(sc.actions);
            this.scenarioManager.addScenarioToExecute(new_scenario);
        });

        this.registerListener();
    }

    registerListener() {
        this.nightmare.on('console', (type, args) => {
                if (type === 'error') {
                    this.html_error.push(args)
                }
            })
            .on('page', (type, message, stack) => {
                if (type === 'error') {
                    this.html_error.push(message);
                }
            })
            .on('did-get-response-details', (event, status, newURL, originalURL, code, referrer, headers, resourceType) => {
                const HTML_ERROR_CODE = 400;
                if (code >= HTML_ERROR_CODE) {
                    this.response_error.push(code);
                }
            });
    }

    start(errcallback, okcallback) {
        this.play(errcallback, okcallback);
    }

    play(errcallback, okcallback) {
        if (this.scenarioManager.hasScenarioToExecute()) {
            this.executeNextScenario(
                () => this.play(errcallback, okcallback),
                () => this.play(errcallback, okcallback));
        } else {
            this.nightmare.end()
                .then(res => {
                    okcallback(this.scenarioManager.executed);
                })
                .catch(err => {
                    errcallback(err);
                });
        }
    }


    executeNextScenario(errcallback, okcallback) {
        var scenario = this.scenarioManager.nextScenarioToExecute();
        if (scenario) {
            this.executeScenario(scenario,
                () => {
                    errcallback();
                },
                () => {
                    okcallback();
                });
        } else {
            okcallback();
        }
    }


    executeScenario(scenario, errcallback, okcallback) {
        if (scenario.hasNext()) {
            var next_action = scenario.next();
            next_action.attachTo(this.nightmare)
                .wait(1000)
                .then((res) => {
                    next_action.executed = true;
                    this.markError(next_action);
                    this.cleanError();
                    this.executeScenario(scenario, errcallback, okcallback);
                })
                .catch((err) => {
                    next_action.executed = false;
                    this.markError(next_action);
                    this.cleanError();
                    errcallback()
                })
        } else {
            okcallback();
        }
    }

    markError(ent) {
        ent.errors = ent.errors || [];
        this.response_error.forEach((err) => ent.errors.push(err));
        this.html_error.forEach((err) => ent.errors.push(err));
    }

    cleanError() {
        this.response_error = [];
        this.html_error = [];
    }

}



module.exports.Player = Player;





/*function checkReplay() {
    var numberOfSameScenario = 0;
    if (toPlay.length !== scenarioManager.executed.length) return false;

    for (var i = 0; i < toPlay.length; i++) {
        var originalScenario = toPlay[i];
        var replayScenario = scenarioManager.executed[i];
        if (originalScenario.actions.length !== replayScenario.actions.length) return false;

        for (var j = 0; j < originalScenario.actions.length; j++) {
            var originalAction = originalScenario.actions[j];
            var replayAction = replayScenario.actions[j];
            if (originalAction.executed !== replayAction.executed) return false;
            if ((originalAction.errors.length > 0) && (replayAction.errors.length === 0)) return false;
            if ((originalAction.errors.length === 0) && (replayAction.errors.length > 0)) return false;
        }
    }
    return true;
}





*/
