import isCI from "is-ci";

// configuration
const config = {
    database: {
        connection: {
            user: "postgres",
            host: "localhost",
            database: "peer_database",
            password: "password",
            port: 5432
          }
        },
    delftSSO: false,
    session: {
        secret: "add something random here"
    }
};

// In case of CI, change hostname to postgres
if (isCI) {
    console.log("The code is running on a CI server");
    config.database.connection.host = "postgres";
}

export default config;