import { Connection } from "typeorm";
import { ConfigureOption, runSeeder, useSeeding } from "typeorm-seeding";
import InitialDatabaseSeed from "../../src/seeds/initial.seed";
import createDatabaseConnection from "../../src/databaseConnection";
import Assignment from "../../src/models/Assignment";
import moment from "moment";
import { genMailForMissingStageSubmission } from "../../src/util/mailer";
import User from "../../src/models/User";

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

describe("Email notifications", () => {
  let connection: Connection;
  jest.setTimeout(600000);

  let student28: User;
  let student29: User;
  let student30: User;
  let student31: User;
  let student32: User;
  let student33: User;
  let student34: User;
  let student35: User;
  let student36: User;
  let student37: User;
  let student38: User;
  let student39: User;
  let group_submission: Assignment;
  let student_submission: Assignment;
  let group_review: Assignment;
  let student_review: Assignment;
  let student_feedback: Assignment;
  let group_feedback: Assignment;

  beforeAll(async (done) => {
    connection = await createDatabaseConnection();

    const options: ConfigureOption = {
      root: "src/../../src",
      configName: "ormconfig.ts",
    };

    await useSeeding(options);

    await runSeeder(InitialDatabaseSeed);

    student28 = await User.findOneOrFail("student28");
    student29 = await User.findOneOrFail("student29");
    student30 = await User.findOneOrFail("student30");
    student31 = await User.findOneOrFail("student31");
    student32 = await User.findOneOrFail("student32");
    student33 = await User.findOneOrFail("student33");
    student34 = await User.findOneOrFail("student34");
    student35 = await User.findOneOrFail("student35");
    student36 = await User.findOneOrFail("student36");
    student37 = await User.findOneOrFail("student37");
    student38 = await User.findOneOrFail("student38");
    student39 = await User.findOneOrFail("student39");

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

    done();
  });

  afterAll(async () => {
    await connection.close();
  });

  test("automatic daily mail sending", async () => {
    //Test submissions

    let expectedSubmissions = [
      {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        to: student38.email!,
        subject: expect.stringContaining("Missing submission in course"),
      },
      {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        to: student39.email!,
        subject: expect.stringContaining("Missing submission in course"),
      },
      {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        to: student36.email!,
        subject: expect.stringContaining("Missing submission in course"),
      },
      {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        to: student37.email!,
        subject: expect.stringContaining("Missing submission in course"),
      },
      {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        to: student38.email!,
        subject: expect.stringContaining("Missing submission in course"),
      },
      {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        to: student39.email!,
        subject: expect.stringContaining("Missing submission in course"),
      },
    ];
    expectedSubmissions = expectedSubmissions.map((m) =>
      expect.objectContaining(m)
    );

    await shiftDueDates([group_submission, student_submission], 2);

    let emails = await genMailForMissingStageSubmission();
    expect(emails).toEqual(expect.arrayContaining(expectedSubmissions));

    await shiftDueDates([group_submission, student_submission], 3);

    //Test reviews

    let expectedReviews = [
      {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        to: student32.email!,
        subject: expect.stringContaining("Missing review(s) in course"),
      },
      {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        to: student33.email!,
        subject: expect.stringContaining("Missing review(s) in course"),
      },
      {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        to: student34.email!,
        subject: expect.stringContaining("Missing review(s) in course"),
      },
      {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        to: student35.email!,
        subject: expect.stringContaining("Missing review(s) in course"),
      },
      {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        to: student36.email!,
        subject: expect.stringContaining("Missing review(s) in course"),
      },
      {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        to: student37.email!,
        subject: expect.stringContaining("Missing review(s) in course"),
      },
    ];

    expectedReviews = expectedReviews.map((m) => expect.objectContaining(m));

    await shiftDueDates([group_review, student_review], 0);

    emails = await genMailForMissingStageSubmission();
    expect(emails).toEqual(expect.arrayContaining(expectedReviews));

    await shiftDueDates([group_review, student_review], 1);

    //Test evaluations

    let expectedEvaluations = [
      {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        to: student34.email!,
        subject: expect.stringContaining("Missing evaluation(s) in course"),
      },
      {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        to: student35.email!,
        subject: expect.stringContaining("Missing evaluation(s) in course"),
      },
      {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        to: student28.email!,
        subject: expect.stringContaining("Missing evaluation(s) in course"),
      },
      {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        to: student29.email!,
        subject: expect.stringContaining("Missing evaluation(s) in course"),
      },
      {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        to: student30.email!,
        subject: expect.stringContaining("Missing evaluation(s) in course"),
      },
      {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        to: student31.email!,
        subject: expect.stringContaining("Missing evaluation(s) in course"),
      },
    ];

    expectedEvaluations = expectedEvaluations.map((m) =>
      expect.objectContaining(m)
    );

    await shiftDueDates([group_feedback, student_feedback], -1);

    emails = await genMailForMissingStageSubmission();
    expect(emails).toEqual(expect.arrayContaining(expectedEvaluations));

    await shiftDueDates([group_feedback, student_feedback], 0);
  }, 600000);
});
