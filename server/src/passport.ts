import os from "os";
import fs from "fs";
import fileCache from "file-system-cache";
import { fetch, toPassportConfig } from "passport-saml-metadata";
import passport_saml from "passport-saml";

const samlStrategy = passport_saml.Strategy;
const backupStore = fileCache({ basePath: os.tmpdir() });

// URL OF THE TU Delft METADATA
const url = "https://gatekeeper2.tudelft.nl/openaselect/profiles/saml2";

const passportConfiguration = function(passport: any) {
  fetch({ url, backupStore })
  .then((reader: any) => {
    // Setup config object
    const config = toPassportConfig(reader);
    config.realm = "urn:nodejs:passport-saml-metadata-example-app";
    config.protocol = "saml2";
    config.issuer = "peer.ewi.tudelft.nl";
    config.callbackUrl = "https://peer.ewi.tudelft.nl/api/login/callback";

    // Certificate
    const cert = fs.readFileSync("/var/www/peer/cert/peer_ewi_tudelft_nl.crt", "utf-8");
    const key = fs.readFileSync("/var/www/peer/cert/peer.ewi.tudelft.nl.key", "utf-8");

    config.privateCert = key;

    // Informtation to make the Metadata.xml file
    const decryptionCert = cert;
    config.decryptionPvk = key;

    // Setup Strategy
    const strategy = new samlStrategy(config,
      function (profile: any, done: any) {
          return done(undefined,
            {
              netid: profile["urn:mace:dir:attribute-def:uid"],
              studentNumber: profile["tudStudentNumber"],
              firstName: profile["givenName"],
              prefix: profile["tudPrefix"],
              lastName: profile["sn"],
              email: profile["mail"],
              function: profile["urn:mace:dir:attribute-def:eduPersonAffiliation"],
              displayName: profile["displayName"],
              nameID: profile["nameID"],
              nameIDFormat: profile["nameIDFormat"]
            });
      });

    // Generate metadata
    const metadataXML = strategy.generateServiceProviderMetadata(decryptionCert);
    fs.writeFileSync("./SP_Metadata.xml", metadataXML);
    console.log("metadataXML written to: ./SP_Metadata.xml");
    passport.use("saml", strategy);

    passport.serializeUser((user: any, done: any) => {
      done(undefined, user);
    });

    passport.deserializeUser((user: any, done: any) => {
      done(undefined, user);
    });
  });

};

export default passportConfiguration;
