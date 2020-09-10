#!/bin/bash
DATE=$(date +"%Y%m%d%H%M%S")
RESPONSECODE=$(curl --head --max-time 120 -s -o /dev/null -w "%{http_code}" https://peer.tudelft.nl/api/faculties)
curl --max-time 120 https://peer.tudelft.nl/api/faculties

if [[ $? -eq 0 && $RESPONSECODE -eq 200 ]]
then
    echo "${DATE} alive $? $RESPONSECODE" >> /data_nfs/peer/peer_alive.log
else
    echo "${DATE} dead $? $RESPONSECODE" >> /data_nfs/peer/peer_alive.log
    /usr/sbin/service peer restart
fi
