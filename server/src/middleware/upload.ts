import path from "path";
import multer from "multer";

export default function upload(fieldName: string, allowedExtensions: string[], maxSizeFile: number) {
    // Filefilter for the upload
    //          Check whether I can throw an error here instead !!!!
    function fileFilter (req: any, file: any, callback: any) {
        const extension = path.extname(file.originalname);
        if (!(allowedExtensions.includes(extension))) {
            req.fileValidationError = `Extension not allowed: ${extension}`;
            // tslint:disable-next-line
            return callback(null, false);
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
    const uploader = multer(options).single(fieldName);

    function uploadValidation(err: any, req: any, res: any, next: any) {
        // Send error in case of too large file size
        if (err) {
            console.log(err);
            res.status(400);
            res.json({ error: "File is too large" });
        }
        // Error in case of wrong file type
        else if (req.fileValidationError) {
            res.status(400);
            res.json({ error: req.fileValidationError });
        } else {
            next();
        }
    }

    return [uploader, uploadValidation];
}
