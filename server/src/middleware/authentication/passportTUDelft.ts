import os from "os";
import fs from "fs";
import path from "path";
import fileCache from "file-system-cache";
// Needs to be updated and tested with newest version of the package
import { fetch, toPassportConfig } from "passport-saml-metadata";
// Needs to be updated and tested with newest version of the package
import passport_saml from "passport-saml";
import config from "config";
import { PassportStatic } from "passport";
import saveUserFromSSO from "../../util/saveUserFromSSO";

const passportConfiguration = function (passport: PassportStatic): void {
  const samlStrategy = passport_saml.Strategy;
  const backupStore = fileCache({ basePath: os.tmpdir() });
  const passportConfig: {
    idpUrl: string;
    realm: string;
    protocol: string;
    issuer: string;
    callbackUrl: string;
    certificate: string;
    key: string;
  } = config.get("passport");

  // URL of the TU Delft Metadata
  const url = passportConfig.idpUrl;

  fetch({ url, backupStore }).then((reader: any) => {
    // Setup config object
    const ppConfig = toPassportConfig(reader);
    ppConfig.realm = passportConfig.realm;
    ppConfig.protocol = passportConfig.protocol;
    ppConfig.issuer = passportConfig.issuer;
    ppConfig.callbackUrl = passportConfig.callbackUrl;

    // Certificate
    const cert = fs.readFileSync(
      path.resolve(passportConfig.certificate),
      "utf-8"
    );
    const key = fs.readFileSync(path.resolve(passportConfig.key), "utf-8");

    ppConfig.privateCert = key;

    // Information to make the Metadata.xml file
    const decryptionCert = cert;
    ppConfig.decryptionPvk = key;

    // Setup Strategy
    const strategy = new samlStrategy(
      ppConfig,
      async (profile: any, done: any) => {
        // save the user to the database
        const userNetid = await saveUserFromSSO(
          profile["uid"],
          profile["tudStudentNumber"],
          profile["givenName"],
          profile["tudPrefix"],
          profile["sn"],
          profile["mail"],
          profile["displayName"],
          profile["eduPersonAffiliation"],
          profile["nlEduPersonStudyBranch"],
          profile["nlEduPersonOrgUnit"]
        );
        if (userNetid) {
          return done(undefined, userNetid);
        } else {
          // no user will be logged in (needs to be tested in production)
          return done(undefined, false);
        }
      }
    );

    // Generate metadata
    const metadataXML = strategy.generateServiceProviderMetadata(
      decryptionCert
    );
    const metadata_path = path.resolve(config.get("SP_metadata_file"));
    fs.writeFileSync(metadata_path, metadataXML);
    console.log(`metadataXML written to: ${metadata_path}`);
    passport.use("saml", strategy);

    passport.serializeUser((user, done) => {
      done(undefined, user);
    });

    passport.deserializeUser((user, done) => {
      done(undefined, user);
    });
  });
};

export default passportConfiguration;
