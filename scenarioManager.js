var HashMap = require('hashmap');
class ScenarioManager {
    constructor(maxSteps, maxRuns) {
        this.executed = [];
        this.toExecute = [];
        this.scenariosByLevel = new HashMap();
        this.maxSteps = maxSteps;
        this.maxRuns = maxRuns;
    }

    addScenarioToExecute(scenario) {
        if (scenario.level <= this.maxSteps) {
            if (this.toExecute.find(s => {return scenario.equalsTo(s)}) === undefined) {
                scenario.run = 0;
                this.toExecute.push(scenario);
                if (! this.scenariosByLevel.has(scenario.level)) {
                    this.scenariosByLevel.set(scenario.level,[]);
                }
                this.scenariosByLevel.get(scenario.level).push(scenario);
            } 
        }
    }

    nextScenarioToExecute() {
        /*var randomLevel = this.scenariosByLevel.keys()[Math.floor(Math.random() * this.scenariosByLevel.keys().length)];
        var scenarioOfRandomLevel = this.scenariosByLevel.get(randomLevel);
        var candidateScenarios = scenarioOfRandomLevel.filter( s => s.run < this.maxRuns);
        var scenario = candidateScenarios[Math.floor(Math.random() * candidateScenarios.length)];
        if (!scenario) scenario = this.toExecute[0];
        if (! this.executed.find(s => scenario.equalsTo(s))) {
            this.executed.push(scenario);
        }*/
        var scenario = this.toExecute.shift();
        this.toExecute.push(scenario);
        if (! this.executed.find(s => scenario.equalsTo(s))) {
            this.executed.push(scenario);
        }
        scenario.run++;
        return scenario;
    }

    hasScenarioToExecute() {
        return this.toExecute.length > 0;
    }

    numberOfScenarioToExecute() {
        return this.toExecute.length;
    }

    numberOfExecutedScenario() {
        return this.executed.length;
    }

    getNumberOfRuns(scenarios) {

    }
}

module.exports.ScenarioManager = ScenarioManager;
