import AssignmentVersion from "../models/AssignmentVersion";
import ReviewOfSubmission from "../models/ReviewOfSubmission";

const parseSubmissionsForExport = async function (
  assignmentVersion: AssignmentVersion
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any[]> {
  const submissions = await assignmentVersion.getSubmissions();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parsedSubmissions: any[] = [];
  const submittionQuestionaire = await assignmentVersion.getSubmissionQuestionnaire();
  const allReviews = submittionQuestionaire
    ? ((await submittionQuestionaire.getReviews()) as ReviewOfSubmission[])
    : [];
  const gradedSubmissionQuestions = submittionQuestionaire
    ? submittionQuestionaire.questions.filter((question) => question.graded)
    : [];
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

    // if submittion questionaire and submittion questions exist, try top get a grade
    if (gradedSubmissionQuestions.length) {
      const reviews = allReviews.filter(
        (review) =>
          review.reviewer.netid !== submitter.netid &&
          review.submission.id === submission.id
      );
      let reviewNumber = 1;
      //Iterate over every review of sumbission
      for (const review of reviews) {
        let pointsSum = 0;
        let answerDoesNotExist = false;
        for (const question of gradedSubmissionQuestions) {
          const answer = await review.getAnswer(question);
          if (answer == null) {
            answerDoesNotExist = true;
            break;
          }
          const points = answer.getAnswerPoints();
          pointsSum += !points.length ? 0 : points[0];
        }
        parsedSubmission[
          `Submition Review Total Points ${reviewNumber}`
        ] = answerDoesNotExist ? "" : pointsSum / 100;
        reviewNumber++;
      }
    }
    parsedSubmissions.push(parsedSubmission);
  }
  return parsedSubmissions;
};

export default parseSubmissionsForExport;
