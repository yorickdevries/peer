#!/bin/bash

# A simple script to perform postgres db backup.
# based on: https://www.cloudibee.com/scehedule-postgres-backups-script/

DATE=$(date +"%Y%m%d%H%M")

# location where databse backups need to be stored
cd /data_nfs/peer/database_backups

# database dump command
mysqldump --user=peer --password=password --lock-tables --databases peer > ./peer_database_backup-${DATE}.sql

# Cleanup configuration backups older than 30 days. 
#You can comment or adjust this if you donot want to delete old backups.

find /data_nfs/peer/database_backups -name "peer_database_backup-*.sql" -mtime +30 -type f -delete
