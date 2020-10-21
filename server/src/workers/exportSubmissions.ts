import AssignmentVersion from "../models/AssignmentVersion";
import AssignmentExport from "../models/AssignmentExport";
import exportJSONToFile from "../util/exportJSONToFile";
import parseSubmissionsForExport from "../util/parseSubmissionsForExport";
import ensureConnection from "./ensureConnection";

const exportSubmissionsForAssignmentVersion = async function (
  assignmentVersionId: number,
  assignmentExportId: number,
  exportType: "xls" | "csv"
): Promise<string> {
  await ensureConnection();

  const assignmentVersion = await AssignmentVersion.findOneOrFail(
    assignmentVersionId
  );
  const assignmentExport = await AssignmentExport.findOneOrFail(
    assignmentExportId
  );
  // asynchronically make export
  const parsedSubmissions = await parseSubmissionsForExport(assignmentVersion);
  const filename = `assignmentversion${assignmentVersion.id}_submissions`;
  await exportJSONToFile(
    parsedSubmissions,
    filename,
    exportType,
    assignmentExport
  );

  return `Exported Submissions for assignmentVersion ${assignmentVersion.id}`;
};

export default exportSubmissionsForAssignmentVersion;
