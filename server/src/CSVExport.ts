
export default class CSVExport {

    /**
     * Convert function from: https://halistechnology.com/2015/05/28/use-javascript-to-export-your-data-as-csv/
     * Small changes to make typescript happy.
     * Converts an array of objects into a string that is csv compatible.
     * @param args - json type, which can include data (has to be array), columnDelimiter and lineDelimiter.
     * @return {any}
     */
    public static convertArrayOfObjectsToCSV(args: any) {
        var result: string, ctr: number, keys: string[], columnDelimiter: string, lineDelimiter: string, data;

        data = args.data || null;
        if (data == null || !data.length) {
            return null;
        }

        columnDelimiter = args.columnDelimiter || ',';
        lineDelimiter = args.lineDelimiter || '\n';

        keys = Object.keys(data[0]);

        result = '';
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
}