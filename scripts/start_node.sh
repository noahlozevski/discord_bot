#!/bin/bash

# starts the node script
source /home/ubuntu/.bashrc
pwd
cd /home/ubuntu/discord
ls
pwd
npm install
# kill all previous bots
killall node
# start the app
nohup node index.js &
disown