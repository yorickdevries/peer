import os from "os";
import fs from "fs";
import fileCache from "file-system-cache";
// Needs to be updated and tested with newest version of the package
import { fetch, toPassportConfig } from "passport-saml-metadata";
// Needs to be updated and tested with newest version of the package
import passport_saml from "passport-saml";
import config from "config";
import parseNetId from "../../util/parseNetId";
import { PassportStatic } from "passport";

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
    const cert = fs.readFileSync(passportConfig.certificate, "utf-8");
    const key = fs.readFileSync(passportConfig.key, "utf-8");

    ppConfig.privateCert = key;

    // Information to make the Metadata.xml file
    const decryptionCert = cert;
    ppConfig.decryptionPvk = key;

    // Setup Strategy
    const strategy = new samlStrategy(ppConfig, (profile: any, done: any) => {
      return done(undefined, {
        netid: parseNetId(profile["uid"]),
        studentNumber: profile["tudStudentNumber"],
        firstName: profile["givenName"],
        prefix: profile["tudPrefix"],
        lastName: profile["sn"],
        email: profile["mail"],
        affiliation: String(profile["eduPersonAffiliation"]),
        displayName: profile["displayName"],
        study: profile["nlEduPersonStudyBranch"],
        organisationUnit: String(profile["nlEduPersonOrgUnit"]),
      });
    });

    // Generate metadata
    const metadataXML = strategy.generateServiceProviderMetadata(
      decryptionCert
    );
    fs.writeFileSync("./SP_Metadata.xml", metadataXML);
    console.log("metadataXML written to: ./SP_Metadata.xml");
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
