module.exports = function() {
    var hostname = window.location.hostname;

    return {
        hostname: hostname,
        hash: generateHash(),
        selectors: grabSelector(),
        hrefs: grabHREF(),
        forms: grabForm()
    };

    function generateHash() {
        return JSON.stringify(document.body.innerHTML);
    }

    function generateStructuralDOMHash(element) {
        var openTagName = element.tagName ? `<${element.tagName}>` : "";
        var hash = openTagName;
        for (var i = 0; i < element.childNodes.length; i++) {
            hash = hash + generateStructuralDOMHash(element.childNodes[i]);
        }
        var closeTagName = element.tagName ? `</${element.tagName}>` : "";
        hash = hash + closeTagName;
        return hash.replace(/\s{2,10}/g, ' ');
    }

    function grabSelector() {
        var selectors = new Array();
        var a_links = document.getElementsByTagName('a');
        for (var i = 0; i < a_links.length; i++) {
            if (!isMailTo(a_links[i]) && !isPdfFile(a_links[i])) selectors.push(computeSelector(a_links[i]));
        }

        /*var img_links = document.getElementsByTagName('img');
        for (var i = 0; i < img_links.length; i++) {
            selectors.push(computeSelector(img_links[i]));
        }*/
        return selectors;

    }

    function grabHREF() {
        var hrefs = new Array();
        var a_links = document.getElementsByTagName('a');
        for (var i = 0; i < a_links.length; i++) {
            if (a_links[i].href) hrefs.push(a_links[i].href);
        }

        /*var img_links = document.getElementsByTagName('img');
        for (var i = 0; i < img_links.length; i++) {
            selectors.push(computeSelector(img_links[i]));
        }*/
        return hrefs;

    }

    function grabForm() {
        var forms = new Array();
        var form_tags = document.getElementsByTagName('form');
        for (var i = 0; i < form_tags.length; i++) {
            var form = { form_selector: computeSelector(form_tags[i]) };
            form.inputs = new Array();
            var input_tags = form_tags[i].getElementsByTagName('input')
            for (var j = 0; j < input_tags.length; j++) {
                form.inputs.push({
                    selector: computeSelector(input_tags[j]),
                    name: undefined || input_tags[j].getAttribute('name'),
                    value: undefined || input_tags[j].getAttribute('value'),
                    type: undefined || input_tags[j].getAttribute('type')
                });
            }
            forms.push(form);
        }
        return forms;
    }

    function computeSelector(el) {
        var names = [];
        while (el.parentNode) {
            if (el.id) {
                names.unshift(`#${el.id}`);
                break;
            } else {
                if (el == el.ownerDocument.documentElement)
                    names.unshift(el.tagName);
                else {
                    for (var c = 1, e = el; e.previousElementSibling; e = e.previousElementSibling, c++);
                    names.unshift(`${el.tagName}:nth-child(${c})`);
                }
                el = el.parentNode;
            }
        }
        return names.join(" > ");
    }


    /*function computeSelector(el) {
           var names = [];
           while (el.parentNode) {
               if (el == el.ownerDocument.documentElement)
                   names.unshift(el.tagName);
               else {
                   for (var c = 1, e = el; e.previousElementSibling; e = e.previousElementSibling, c++);
                   names.unshift(`${el.tagName}:nth-child(${c})`);
               }
               el = el.parentNode;
           }
           return names.join(" > ");
       }*/


    function isMailTo(a_link) {
        return a_link.href.includes('mailto');
    }

    function isPdfFile(a_link) {
        return a_link.href.endsWith('.pdf');
    }
}
