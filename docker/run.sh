#!/bin/bash
mkdir work
cd work
git https://github.com/mrs-sam/scenario.git
ls 
cd scenario
npm install
xvfb-run --server-args="-screen 0 1024x768x24" node server.js mongo