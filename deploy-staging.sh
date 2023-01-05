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
echo "         Symlinking server/config/staging.json..."
# Create folder, delete file from repo (if it exists) and then symlink
mkdir -p "$RELEASE_DIR/server/config" || exit 2
rm "$RELEASE_DIR/server/config/staging.json" || true
ln -s "$SHARED_DIR/config/staging.json" "$RELEASE_DIR/server/config/staging.json" || exit 3

# Backup
echo "1 - BACKUP"
echo "         Skipping backup for staging"

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
NODE_ENV=staging && SENTRY_RELEASE="$TIMESTAMP" && npm run build_server || exit 7

# Create server release
sentry-cli releases new --project "peer-backend" "$TIMESTAMP"
sentry-cli releases files --project "peer-backend" "$TIMESTAMP" upload-sourcemaps server/dist
sentry-cli releases finalize --project "peer-backend" "$TIMESTAMP"

echo "         Building client"
NODE_ENV=staging && echo "VUE_APP_SENTRY_RELEASE=$TIMESTAMP" > "$RELEASE_DIR/client/.env" && npm run build_client || exit 8

#Create client release
sentry-cli releases new --project "peer-frontend" "$TIMESTAMP"
sentry-cli releases files --project "peer-frontend" "$TIMESTAMP" upload-sourcemaps server/dist/public
sentry-cli releases finalize --project "peer-frontend" "$TIMESTAMP"

# Run the migrations
echo "4 - MIGRATE"
echo "         Running migrations"
cd "$RELEASE_DIR/server"
NODE_ENV=staging npm run typeorm:migration:run || exit 9

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
