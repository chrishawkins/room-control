#!/usr/bin/env bash
mkdir -p logs
nohup bin/www > logs/control.out 2> logs/control.err < /dev/null &
echo $! > .pid
