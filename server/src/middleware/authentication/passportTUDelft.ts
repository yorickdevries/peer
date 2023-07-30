import os from "os";
import fs from "fs";
import path from "path";
import fileCache from "file-system-cache";
import { fetch, toPassportConfig } from "passport-saml-metadata";
import {
  Strategy as SamlStrategy,
  SamlConfig,
  VerifyWithoutRequest as SamlVerify,
} from "@node-saml/passport-saml";
import config from "config";
import { PassportStatic } from "passport";
import saveUserFromSSO from "../../util/saveUserFromSSO";

const passportConfiguration = function (passport: PassportStatic): void {
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

      // Certificate
      const cert = fs.readFileSync(
        path.resolve(passportConfig.certificate),
        "utf-8"
      );
      const key = fs.readFileSync(path.resolve(passportConfig.key), "utf-8");

      // Information to make the Metadata.xml file
      const decryptionCert = cert;

      const samlConfig: SamlConfig = {
        cert: ppConfig.cert,
        entryPoint: ppConfig.entryPoint,
        logoutUrl: ppConfig.logoutUrl,
        identifierFormat: ppConfig.identifierFormat,
        issuer: passportConfig.issuer,
        protocol: passportConfig.protocol,
        decryptionPvk: key,
        callbackUrl: passportConfig.callbackUrl,
        path: passportConfig.callbackUrl,
        forceAuthn: true, // TODO: Improve this with single-sign-out behaviour.
      };

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const verificationFunction: SamlVerify = async (profile, done) => {
        if (!profile) {
          return done(new Error("SSO Login Profile not found"));
        }
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

      const logoutFunction: SamlVerify = (_profile, done) => {
        done(null);
      };

      // Setup Strategy
      const strategy = new SamlStrategy(
        samlConfig,
        verificationFunction,
        logoutFunction
      );

      // Generate metadata
      const metadataXML =
        strategy.generateServiceProviderMetadata(decryptionCert);
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        done(undefined, <any>user);
      });
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
};

export default passportConfiguration;
