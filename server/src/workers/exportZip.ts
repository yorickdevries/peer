import AssignmentVersion from "../models/AssignmentVersion";
import AssignmentExport from "../models/AssignmentExport";
// import exportJSONToFile from "../util/exportJSONToFile";
// import parseSubmissionsForExport from "../util/parseSubmissionsForExport";
import ensureConnection from "../util/ensureConnection";
import exportToZip from "../util/exportZip";
import _ from "lodash";

const exportSubmissionsForZip = async function (
    assignmentVersionId: number,
    assignmentExportId: number,
  ): Promise<string> {
    await ensureConnection();
    
    const assignmentVersion = await AssignmentVersion.findOneOrFail(
      assignmentVersionId
    );
    const assignmentExport = await AssignmentExport.findOneOrFail(
      assignmentExportId
    );
    // asynchronically make export
    const submissions = await assignmentVersion.getSubmissions();
    const sortedSubmissions = _.sortBy(submissions, "id");
    //const filename = `ZIP_of_${assignmentVersion.id}_submissions`;
    console.log(`ABOUT TO MAKE EXPORT`);
    await exportToZip(assignmentExport, sortedSubmissions);
  
    return `Exported ZIP file for assignmentVersion ${assignmentVersion.id}`;
  }
  export default exportSubmissionsForZip;