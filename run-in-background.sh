#!/bin/bash
mkdir -p logs
nohup bin/www > logs/control.out logs/control.err < /dev/null &
