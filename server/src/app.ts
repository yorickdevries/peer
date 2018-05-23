import createError from "http-errors";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import bodyParser from "body-parser";
import api from "./routes/api";

const app: express.Express = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "./public")));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
/*
app.get('/upload',function(req,res){
  let now = new Date(Date.now());
  console.log("here: " + now.toISOString());
  res.sendFile(__dirname + "/index.html");
});

app.post('/uploadroute', upload.single('image'), function (req, res, next) {
  console.log(req.file);
  console.log(req.body);
  res.json({ok: "ok"})
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
});



app.post('/uploadroute', function (req:any ,res:any) {
  upload(req, res, function(err) {
    console.log(req.file);
    console.log(req.body);
    if(req.fileValidationError) {
      res.end(req.fileValidationError);
    } else {
      res.json({ok: "ok"});
    }
  });
});



app.post('/upload',function(req,res){
    upload(req,res,function(err) {
        if(err) {
          console.log(err);
            return res.end("Error uploading file.");
        }
        res.end("File is uploaded");
    });
});
*/

// Routing
app.use("/api", api);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err: any, req: any, res: any, next: any) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  // Print error to console
  console.log("Error: " + err.message);

  // render the error page
  res.status(err.status || 500);
  res.json({ error: "error" });
});

export default app;
