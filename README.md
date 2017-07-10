# Mrs-Sam Scenario : A Headless Monkey tester for web sites

Mrs-Sam Scenario is a headless JS Web Site Monkey Tester that automatically tests any website to check if it contains any errors.

## Installation

Clone the repository and perform `npm install` in the scenario folder.

## Usage cli (no DataBase)

To run a test of web site:

    node tester.js --options=[string] --url=[string] --out=[string]


* --options: the configuration file (see default is options.js)
* --url: the url of the website you want to crawl (ex: http://www.amazon.fr)
* --out: the prefix of the output file(s)


## Usage GUI (with a DataBase)

A mongodb should run (with default port 27017)

To run the GUI web server:

    node server.js localhost


* localhost is the name of the mongodb server 

Then you can play with Mrs Sam front-end (http://localhost:8080).


## Docker GUI + MongoDB

Mrs Sam is coming with a Docker compose installer.

Go to the docker directory and run:

    docker-compose up 

Then you can play with Mrs Sam front-end (http://localhost:8080).

