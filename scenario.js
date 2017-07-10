class Action {
    constructor() {
        this.type = this.constructor.name;
    }
    toString() {
        return `${this.constructor.name}`;
    }

    equalsTo(action) {
        return this.type === action.type;
    }
}

class GotoAction extends Action {
    constructor(url) {
        super();
        this.url = url;
    }

    attachTo(promise) {
        return promise.goto(this.url);
    }

    toString() {
        return `${super.toString()}: ${this.url}`;
    }

    equalsTo(action) {
        return (super.equalsTo(action) && (this.url === action.url));
    }
}


class SelectorAction extends Action {
    constructor(selector) {
        super();
        this.selector = selector;
    }

    toString() {
        return `${super.toString()}: ${this.selector}`;
    }

    equalsTo(action) {
        return (super.equalsTo(action) && (this.selector === action.selector));
    }
}



class ClickAction extends SelectorAction {
    attachTo(promise) {
        return promise.click(this.selector);
    }
}


class MouseOverAction extends SelectorAction {
    attachTo(promise) {
        return promise.mouseover(this.selector);
    }
}

class CheckAction extends SelectorAction {
    attachTo(promise) {
        return promise.check(this.selector);
    }
}


class TypeAction extends Action {
    constructor(selector, text) {
        super();
        this.selector = selector;
        this.text = text;
    }

    attachTo(promise) {
        return promise.type(this.selector, this.text);
    }

    toString() {
        return `${super.toString()}: ${this.selector}, ${this.text}`;
    }

    equalsTo(action) {
        return (super.equalsTo(action) && (this.selector === action.selector) && (this.text === action.text));
    }
}


class ScrollToAction extends Action {
    constructor(x, y) {
        super();
        this.x = x;
        this.y = y;
    }

    attachTo(promise) {
        return promise.scrollTo(this.x, this.y);
    }

    toString() {
        return `${super.toString()}: ${this.x}, ${this.y}`;
    }

    equalsTo(action) {
        return (super.equalsTo(action) && (this.x === action.x) && (this.y === action.y));
    }
}


class WaitAction extends Action {
    constructor(ms) {
        super();
        this.ms = ms;
    }

    attachTo(promise) {
        return promise.wait(this.ms);
    }

    toString() {
        return `${super.toString()}: ${this.ms}ms`;
    }

    equalsTo(action) {
        return (super.equalsTo(action) && (this.ms === action.ms));
    }
}

class BackAction extends Action {

    attachTo(promise) {
        return promise.back();
    }
}



class Scenario {

    constructor(actionsJSON) {
        this.actions = [];
        this.index = undefined;
        if (actionsJSON) {
            actionsJSON.forEach(ac => {
                this.addAction(this.createAction(ac));
            });
        }
    }

    createAction(actionJSON) {
        switch (actionJSON.type) {
            case "GotoAction":
                return new GotoAction(actionJSON.url);
            case "ClickAction":
                return new ClickAction(actionJSON.selector);
            case "CheckAction":
                return new CheckAction(actionJSON.selector);
            case "MouseOverAction":
                return new MouseOverAction(actionJSON.selector);
            case "TypeAction":
                return new TypeAction(actionJSON.selector, actionJSON.text);
            case "ScrollToAction":
                return new ScrollToAction(actionJSON.x, actionJSON.x);
            case "WaitAction":
                return new WaitAction(actionJSON.ms);
            case "BackAction":
                return new BackAction();
        }
        return new WaitAction(1000);
    }

    toString() {
        return `[${this.actions.join(', ')}]`;
    }

    addAction(action) {
        if (this.index === undefined) {
            this.index = 0;
        }
        if (this.index === 0) {
            this.actions.push(action);
        }

    }

    get level() {
        return this.actions.length;
    }

    hasNext() {
        if (this.index === undefined) {
            return false;
        } else {
            return this.index < this.actions.length;
        }

    }

    next() {
        return this.actions[this.index++];
    }

    duplicate() {
        var dupication = new Scenario();
        this.actions.forEach(ac => dupication.addAction(ac));
        return dupication;
    }

    equalsTo(scenario) {
        if (this.actions.length === scenario.actions.length) {
            for (var i = 0; i < this.actions.length; i++) {
                if (! this.actions[i].equalsTo(scenario.actions[i])) {
                    return false;
                }
            }
            return true;
        } else {
            return false;
        }
    }
}


module.exports.Scenario = Scenario;
module.exports.GotoAction = GotoAction;
module.exports.ClickAction = ClickAction;
module.exports.CheckAction = CheckAction;
module.exports.MouseOverAction = MouseOverAction;
module.exports.TypeAction = TypeAction;
module.exports.WaitAction = WaitAction;
module.exports.ScrollToAction = ScrollToAction;
module.exports.BackAction = BackAction;
