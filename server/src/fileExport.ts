import exportFromJSON from "export-from-json";
import CoursesPS from "./prepared_statements/courses_ps";
import AssignmentPS from "./prepared_statements/assignment_ps";
const json2csv = require("json2csv").parse;


/**
 * Class which takes care of exporting a file from a list of objects
 */
export default class FileExport {
    /**
     * Method to export data to an export with the indicated fileName to the res object
     */
    public static exportJSONToFile(data: any, fileName: string, exportType: string, res: any) {
        // Check if the export data contains data.
        if (data.length == 0) {
            res.status(400);
            res.json({error: "Nothing to export."});
            return;
        }

        // based on the exporttype, choose the right function
        if (exportType == "xls") {
            this.exportJSONToXLSFile(data, fileName, "xls", res);
        } else if (exportType == "csv") {
            this.exportJSONToCSVFile(data, fileName, res);
        } else {
            throw new Error("Invalid exportType");
        }
    }

    /**
     * Exports to XLS.
     */
    static exportJSONToXLSFile(data: any, fileName: any, exportType: any, res: any) {
        const result = exportFromJSON({
            data,
            fileName,
            exportType,
            processor (content, type, fileName) {
                if (type == "xls") {
                    res.setHeader("Content-Type", "application/vnd.ms-excel");
                } else {
                    throw new Error("Invalid export type");
                }
                res.setHeader("Content-disposition", "attachment;filename=" + fileName);
                return content;
            }
        });
        res.write(result);
        res.end();
    }

    /**
     * Exports to CSV.
     */
    static exportJSONToCSVFile(data: any, fileName: any, res: any) {
        // Get the fields for the csv file. Export data contains at least 1 item at this point.
        const csvFields = this.getAllKeys(data);
        res.setHeader("Content-disposition", `attachment; filename=${fileName}.csv`);
        res.set("Content-Type", "text/csv");
        res.status(200).send(json2csv(data, { csvFields }));
    }

    /**
     * Create and fetch a filename for a specific assignment.
     * @param {number} assignmentId - an id of an assignment.
     * @return {Promise<string>} - a string as promise.
     */
    public static async filenameForAssignment(assignmentId: number): Promise<string> {
        // Properly format the file name.
        const assignment: any = await AssignmentPS.executeGetAssignmentById(assignmentId);
        const course: any = await CoursesPS.executeGetCourseById(assignment.course_id);
        const date: Date = new Date();
        const dd = (date.getDate() < 10) ? "0" + date.getDate() : date.getDate();
        const mm = (date.getMonth() + 1 < 10) ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1);
        const hours = (date.getHours() < 10) ? "0" + date.getHours() : date.getHours();
        const min = (date.getMinutes() < 10) ? "0" + date.getMinutes() : date.getMinutes();

        // Check if the course name is a valid file name.
        const courseName = (/^([a-zA-Z_\-\s0-9]+)$/.test(course.name.replace(/ /g, "")))
            ? course.name.replace(/ /g, "") : "";
        const assignmentTitle = (/^([a-zA-Z_\-\s0-9]+)$/.test(assignment.title.replace(/ /g, "")))
            ? assignment.title.replace(/ /g, "") : "";

        return `${courseName}--${assignmentTitle}--${dd}-${mm}-${date.getFullYear()}--${hours}-${min}`;
    }

    /**
     * Gets all keys from a list of objects.
     */
    static getAllKeys(data: object[]): string[] {
        // https://stackoverflow.com/questions/41287778/get-all-possible-object-keys-from-a-list-of-objects-javascript-typescript
        const res = data.reduce(function(arr: any, o: any) {
            return Object.keys(o).reduce(function(a, k) {
              if (a.indexOf(k) == -1) a.push(k);
              return a;
            }, arr);
          }, []);
          return (res);
    }
}