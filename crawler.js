//log
var winston = require('winston');

//monitoring
var present = require('present');


//Import of other modules (this should be improved somehow)
var htmlAnalysis = require('./htmlAnalysis.js');


var ScenarioManager = require('./scenarioManager.js').ScenarioManager;
var ScenarioGenerator = require('./scenarioGenerator.js').ScenarioGenerator;
var SiteMap = require('./siteMap.js').SiteMap;

var Nightmare = require('nightmare');

var CRAWLER_OK = 'CRAWLER_OK';
var CRAWLER_ERROR = 'CRAWLER_ERROR';
var SCENARIO_OK = 'SCENARIO_OK';
var SCENARIO_ERROR = 'SCENARIO_ERROR';

class Crawler {
    constructor(url, options) {
        this.url = url;
        this.options = options;
        this.scenarioManager = new ScenarioManager(this.options.crawler.maxsteps, this.options.crawler.maxruns);
        this.scenarioGenerator = new ScenarioGenerator(this.url, this.options);

        this.progressionListeners = [];

        var initial_scenario = this.scenarioGenerator.generateInitialScenario();
        this.scenarioManager.addScenarioToExecute(initial_scenario);

        if (options.map.active) {
            this.siteMap = new SiteMap(this.url, this.options);
        }
    }

    addProgressionListener(listener) {
        this.progressionListeners.push(listener);
    }

    notifyAllProgressionListener(event) {
        this.progressionListeners.forEach(listener => listener(event));
    }


    start(errcallback, okcallback) {
        this.startTime = present();
        this.nightmare = Nightmare({ show: this.options.crawler.show });
        winston.info(`Nightmare has been initialized !`);

        this.registerEventListener();
        winston.info(`Start crawling of ${this.url} with ${this.options.crawler.maxsteps} maximun steps in ${this.options.crawler.time} min`);

        this.preCrawl(errcallback, () => {
            this.crawl(errcallback, okcallback);
        })
    }

    registerEventListener() {
        this.errors = [];

        this.nightmare.on('console', (type, args) => {
                if (type === 'error') {
                    this.errors.push({ type: 'console', value: type + ' ' + args });
                }
            })
            .on('page', (type, message, stack) => {
                if (type === 'error') {
                    this.errors.push({ type: 'page', value: type + ' ' + message });
                }
            })
            .on('did-get-response-details', (event, status, newURL, originalURL, code, referrer, headers, resourceType) => {
                const HTML_ERROR_CODE = 400;
                if (code >= HTML_ERROR_CODE) {
                    //winston.error(`An error HTTP has been received (code: ${code}, url:${newURL})`);
                    this.errors.push({ type: 'http', value: status + ' ' + code + ' ' + newURL });
                }
            });

        //winston.info(`EventListerners have been initialized and setted !`);
    }

    preCrawl(errcallback, okcallback) {
        //Comment this if the crawler needs a specific preCrawl scenario
        okcallback();

        //Uncomment this if the crawler needs a specific preCrawl scenario (i.e. Facebook Login)
        /*
        this.nightmare
                    .goto(this.url)
                    .wait(1000)
                    .type("#email", "")
                    .type("#pass", "")
                    .wait(1000)
                    .click("#u_0_s")
                    .wait(4000)
                    .then(okcallback)
                    .catch(errcallback);*/
    }




    crawl(errcallback, okcallback) {
        var scenarioManager = this.scenarioManager;
        var nightmare = this.nightmare;
        var hasTime = (present() - this.startTime) < (this.options.crawler.time * 60 * 1000);

        if (hasTime) {
            if (scenarioManager.hasScenarioToExecute()) {
                this.executeNextScenario(
                    () => this.crawl(errcallback, okcallback),
                    () => this.crawl(errcallback, okcallback));
            } else {
                var initial_scenario = this.scenarioGenerator.generateInitialScenario();
                this.scenarioManager.addScenarioToExecute(initial_scenario);
                this.crawl(errcallback, okcallback);
            }
        } else {
            nightmare.end()
                .then(res => {
                    winston.info(`Finished crawling`);
                    var endTime = present();
                    winston.info(`Process duration: ${endTime - this.startTime} ms`);
                    var result = {
                        url: this.url,
                        options: this.options,
                        duration: endTime - this.startTime,
                        executedScenario: this.scenarioManager.executed,
                        numberOfUnexecutedScenario: this.scenarioManager.executed.filter(s => s.run === 0).length
                    };
                    if (this.siteMap) result.siteMap = this.siteMap;
                    this.notifyAllProgressionListener({ type: CRAWLER_OK, value: result });
                    okcallback(result);
                })
                .catch(err => {
                    winston.error(`Error finishing crawling: ${err}`);
                    this.errors.push({ type: 'crawler', value: err });
                    this.notifyAllProgressionListener({ type: CRAWLER_ERROR, value: err });
                    errcallback(err);
                });
        }
    }


    executeNextScenario(errcallback, okcallback) {
        var nightmare = this.nightmare;
        var scenarioManager = this.scenarioManager;
        var scenario = scenarioManager.nextScenarioToExecute();

        if (scenario) {
            winston.info(`Proceed: ${scenario}\n`);
            this.executeScenario(scenario,
                () => {
                    this.notifyAllProgressionListener({ type: SCENARIO_ERROR, value: scenario });
                    errcallback();
                },
                () => {
                    this.notifyAllProgressionListener({ type: SCENARIO_OK, value: scenario });
                    okcallback();
                });
        } else {
            okcallback();
        }

    }


    executeScenario(scenario, errcallback, okcallback) {
        var nightmare = this.nightmare;
        if (scenario.hasNext()) {
            var next_action = scenario.next();
            next_action.attachTo(nightmare)
                .wait(this.options.crawler.wait)
                .evaluate(htmlAnalysis)
                .then(analysis_result => {
                    //winston.info(`An action has been executed and after the HTML has been analyzed`);
                    this.handleEndOfAction(next_action, analysis_result);
                    if (!scenario.hasNext()) {
                        this.scenarioGenerator.generateNewScenari(scenario, analysis_result).forEach(sc => this.scenarioManager.addScenarioToExecute(sc));
                    }
                    this.executeScenario(scenario, errcallback, okcallback)
                })
                .catch((err) => {
                    //winston.error(`An action (${next_action}) cannot be executed (error: ${err}), the scenario is aborded.`);
                    this.errors.push({ type: 'crawler', value: err });
                    next_action.executed = false;
                    this.markError(next_action);
                    this.cleanError();
                    errcallback()
                })
        } else {
            scenario.index = 0;
            okcallback();
        }
    }



    handleEndOfAction(action, analysis_result) {
        action.executed = true;
        this.markError(action);
        this.cleanError();

        if (this.siteMap) {
            this.siteMap.updateMap(action, analysis_result);
        }
    }




    markError(ent) {
        ent.errors = ent.errors || [];
        this.errors.forEach((err) => ent.errors.push(err));
    }

    cleanError() {
        this.errors = [];
    }

}

module.exports.Crawler = Crawler;
