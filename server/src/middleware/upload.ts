import path from "path";
import multer from "multer";

/**
 * Middleware creator to parse the multipart data into a file and body
 */
export default function upload(fieldName: string | undefined, allowedExtensions: string[], maxSizeFile: number) {
    /**
     * Filefilter for the upload
     */
    function fileFilter (_: any, file: any, callback: any) {
        const extension = path.extname(file.originalname);
        if (!(allowedExtensions.includes(extension))) {
            return callback(new Error(`Extension not allowed: ${extension}`), false);
        } else {
            return callback(null, true);
        }
    }

    // options for multer
    const options = {
        storage: multer.memoryStorage(),
        fileFilter: fileFilter,
        limits: {fileSize: maxSizeFile},
    };

    let uploader: any;
    if (fieldName) {
        uploader = multer(options).single(fieldName);
    } else {
        uploader = multer(options).any();
    }

    /**
     * Middleware which parses and validates the uploaded file
     */
    function upload(req: any, res: any, next: any) {
        uploader(req, res, function (err: any) {
            // Send error in case of too large file size
            if (err) {
                if (err.code === "LIMIT_FILE_SIZE") {
                    res.status(400);
                    res.json({ error: `File too large, max size: ${maxSizeFile / (1024 * 1024)} MB` });
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
