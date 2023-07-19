import { useSeeders } from "@jorgebodega/typeorm-seeding";
import InitialDatabaseSeed from "../../src/seeds/initial.seed";
import Assignment from "../../src/models/Assignment";
import moment from "moment";
import { genMailForMissingStageSubmission } from "../../src/util/mailer";
import User from "../../src/models/User";
import Submission from "../../src/models/Submission";
import ReviewOfReview from "../../src/models/ReviewOfReview";
import { dataSource } from "../../src/databaseConnection";

async function shiftDueDates(assignments: Assignment[], shift: number) {
  for (const assignment of assignments) {
    assignment.publishDate = moment()
      .add(-2 + shift, "days")
      .toDate();
    assignment.dueDate = moment()
      .add(-1 + shift, "days")
      .toDate();
    assignment.reviewPublishDate = moment().add(shift, "days").toDate();
    assignment.reviewDueDate = moment()
      .add(shift + 1, "days")
      .toDate();

    if (assignment.reviewEvaluation) {
      assignment.reviewEvaluationDueDate = moment()
        .add(shift + 2, "days")
        .toDate();
    }
    await assignment.save();
  }
}

function memberIsValid(m: User) {
  return (
    m.firstName !== null &&
    m.email !== null &&
    m.preferences.stRemStageNotSubmitted
  );
}

async function genExpectedSubmissions(
  assignments: Assignment[]
): Promise<string[]> {
  const emails: string[] = [];
  for (const assignment of assignments) {
    const groups = await assignment.getGroups();
    for (const group of groups) {
      if (!(await Submission.hasGroupMadeSubmission(group.id))) {
        const validMemberEmails = (await group.getUsers())
          .filter((m) => memberIsValid(m))
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          .map((m) => m.email!);
        emails.push(...validMemberEmails);
      }
    }
  }
  return emails;
}

async function genExpectedReviews(
  assignments: Assignment[]
): Promise<string[]> {
  const emails: string[] = [];
  for (const assignment of assignments) {
    const groups = await assignment.getGroups();
    for (const group of groups) {
      const members = await group.getUsers();
      for (const member of members) {
        if (
          await assignment.hasUnsubmittedSubmissionReviewsWhereUserIsReviewer(
            member
          )
        ) {
          if (memberIsValid(member)) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            emails.push(member.email!);
          }
        }
      }
    }
  }
  return emails;
}

async function genExpectedEvaluations(
  assignments: Assignment[]
): Promise<string[]> {
  const emails: string[] = [];
  for (const assignment of assignments) {
    const groups = await assignment.getGroups();
    for (const group of groups) {
      const allMembers = await group.getUsers();
      const allMemberIds = allMembers.map((m) => m.netid);
      if (!(await Submission.hasGroupMadeSubmission(group.id))) {
        continue;
      }

      //Get all reviews that this group has received
      const reviews = await assignment.getSubmittedReviewsWhereUserIsReviewed(
        group
      );

      for (const review of reviews) {
        //Check if received review has an associated feedback review (made by the user(s) in question)
        const feedbackReview = await dataSource.manager
          .createQueryBuilder(ReviewOfReview, "review")
          .where("review.reviewOfSubmission = :rid", { rid: review.id })
          .andWhere("review.reviewer IN (:...reviewers)", {
            reviewers: allMemberIds,
          })
          .getOne();

        //Skip if feedback review found
        if (feedbackReview !== undefined) {
          continue;
        }

        for (const member of allMembers) {
          //Skip this user if required fields aren't present
          if (!memberIsValid(member)) {
            continue;
          }

          //Skip those who haven't completed all their reviews and blockFeedback is enabled
          if (
            assignment.blockFeedback &&
            (await assignment.hasUnsubmittedSubmissionReviewsWhereUserIsReviewer(
              member
            ))
          ) {
            continue;
          }

          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          emails.push(member.email!);
        }
        break;
      }
    }
  }
  return emails;
}

describe.skip("Email notifications", () => {
  jest.setTimeout(600000);

  let group_submission: Assignment;
  let student_submission: Assignment;
  let group_review: Assignment;
  let student_review: Assignment;
  let student_feedback: Assignment;
  let group_feedback: Assignment;

  beforeAll(async () => {
    await dataSource.initialize();

    // const options: ConfigureOption = {
    //   root: "src/../../src",
    //   configName: "ormconfig.ts",
    // };

    await useSeeders(InitialDatabaseSeed);

    // await runSeeder(InitialDatabaseSeed);

    group_submission = await Assignment.findOneOrFail({
      where: {
        name: "group_submission",
      },
    });

    student_submission = await Assignment.findOneOrFail({
      where: {
        name: "student_submission",
      },
    });

    group_review = await Assignment.findOneOrFail({
      where: {
        name: "group_review",
      },
    });

    student_review = await Assignment.findOneOrFail({
      where: {
        name: "student_review",
      },
    });

    student_feedback = await Assignment.findOneOrFail({
      where: {
        name: "student_feedback",
      },
    });

    group_feedback = await Assignment.findOneOrFail({
      where: {
        name: "group_feedback",
      },
    });
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  test("automatic daily mail sending", async () => {
    //Test submissions

    let expectedSubmissions = await genExpectedSubmissions([
      student_submission,
      group_submission,
    ]);

    expectedSubmissions = expectedSubmissions.map((m) =>
      expect.objectContaining({
        to: m,
        subject: expect.stringContaining("Missing submission in course"),
      })
    );

    await shiftDueDates([group_submission, student_submission], 2);

    let emails = await genMailForMissingStageSubmission();
    expect(emails.length).toEqual(expectedSubmissions.length);
    expect(emails).toEqual(expect.arrayContaining(expectedSubmissions));

    await shiftDueDates([group_submission, student_submission], 3);

    //Test reviews

    let expectedReviews = await genExpectedReviews([
      student_review,
      group_review,
    ]);

    expectedReviews = expectedReviews.map((m) =>
      expect.objectContaining({
        to: m,
        subject: expect.stringContaining("Missing review(s) in course"),
      })
    );

    await shiftDueDates([group_review, student_review], 0);

    emails = await genMailForMissingStageSubmission();
    expect(emails.length).toEqual(expectedReviews.length);
    expect(emails).toEqual(expect.arrayContaining(expectedReviews));

    await shiftDueDates([group_review, student_review], 1);

    //Test evaluations

    let expectedEvaluations = await genExpectedEvaluations([
      student_feedback,
      group_feedback,
    ]);

    expectedEvaluations = expectedEvaluations.map((m) =>
      expect.objectContaining({
        to: m,
        subject: expect.stringContaining("Missing evaluation(s) in course"),
      })
    );

    await shiftDueDates([group_feedback, student_feedback], -1);

    emails = await genMailForMissingStageSubmission();
    expect(emails.length).toEqual(expectedEvaluations.length);
    expect(emails).toEqual(expect.arrayContaining(expectedEvaluations));

    await shiftDueDates([group_feedback, student_feedback], 0);
  }, 600000);
});
