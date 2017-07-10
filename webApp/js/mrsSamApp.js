(function() {
    'use strict';

    angular.module('mrsSamApp', ['ngResource']);

    angular.module('mrsSamApp').factory('testService', ['$resource', testServiceFactory]);

    function testServiceFactory($resource) {
        return $resource('./test/:id', {}, {
            query: {
                method: 'GET',
                isArray: true,
                cache: false
            },
            get: {
                method: 'GET',
                isArray: true,
                cache: false
            }
        });
    }



    angular.module('mrsSamApp').controller('testFormController', ['$scope', '$http', testFormControllerFactory]);

    function testFormControllerFactory($scope, $http) {
        $scope.options = {
            URL: "http://localhost:8080/test-site",
            crawler: {
                maxsteps: 5,
                maxruns: 5,
                time: 2,
                wait: 1000
            },
            scenario: {
                click: { active: true },
                scroll: { active: false, "scroll_x": 2000, "scroll_y": 4000 },
                form: { active: true },
                back: { active: true },
                mouseover: { active: false },
                wait: { active: false, "wait": 4000 }
            },
            map: {
                active: false
            }
        };

        $scope.crawl = function(options) {
            $http.post('/test', options).then(function successCallback(response) {
                alert(response.data);
            }, function errorCallback(response) {});
        }
    }


    angular.module('mrsSamApp').controller('testsViewController', ['$scope', 'testService', testsViewControllerFactory]);

    function testsViewControllerFactory($scope, testService) {
        $scope.tests = testService.get();
        $scope.show = false;
        $scope.test = {};
        $scope.statistics = {};

        $scope.showTest = function(test) {
            $scope.test = test;
            testService.query({ id: test._id }, function(resultFromBD) {
                $scope.executedScenario = resultFromBD;
                $scope.show = true;
                computeStatisticsAndErrors();
            });

            function computeStatisticsAndErrors() {
                $scope.statistics.duration = $scope.test.duration;
                $scope.statistics.numberOfExecuterScenario = $scope.executedScenario.length;
                $scope.statistics.consoleErrors = 0;
                $scope.statistics.pageErrors = 0;
                $scope.statistics.httpErrors = 0;
                $scope.statistics.crawlerErrors = 0;

                $scope.consoleErrors = [];
                $scope.pageErrors = [];
                $scope.httpErrors = [];
                $scope.crawlerErrors = [];

                $scope.executedScenario.forEach(scenario => {
                    scenario.actions.forEach(action => {
                        if (action.errors) {
                            action.errors.forEach(error => {
                                switch (error.type) {
                                    case 'console':
                                        $scope.statistics.consoleErrors++;
                                        error.scenario_id = scenario._id;
                                        $scope.consoleErrors.push(error);
                                        break;
                                    case 'page':
                                        error.scenario_id = scenario._id;
                                        $scope.pageErrors.push(error);
                                        $scope.statistics.pageErrors++;
                                        break;
                                    case 'http':
                                        error.scenario_id = scenario._id;
                                        $scope.httpErrors.push(error);
                                        $scope.statistics.httpErrors++;
                                        break;
                                    case 'crawler':
                                        error.scenario_id = scenario._id;
                                        $scope.crawlerErrors.push(error);
                                        $scope.statistics.crawlerErrors++;
                                }
                            })
                        }
                    })
                });
            }
        }

        $scope.getScenario = function(scenario_id) {
            return $scope.executedScenario.find(s => s._id === scenario_id)
        }

        $scope.saveScenario = function(scenario_id) {
            var scenario = $scope.getScenario(scenario_id);
            var blob = new Blob([JSON.stringify(scenario)], { type: "application/json" });
            saveAs(blob, "scenario.json");
        }
    }

    angular.module('mrsSamApp').directive('test', resultFactory);

    function resultFactory() {
        return {
            restrict: 'E',
            templateUrl: 'template/testView.html'
        };
    };


})();
