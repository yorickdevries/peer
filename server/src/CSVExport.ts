/**
 * Class that creates a csv file for export.
 */
export default class CSVExport {

    /**
     * Convert function from: https://halistechnology.com/2015/05/28/use-javascript-to-export-your-data-as-csv/
     * Small changes to make typescript happy.
     * Converts an array of objects into a string that is csv compatible.
     * @param args - json type, which can include data (has to be array), columnDelimiter and lineDelimiter.
     * @return {any}
     */
    public static convertArrayOfObjectsToCSV(args: any) {
        let result: string, ctr: number, keys: string[], columnDelimiter: string, lineDelimiter: string, data;

        data = args.data || undefined;
        if (data == undefined || !data.length) {
            throw Error("Data is undefined");
        }

        columnDelimiter = args.columnDelimiter || ";";
        lineDelimiter = args.lineDelimiter || "\n";

        keys = Object.keys(data[0]);

        result = "";
        result += keys.join(columnDelimiter);
        result += lineDelimiter;

        data.forEach(function(item: any) {
            ctr = 0;
            keys.forEach(function(key) {
                if (ctr > 0) result += columnDelimiter;

                result += item[key];
                ctr++;
            });
            result += lineDelimiter;
        });

        return result;
    }

    /**
     * Download csv function from: https://halistechnology.com/2015/05/28/use-javascript-to-export-your-data-as-csv/
     * Slightly changed to make it workable in our use case.
     * @param args - exportData - array of data.
     * @return {string} csv file encoded in uri.
     */
    public static downloadCSV(args: any): string {
        let csv = CSVExport.convertArrayOfObjectsToCSV({
            data: args.exportData
        });
        if (csv == undefined) throw new Error("Invalid csv file created.");

        if (!csv.match(/^data:text\/csv/i)) {
            csv = "data:text/csv;charset=utf-8," + csv;
        }
        return encodeURI(csv);
    }
}