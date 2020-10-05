import AssignmentVersion from "../models/AssignmentVersion";
import AssignmentExport from "../models/AssignmentExport";
import exportJSONToFile from "../util/exportJSONToFile";
import parseSubmissionReviewsForExport from "../util/parseReviewsForExport";
import ensureConnection from "./ensureConnection";

const exportReviewsForAssignmentVersion = async function (
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
  const assignmentExport = await AssignmentExport.findOneOrFail(
    assignmentExportId
  );

  // asynchronically make export
  const parsedReviews = await parseSubmissionReviewsForExport(questionnaire);
  const filename = `assignmentversion${assignmentVersion.id}_reviews`;
  await exportJSONToFile(parsedReviews, filename, exportType, assignmentExport);

  return `Exported Reviews for assignmentVersion ${assignmentVersion.id}`;
};

export default exportReviewsForAssignmentVersion;
