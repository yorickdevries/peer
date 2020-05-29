import logger from "morgan";

// Include the netid as token for logs
logger.token("netid", function(req, res) {
    if (req.user != undefined) {
        return req.user.netid;
    } else {
        return undefined;
    }
});

const loggerFormat = "(:netid) - :remote-addr - :remote-user [:date[clf]] \":method :url HTTP/:http-version\" :status :res[content-length]";

// logger for all events
const eventLogger = logger(loggerFormat);

// logger for only server errors
const errorLogger = logger(loggerFormat,
    {
    skip: function (req, res) { return res.statusCode < 500; },
    stream: process.stderr
    }
);

export {eventLogger, errorLogger};