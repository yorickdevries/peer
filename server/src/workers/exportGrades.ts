import Assignment from "../models/Assignment";
import AssignmentExport from "../models/AssignmentExport";
import exportJSONToFile from "../util/exportJSONToFile";
import makeGradeSummaries from "../util/makeGradeSummary";
import ensureConnection from "./ensureConnection";

const exportGradesForAssignment = async function (
  assignmentId: number,
  assignmentExportId: number,
  exportType: "xls" | "csv"
): Promise<string> {
  await ensureConnection();

  const assignment = await Assignment.findOneOrFail(assignmentId);
  const questionnaire = await assignment.getSubmissionQuestionnaire();
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
  const filename = `assignment${assignment.id}_grades`;
  await exportJSONToFile(
    gradeSummaries,
    filename,
    exportType,
    assignmentExport
  );
  return `Exported Grades for assignment ${assignment.id}`;
};

export default exportGradesForAssignment;
