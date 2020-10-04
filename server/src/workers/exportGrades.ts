import AssignmentExport from "../models/AssignmentExport";
import AssignmentVersion from "../models/AssignmentVersion";
import exportJSONToFile from "../util/exportJSONToFile";
import makeGradeSummaries from "../util/makeGradeSummary";
import ensureConnection from "./ensureConnection";

const exportGradesForAssignmentVersion = async function (
  assignmentVersionId: number,
  assignmentExportId: number,
  exportType: "xls" | "csv"
): Promise<string> {
  await ensureConnection();

  const assignmentVersion = await AssignmentVersion.findOneOrFail(
    assignmentVersionId
  );
  const questionnaire = await assignmentVersion.getSubmissionQuestionnaire();
  if (!questionnaire) {
    throw new Error("Questionnaire not found");
  }
  const submitted = true;
  const reviews = await questionnaire.getReviews(submitted);

  const assignmentExport = await AssignmentExport.findOneOrFail(
    assignmentExportId
  );

  // asynchronically make export
  const gradeSummaries = makeGradeSummaries(reviews);
  const filename = `assignmentversion${assignmentVersion.id}_grades`;
  await exportJSONToFile(
    gradeSummaries,
    filename,
    exportType,
    assignmentExport
  );
  return `Exported Grades for assignmentVersion ${assignmentVersion.id}`;
};

export default exportGradesForAssignmentVersion;
