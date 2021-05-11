import AssignmentVersion from "../models/AssignmentVersion";

const parseSubmissionsForExport = async function (
  assignmentVersion: AssignmentVersion
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any[]> {
  const submissions = await assignmentVersion.getSubmissions();
  const assignment = await assignmentVersion.getAssignment();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parsedSubmissions: any[] = [];
  for (const submission of submissions) {
    const submitter = await submission.getUser();
    const submitterGroup = await submission.getGroup();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parsedSubmission: any = {};
    // id!: number;
    parsedSubmission["id"] = submission.id;
    // Submitter netid
    parsedSubmission["Submitter netid"] = submitter.netid;
    // Submitter studentnumber
    parsedSubmission["Submitter studentnumber"] = submitter.studentNumber;
    // Submitter group id
    parsedSubmission["Submitter group id"] = submitterGroup.id;
    // Submitter group name
    parsedSubmission["Submitter group name"] = submitterGroup.name;
    // file
    parsedSubmission["file"] = submission.file.name + submission.file.extension;
    // final
    parsedSubmission["final"] = submission.final;
    // approvalByTA
    parsedSubmission["approval by TA"] = submission.approvalByTA;
    // commentByTA
    parsedSubmission["comment by TA"] = submission.commentByTA;
    // approvingTA
    parsedSubmission["TA netid"] = submission.approvingTA?.netid;
    // created At
    parsedSubmission["created at"] = submission.createdAt;
    // updated At
    parsedSubmission["updated at"] = submission.updatedAt;

    const reviewOfSubmissions = await submission.getReviewOfSubmissions();
    // filter out submitted reviews which are not self reviews
    const submittedReviews = [];
    for (const review of reviewOfSubmissions) {
      const reviewerGroup = await assignment.getGroup(review.reviewer);
      if (review.submitted && reviewerGroup?.id !== submitterGroup.id) {
        submittedReviews.push(review);
      }
    }
    let reviewNumber = 1;
    //Iterate over every review of sumbission
    for (const review of submittedReviews) {
      let pointsSum = 0;
      const reviewAnswers = await review.getQuestionAnswers();
      for (const answer of reviewAnswers) {
        const points = await answer.getAnswerPoints();
        if (points !== undefined) {
          pointsSum += points;
        }
      }
      const reviewText = `Submission Review Total Points ${reviewNumber}`;
      parsedSubmission[reviewText] = pointsSum / 100;
      reviewNumber++;
    }
    parsedSubmissions.push(parsedSubmission);
  }
  return parsedSubmissions;
};

export default parseSubmissionsForExport;
