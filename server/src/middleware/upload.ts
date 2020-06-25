import path from "path";
import { Request, Response, NextFunction, RequestHandler } from "express";
import multer from "multer";

// Middleware creator to parse the multipart data into a file and body
export default function upload(
  allowedExtensions: string[],
  maxFileSize: number,
  fieldName?: string
): RequestHandler {
  // Filefilter for the upload
  const fileFilter = (
    _req: Request,
    file: Express.Multer.File,
    callback: multer.FileFilterCallback
  ) => {
    const extension = path.extname(file.originalname);
    if (!allowedExtensions.includes(extension)) {
      return callback(new Error(`Extension not allowed: ${extension}`));
    } else {
      return callback(null, true);
    }
  };

  // options for multer
  const options: multer.Options = {
    storage: multer.memoryStorage(), // stored in memory, can later be moved to temp folder
    fileFilter: fileFilter,
    limits: { fileSize: maxFileSize },
  };

  // define the uploader
  let uploader: RequestHandler;
  if (fieldName) {
    uploader = multer(options).single(fieldName);
  } else {
    uploader = multer(options).any();
  }

  /**
   * Middleware which parses and validates the uploaded file
   */
  function upload(req: Request, res: Response, next: NextFunction) {
    uploader(req, res, (err: any) => {
      // Send error in case of too large file size
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          res.status(400);
          res.json({
            error: `File too large, max size: ${
              maxFileSize / (1024 * 1024)
            } MB`,
          });
        }
        // Error in case of wrong file extension
        else {
          res.status(400);
          res.json({ error: err.message });
        }
      } else {
        next();
      }
    });
  }

  return upload;
}
