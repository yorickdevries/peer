#!/bin/bash
DATE=$(date +"%Y%m%d%H%M%S")
curl -I --max-time 5 https://peer.tudelft.nl/api/faculties

if [ $? -eq 0 ]
then
    echo "${DATE} alive" >> /data_nfs/peer/peer_alive.log
else
    echo "${DATE} dead" >> /data_nfs/peer/peer_alive.log
    service peer restart
fi
