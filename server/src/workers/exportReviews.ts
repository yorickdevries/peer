import Assignment from "../models/Assignment";
import AssignmentExport from "../models/AssignmentExport";
import exportJSONToFile from "../util/exportJSONToFile";
import parseSubmissionReviewsForExport from "../util/parseReviewsForExport";
import ensureConnection from "./ensureConnection";

const exportReviewsForAssignment = async function (
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
  const assignmentExport = await AssignmentExport.findOneOrFail(
    assignmentExportId
  );

  // asynchronically make export
  const parsedReviews = await parseSubmissionReviewsForExport(questionnaire);
  const filename = `assignment${assignment.id}_reviews`;
  await exportJSONToFile(parsedReviews, filename, exportType, assignmentExport);

  return `Exported Reviews for assignment ${assignment.id}`;
};

export default exportReviewsForAssignment;
