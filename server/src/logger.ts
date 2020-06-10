import logger from "morgan";
import forwarded from "forwarded-for";

// Include the netid as token for logs
logger.token("netid", function(req, res) {
    if (req.user != undefined) {
        return req.user.netid;
    } else {
        return undefined;
    }
});

// Include the original ip as token for logs
logger.token("ipadress", function(req, res) {
    const address = forwarded(req, req.headers);
    return address.ip;
});

const loggerFormat = ":netid :ipadress [:date[clf]] \":method :url HTTP/:http-version\" :status :res[content-length]";

// logger for all events
const eventLogger = logger(loggerFormat);

// logger for only server errors
const errorLogger = logger(loggerFormat,
    {
    skip: function (req, res) { return res.statusCode < 500; },
    stream: process.stderr
    }
);

export { eventLogger, errorLogger };