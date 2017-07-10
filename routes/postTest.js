module.exports.init = function(ws, db, ObjectID) {
    ws.post('/test', function(req, res) {
        var options = req.body;
        //options.map = {active: false};
        options.crawler.show = true;
        options.diff = { active: false };
        options.replay = { active: false };

        var test = {};
        test.options = options;
        test._id = ObjectID();

        db.collection("test",function(err,testCollection) {
            if (!err) testCollection.save(test);
        });

        var Crawler = require('../crawler.js').Crawler;
        var crawler = new Crawler(options.URL, options);
        crawler.addProgressionListener(notification => {
            switch (notification.type) {
                case 'CRAWLER_OK':
                    saveStatistics(notification.value);
                    break;
                case 'CRAWLER_ERROR':
                    break;
                case 'SCENARIO_OK':
                case 'SCENARIO_ERROR':
                    saveScenario(notification.value);
                    break;
            }
        });
        crawler.start(function(err) {}, function(result) {});
        res.send(`Test request has been received, please look at the result page in ${options.crawler.time} minutes.`);
        res.status(200).end();


        function saveStatistics(result) {
            db.collection("test", function(err, testCollection) {
                if (err) {
                    res.status(500).end();
                } else {
                    test.duration = result.duration;
                    testCollection.save(test);
                }
            })
        }

        function saveScenario(scenario) {
            db.collection("scenario", function(err, scenarioCollection) {
                if (!err) {
                    if (!scenario._id) {
                        scenario._id = ObjectID();
                    }
                    scenario.test_id = test._id;
                    scenarioCollection.save(scenario);
                }
            })
        }
    })
};
