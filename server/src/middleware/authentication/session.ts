import session from "express-session";
import sessionFileStore from "session-file-store";
import config from "config";

// session support is required to use Passport
const fileStore = sessionFileStore(session);

const sessionConfigParameters: {
  secret: string;
  maxAge: number;
} = config.get("session");

const sessionConfig: session.SessionOptions = {
  cookie: { maxAge: sessionConfigParameters.maxAge },
  resave: true,
  saveUninitialized: true,
  secret: sessionConfigParameters.secret, // needs a random secret
};
// Setup the session store on disk
sessionConfig.store = new fileStore();

export default session(sessionConfig);
