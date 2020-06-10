import os from "os";
import fs from "fs";
import fileCache from "file-system-cache";
import { fetch, toPassportConfig } from "passport-saml-metadata";
import passport_saml from "passport-saml";
import config from "config";
import ParseNetId from "./parseNetId";

const samlStrategy = passport_saml.Strategy;
const backupStore = fileCache({ basePath: os.tmpdir() });

const passportConfig: any = config.get("passport");

// URL of the TU Delft Metadata
const url = passportConfig.idpUrl;

const passportConfiguration = function(passport: any) {
  fetch({ url, backupStore })
  .then((reader: any) => {
    // Setup config object
    const ppConfig: any = toPassportConfig(reader);
    ppConfig.realm = passportConfig.realm;
    ppConfig.protocol = passportConfig.protocol;
    ppConfig.issuer = passportConfig.issuer;
    ppConfig.callbackUrl = passportConfig.callbackUrl;

    // Certificate
    const cert = fs.readFileSync(passportConfig.certificate, "utf-8");
    const key = fs.readFileSync(passportConfig.key, "utf-8");

    ppConfig.privateCert = key;

    // Informtation to make the Metadata.xml file
    const decryptionCert = cert;
    ppConfig.decryptionPvk = key;

    // Setup Strategy
    const strategy = new samlStrategy(ppConfig,
      function (profile: any, done: any) {
          return done(undefined,
            {
              netid: ParseNetId.parseNetId(profile["uid"]),
              studentNumber: profile["tudStudentNumber"],
              firstName: profile["givenName"],
              prefix: profile["tudPrefix"],
              lastName: profile["sn"],
              email: profile["mail"],
              affiliation: profile["eduPersonAffiliation"],
              displayName: profile["displayName"],
              study: profile["nlEduPersonStudyBranch"],
              organisationUnit: profile["nlEduPersonOrgUnit"]
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
