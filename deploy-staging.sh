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
echo "         Ensuring config dir exists at $RELEASE_DIR/server/config"
mkdir -p "$RELEASE_DIR/server/config" || exit 2

echo "         Symlinking server/config/staging.json..."
rm "$RELEASE_DIR/server/config/staging.json" || true
ln -s "$SHARED_DIR/server/config/staging.json" "$RELEASE_DIR/server/config/staging.json" || exit 3

echo "         Symlinking server/sessions..."
ln -sfn "$SHARED_DIR/server/sessions" "$RELEASE_DIR/server/sessions" || exit 4

echo "         Symlinking client/.env.staging..."
rm "$RELEASE_DIR/client/.env.production" || true
rm "$RELEASE_DIR/client/.env.staging" || true
ln -s "$SHARED_DIR/client/.env.staging" "$RELEASE_DIR/client/.env.staging" || exit 5


# Backup
echo "1 - BACKUP"
echo "         Skipping backup for staging"

# Install packages
echo "2 - INSTALL"
echo "         Installing server packages"
cd "$RELEASE_DIR/server"
npm install || exit 20
echo "         Installing client packages"
cd "$RELEASE_DIR/client"
npm install || exit 21

# Build npm
echo "3 - BUILD"
echo "         Building server"
cd "$RELEASE_DIR"
NODE_ENV=staging SENTRY_RELEASE="staging_$TIMESTAMP" npm run build_server || exit 30

echo "         Creating sentry release (server)"
sentry-cli releases new --project "peer-backend" "$staging_TIMESTAMP"
sentry-cli releases files --project "peer-backend" "staging_$TIMESTAMP" upload-sourcemaps server/dist
sentry-cli releases finalize --project "peer-backend" "staging_$TIMESTAMP"

echo "         Building client"
echo "VUE_APP_SENTRY_RELEASE=staging_$TIMESTAMP" > "$RELEASE_DIR/client/.env"
NODE_ENV=staging npm run build_client || exit 31

echo "         Creating sentry release (client)"
sentry-cli releases new --project "peer-frontend" "staging_$TIMESTAMP"
sentry-cli releases files --project "peer-frontend" "staging_$TIMESTAMP" upload-sourcemaps server/dist/public
sentry-cli releases finalize --project "peer-frontend" "staging_$TIMESTAMP"

# Run the migrations
echo "4 - MIGRATE"
echo "         Running migrations"
cd "$RELEASE_DIR/server"
NODE_ENV=staging npm run typeorm:migration:run || exit 40

# Switch the symlink
echo "5 - DEPLOY"
echo "         Switching symlink to new version"
ln -snf "$RELEASE_DIR" "$DEPLOY_PATH/current" || exit 50

# Cleanup old releases
echo "6 - CLEANUP"
echo "         Removing old releases (keeping last 5)"
cd "$DEPLOY_PATH/releases" || exit 60
ls -rp "$DEPLOY_PATH/releases" | grep "/$" | tail -n +6 | xargs -d '\n' -r rm -r --

# Restart the service
echo "         Restarting service"
sudo /bin/systemctl restart peer

echo ""
echo "Deployment complete"
