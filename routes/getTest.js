module.exports.init = function(ws, db, ObjectID) {
    ws.get('/test', function(req, res) {
            db.collection("test", function(err, testCollection) {
                if (err) {
                    res.send(err).status(404).end();
                } else {
                    testCollection.find().toArray(function(err, testsArray) {
                        if (err) {
                            res.send(err).status(500).end();
                        } else {
                            res.send(testsArray).status(200).end();
                        }
                    });
                }
            })
        })
        .get('/test/:id', function(req, res) { //req.params.id
            db.collection("scenario", function(err, scenarioCollection) {
                if (err) {
                    res.send(err).status(404).end();
                } else {
                    scenarioCollection.find({test_id: new ObjectID(req.params.id)}).toArray(function(err, scenarioArray) {
                        if (err) {
                            res.send(err).status(500).end();
                        } else {
                            res.send(scenarioArray).status(200).end();
                        }
                    });
                }
            })
        })
}
