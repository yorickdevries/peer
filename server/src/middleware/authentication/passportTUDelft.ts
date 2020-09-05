import os from "os";
import fs from "fs";
import path from "path";
import fileCache from "file-system-cache";
import { fetch, toPassportConfig } from "passport-saml-metadata";
import passportSaml from "passport-saml";
import config from "config";
import { PassportStatic } from "passport";
import saveUserFromSSO from "../../util/saveUserFromSSO";

const passportConfiguration = function (passport: PassportStatic): void {
  const samlStrategy = passportSaml.Strategy;
  const backupStore = fileCache({ basePath: os.tmpdir() });
  const passportConfig: {
    idpUrl: string;
    protocol: string;
    issuer: string;
    callbackUrl: string;
    certificate: string;
    key: string;
  } = config.get("passport");

  // URL of the TU Delft Metadata
  const url = passportConfig.idpUrl;

  fetch({ url, backupStore })
    .then((reader) => {
      // Setup config object
      const ppConfig = toPassportConfig(reader);
      ppConfig.protocol = passportConfig.protocol;
      ppConfig.issuer = passportConfig.issuer;
      ppConfig.callbackUrl = passportConfig.callbackUrl;

      // Certificate
      const cert = fs.readFileSync(
        path.resolve(passportConfig.certificate),
        "utf-8"
      );
      const key = fs.readFileSync(path.resolve(passportConfig.key), "utf-8");

      // Information to make the Metadata.xml file
      const decryptionCert = cert;
      ppConfig.decryptionPvk = key;

      const verificationFunction: passportSaml.VerifyWithoutRequest = async (
        profile,
        done
      ) => {
        // save the user to the database
        const userNetid = await saveUserFromSSO(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          profile["uid"] as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          profile["tudStudentNumber"] as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          profile["givenName"] as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          profile["tudPrefix"] as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          profile["sn"] as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          profile["mail"] as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          profile["displayName"] as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          profile["eduPersonAffiliation"] as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          profile["nlEduPersonStudyBranch"] as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          profile["nlEduPersonOrgUnit"] as any
        );
        if (userNetid) {
          const user = { netid: userNetid };
          return done(null, user);
        } else {
          return done(new Error("Unable to save User from SSO"));
        }
      };

      // Setup Strategy
      const strategy = new samlStrategy(ppConfig, verificationFunction);

      // Generate metadata
      const metadataXML = strategy.generateServiceProviderMetadata(
        decryptionCert
      );
      const metadataPath = path.resolve(
        config.get("ServiceProviderMetadataFile")
      );
      fs.writeFileSync(metadataPath, metadataXML);
      console.log(`metadataXML written to: ${metadataPath}`);
      passport.use("saml", strategy);

      passport.serializeUser((user, done) => {
        done(undefined, user);
      });

      passport.deserializeUser((user, done) => {
        done(undefined, user);
      });
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
};

export default passportConfiguration;
