#!/usr/bin/env bash
cp room-control.socket /etc/systemd/system/.
cp room-control.service /etc/systemd/system/.
systemctl --system daemon-reload
systemctl enable room-control.socket
systemctl start room-control.socket
systemctl status systemctl room-control.socket
