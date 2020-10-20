import AssignmentVersion from "../models/AssignmentVersion";

const parseSubmissionsForExport = async function (
  assignmentVersion: AssignmentVersion
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any[]> {
  const submissions = await assignmentVersion.getSubmissions();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parsedSubmissions: any[] = [];
  for (const submission of submissions) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parsedSubmission: any = {};
    // id
    parsedSubmission["id"] = submission.id;
    parsedSubmissions.push(parsedSubmission);
  }
  return parsedSubmissions;
};

export default parseSubmissionsForExport;
