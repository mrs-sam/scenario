//log
var winston = require('winston');

var sce = require('./scenario.js');
var GotoAction = sce.GotoAction;
var WaitAction = sce.WaitAction;
var ClickAction = sce.ClickAction;
var ScrollToAction = sce.ScrollToAction;
var MouseOverAction = sce.MouseOverAction;
var CheckAction = sce.CheckAction;
var TypeAction = sce.TypeAction;
var BackAction = sce.BackAction;
var Scenario = sce.Scenario;


class ScenarioGenerator {

    constructor(url, options) {
        this.url = url;
        this.options = options;
        this.id = 0;
    }


    generateInitialScenario() {
        var initScenario = new Scenario();
        initScenario.addAction(new GotoAction(this.url));
        initScenario.id = this.id;
        this.id++;
        //initScenario.addAction(new WaitAction(this.options.crawler.wait));
        //winston.info(`An initial scenario has been created and registered to the ScenarioManager.`);
        return initScenario;
    }


    generateNewScenari(orginalScenario, htmlEvaluation) {
        var scenari = []
        var is_locale = this.url.includes(htmlEvaluation.hostname);
        if (this.options.scenario.click.active && is_locale) {
            scenari = scenari.concat(this.generateClickScenari(orginalScenario, htmlEvaluation));
        }
        if (this.options.scenario.scroll.active && is_locale) {
            scenari = scenari.concat(this.generateScrollToScenari(orginalScenario));
        }
        if (this.options.scenario.mouseover.active && is_locale) {
            scenari = scenari.concat(this.generateMouseOverScenari(orginalScenario, htmlEvaluation));
        }
        if (this.options.scenario.wait.active && is_locale) {
            scenari = scenari.concat(this.generateWaitScenari(orginalScenario));
        }
        if (this.options.scenario.form.active && is_locale) {
            scenari = scenari.concat(this.generateFormScenari(orginalScenario, htmlEvaluation));
        }
        if (this.options.scenario.back.active || !is_locale) {
            if (orginalScenario.actions.length > 1) {
                if  (orginalScenario.actions[orginalScenario.actions.length-1].type !== "BackAction") {
                    scenari = scenari.concat(this.generateBackScenari(orginalScenario));
                }
            } 
        }
        return scenari;
    }

    generateClickScenari(orginalScenario, htmlEvaluation) {
        //winston.info(`${htmlEvaluation.selectors.length} selectors have been extracted and transformed into new scenario`);
        var scenari = [];
        for (var i = 0; i < htmlEvaluation.selectors.length; i++) {
            var new_scenario = orginalScenario.duplicate();
            var action = new ClickAction(htmlEvaluation.selectors[i]);
            new_scenario.addAction(action);
            new_scenario.id = this.id;
            this.id++;
            //new_scenario.addAction(new WaitAction(this.options.crawler.wait));
            scenari.push(new_scenario);
        }
        return scenari;
    }

    generateFormScenari(orginalScenario, htmlEvaluation) {
        //winston.info(`${htmlEvaluation.forms.length} forms have been extracted and transformed into new scenario`);
        var scenari = [];
        for (var i = 0; i < htmlEvaluation.forms.length; i++) {
            scenari.push(this.generateFormScenario(orginalScenario, htmlEvaluation.forms[i]));
        }
        return scenari;
    }

    generateFormScenario(orginalScenario, form) {
        var type_actions = [];
        var check_actions = [];
        var click_actions = [];
        for (var i = 0; i < form.inputs.length; i++) {
            switch (form.inputs[i].type) {
                case 'text':
                    type_actions.push(new TypeAction(form.inputs[i].selector, "test"));
                    break;
                case 'password':
                    type_actions.push(new TypeAction(form.inputs[i].selector, "test"));
                    break;
                case 'reset':
                    break;
                case 'radio':
                    check_actions.push(new CheckAction(form.inputs[i].selector));
                    break;
                case 'checkbox':
                    check_actions.push(new CheckAction(form.inputs[i].selector));
                    break;
                case 'button':
                    click_actions.push(new ClickAction(form.inputs[i].selector));
                    break;
                case 'submit':
                    click_actions.push(new ClickAction(form.inputs[i].selector));
                    break;
            }
        }
        var new_scenario = orginalScenario.duplicate();
        type_actions.forEach((action) => new_scenario.addAction(action));
        check_actions.forEach((action) => new_scenario.addAction(action));
        //click_actions.forEach((action) => new_scenario.addAction(action));
        if (click_actions.length > 0) new_scenario.addAction(click_actions[0]);
        //new_scenario.addAction(new WaitAction(this.options.crawler.wait));
        new_scenario.id = this.id;
        this.id++;
        return new_scenario;
    }

    generateScrollToScenari(orginalScenario) {
        var new_scenario = orginalScenario.duplicate();
        var action = new ScrollToAction(this.options.scenario.scroll.scroll_x, this.options.scenario.scroll.scroll_y);
        new_scenario.addAction(action);
        //new_scenario.addAction(new WaitAction(this.options.crawler.wait));
        new_scenario.id = this.id;
        this.id++;
        return new_scenario;
    }

    generateMouseOverScenari(orginalScenario, htmlEvaluation) {
        var scenari = []
        for (var i = 0; i < htmlEvaluation.selectors.length; i++) {
            var new_scenario = orginalScenario.duplicate();
            var action = new MouseOverAction(htmlEvaluation.selectors[i]);
            new_scenario.addAction(action);
            new_scenario.id = this.id;
            this.id++;
            //new_scenario.addAction(new WaitAction(this.options.crawler.wait));
            scenari.push(new_scenario);
        }
        return scenari;
    }

    generateWaitScenari(orginalScenario) {
        var new_scenario = orginalScenario.duplicate();
        var action = new WaitAction(this.options.scenario.wait.wait);
        new_scenario.addAction(action);
        new_scenario.id = this.id;
        this.id++;
        //new_scenario.addAction(new WaitAction(this.options.crawler.wait));
        return new_scenario;
    }

    generateBackScenari(orginalScenario) {
        var new_scenario = orginalScenario.duplicate();
        var action = new BackAction();
        new_scenario.addAction(action);
        new_scenario.id = this.id;
        this.id++;
        //new_scenario.addAction(new WaitAction(this.options.crawler.wait));
        return new_scenario;
    }
}

module.exports.ScenarioGenerator = ScenarioGenerator;
