import isCI from "is-ci";
import path from "path";

// configuration
const config = {
    database: {
        connection: {
            user: "postgres",
            host: "localhost",
            database: "peer_database",
            password: "password",
            port: 5432
          },
        schemaQueryFile: path.join(__dirname, "../database_dumps/ED3-DataBaseSchema.sql"),
        fullQueryFile: path.join(__dirname, "../database_dumps/ED3-FullData.sql"),
        testQueryFile: path.join(__dirname, "../database_dumps/ED3-TestData.sql")
        },
    session: {
        secret: "add something random here"
    },
    assignments: {
        fileFolder: path.join(__dirname, "./files/assignments"),
        maxSizeAssignmentFile: 30 * 1024 * 1024
    },
    submissions: {
        fileFolder: path.join(__dirname, "./files/submissions"),
        maxSizeSubmissionFile: 30 * 1024 * 1024
    },
    exampleData: {
        exampleAssignmentFolder: path.join(__dirname, "../example_data/assignments"),
        exampleSubmissionFolder: path.join(__dirname, "../example_data/submissions")
    },
    passport: {
        idpUrl: "https://gatekeeper2.tudelft.nl/openaselect/profiles/saml2",
        realm: "urn:nodejs:passport-saml-metadata-example-app",
        protocol: "saml2",
        issuer: "peer.ewi.tudelft.nl",
        callbackUrl: "https://peer.ewi.tudelft.nl/api/login/callback",
        certificate: "/var/www/peer/cert/peer_ewi_tudelft_nl.crt",
        key: "/var/www/peer/cert/peer.ewi.tudelft.nl.key"
    },
    allowed_extensions: [".pdf", ".zip"]
};

// In case of CI, change hostname to postgres
if (isCI) {
    console.log("The code is running on a CI server");
    config.database.connection.host = "postgres";
}

export default config;