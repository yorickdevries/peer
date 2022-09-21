#!/bin/bash

if [ $# -eq 0 ]
then
        TIMESTAMP="$(date '+%Y%m%d%H%M%S')"
else
        TIMESTAMP=$1
fi

# Variables
DEPLOY_PATH="/var/www/peer"
RELEASE_DIR="$DEPLOY_PATH/releases/$TIMESTAMP"
SHARED_DIR="$DEPLOY_PATH/shared"
USER="$(whoami)"

# Setting up the new release
echo "0 - INIT"
# Symlink the config
echo "         Ensuring config dir exists at $RELEASE_DIR/server/config"
echo "         Symlinking server/config/production.json..."
# Create folder, delete file from repo (if it exists) and then symlink
mkdir -p "$RELEASE_DIR/server/config" || exit 2
rm "$RELEASE_DIR/server/config/production.json" || true
ln -s "$SHARED_DIR/server/config/production.json" "$RELEASE_DIR/server/config/production.json" || exit 3

# Backup
echo "1 - BACKUP"
echo "         Backing up database"
backupninja -n

# Install packages
echo "2 - INSTALL"
echo "         Installing server packages"
cd "$RELEASE_DIR/server"
npm install || exit 5
echo "         Installing client packages"
cd "$RELEASE_DIR/client"
npm install || exit 6

# Build npm
echo "3 - BUILD"
echo "         Building server"
cd "$RELEASE_DIR"
NODE_ENV=production npm run build_server || exit 7
echo "         Building client"
NODE_ENV=production npm run build_client || exit 8

# Run the migrations
echo "4 - MIGRATE"
echo "         Running migrations"
cd "$RELEASE_DIR/server"
NODE_ENV=production npm run typeorm:migration:run || exit 9

# Switch the symlink
echo "5 - DEPLOY"
echo "         Switching symlink to new version"
ln -snf "$RELEASE_DIR" "$DEPLOY_PATH/current" || exit 10

# Cleanup old releases
echo "6 - CLEANUP"
echo "         Removing old releases (keeping last 5)"
cd "$DEPLOY_PATH/releases" || exit 11
ls -rp "$DEPLOY_PATH/releases" | grep "/$" | tail -n +6 | xargs -d '\n' -r rm -r --

# Restart the service
echo "         Restarting service"
sudo /bin/systemctl restart peer

echo ""
echo "Deployment complete"
