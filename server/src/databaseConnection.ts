import "reflect-metadata"; // needed for typeORM to work
import { createConnection, Connection, ConnectionOptions } from "typeorm";
import config from "config";
// Database models
import User from "./models/User";
import Affiliation from "./models/Affiliation";
import Study from "./models/Study";
import OrganisationUnit from "./models/OrganisationUnit";
import Faculty from "./models/Faculty";
import AcademicYear from "./models/AcademicYear";
import Course from "./models/Course";
import Enrollment from "./models/Enrollment";
import Assignment from "./models/Assignment";
import File from "./models/File";
import Group from "./models/Group";
import Submission from "./models/Submission";
import Questionnaire from "./models/Questionnaire";
import SubmissionQuestionnaire from "./models/SubmissionQuestionnaire";
import ReviewQuestionnaire from "./models/ReviewQuestionnaire";
import Question from "./models/Question";
import OpenQuestion from "./models/OpenQuestion";
// Database models

const databaseConfig: {
  type: string;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  connectionUrl?: string;
} = config.get("database");

const createDatabaseConnection = async function (): Promise<Connection> {
  const baseConfig = {
    entities: [
      User,
      Affiliation,
      Study,
      OrganisationUnit,
      Faculty,
      AcademicYear,
      Course,
      Enrollment,
      Assignment,
      File,
      Group,
      Submission,
      Questionnaire,
      SubmissionQuestionnaire,
      ReviewQuestionnaire,
      Question,
      OpenQuestion,
    ],
    synchronize: true, // must be set to false once deployed to production (we should switch to migrations instead)
    logging: false,
  };
  // will be assigned in the switch statement
  let connectionConfig: ConnectionOptions;

  switch (databaseConfig.type) {
    case "mysql": {
      let mysqlConfig;
      if (databaseConfig.connectionUrl) {
        // Use the URL to set up the connection (like for Heroku)
        mysqlConfig = {
          type: databaseConfig.type,
          url: databaseConfig.connectionUrl,
        };
      } else {
        // use the other parameters
        mysqlConfig = {
          type: databaseConfig.type,
          host: databaseConfig.host,
          port: databaseConfig.port,
          username: databaseConfig.username,
          password: databaseConfig.password,
          database: databaseConfig.database,
        };
      }
      connectionConfig = { ...baseConfig, ...mysqlConfig };
      break;
    }
    // in memory database for testing
    case "sqlite": {
      const sqliteConfig = {
        type: databaseConfig.type,
        database: ":memory:",
        dropSchema: true,
      };
      connectionConfig = { ...baseConfig, ...sqliteConfig };
      break;
    }
    default:
      throw new Error(`Invalid Database type: ${databaseConfig.type}`);
  }
  return createConnection(connectionConfig);
};

export default createDatabaseConnection;
