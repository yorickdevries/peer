import path from "path";
import multer from "multer";

/**
 * Middleware to parse the multipart data into a file and body
 */
export default function upload(fieldName: string, allowedExtensions: string[], maxSizeFile: number) {
    //          Check whether I can throw an error here instead !!!!
    /**
     * Filefilter for the upload
     */
    function fileFilter (req: any, file: any, callback: any) {
        const extension = path.extname(file.originalname);
        if (!(allowedExtensions.includes(extension))) {
            return callback(new Error(`Extension not allowed: ${extension}`), false);
        } else {
            // tslint:disable-next-line
            return callback(null, true);
        }
    }

    // options for multer
    const options = {
        storage: multer.memoryStorage(),
        fileFilter: fileFilter,
        limits: {fileSize: maxSizeFile},
    };

    // upload middleware
    const uploadFile = multer(options).single(fieldName);

    /**
     * Validates the uploaded file
     */
    function upload(req: any, res: any, next: any) {
        uploadFile(req, res, function (err) {
            // Send error in case of too large file size
            if (err) {
                if (err.code === "LIMIT_FILE_SIZE") {
                    res.status(400);
                    res.json({ error: `File too large, max size: ${maxSizeFile / (1024 * 1024)} MB` });
                }
                // Error in case of wrong file type
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
