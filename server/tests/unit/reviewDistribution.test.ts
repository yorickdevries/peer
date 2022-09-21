import createDatabaseConnection from "../../src/databaseConnection";
import initializeData from "../../src/util/initializeData";
import { Connection } from "typeorm";
import User from "../../src/models/User";
import Group from "../../src/models/Group";
import Submission from "../../src/models/Submission";
import Assignment from "../../src/models/Assignment";
import Course from "../../src/models/Course";
import AcademicYear from "../../src/models/AcademicYear";
import Faculty from "../../src/models/Faculty";
import File from "../../src/models/File";
import { generateReviewDistribution } from "../../src/assignmentProgression/distributeReviews";
import Enrollment from "../../src/models/Enrollment";
import UserRole from "../../src/enum/UserRole";
import AssignmentVersion from "../../src/models/AssignmentVersion";
import { AssignmentState } from "../../src/enum/AssignmentState";
import Extensions from "../../src/enum/Extensions";
import SubmissionQuestionnaire from "../../src/models/SubmissionQuestionnaire";
import AssignmentType from "../../src/enum/AssignmentType";

describe("Review distribution", () => {
  // will be initialized and closed in beforeAll / afterAll
  let connection: Connection;

  beforeAll(async () => {
    // For the in memory test database, the schema is automatically dropped upon connect
    connection = await createDatabaseConnection();
    await initializeData();
  });

  afterAll(async () => {
    await connection.close();
  });

  test("regular review distribution", async () => {
    // academic year
    const academicYear = await AcademicYear.findOneOrFail(1);
    /// faculty
    const faculty = await Faculty.findOneOrFail(1);

    // course
    const course = new Course(
      "CourseName",
      "ABC123",
      false,
      faculty,
      academicYear,
      null
    );
    await course.save();

    // assignment
    const assignment = new Assignment(
      "Example title",
      course,
      true,
      false,
      new Date("2020-06-23T10:00Z"),
      new Date("2020-06-24T10:00Z"),
      new Date("2020-06-25T10:00Z"),
      new Date("2020-06-26T10:00Z"),
      null,
      null,
      null,
      null,
      Extensions.PDF,
      true,
      true,
      true,
      null,
      false,
      AssignmentType.DOCUMENT
    );
    await assignment.save();
    assignment.state = AssignmentState.SUBMISSION;
    await assignment.save();

    const submissionQuestionnaire = new SubmissionQuestionnaire();
    await submissionQuestionnaire.save();
    // assignmentVersion
    const assignmentVersion = new AssignmentVersion(
      "default",
      assignment,
      [],
      2,
      false,
      submissionQuestionnaire,
      null
    );
    await assignmentVersion.save();
    // set review setting so users review the same assignment
    assignmentVersion.versionsToReview = [assignmentVersion];
    await assignmentVersion.save();

    // students
    const numGroups = 10;
    const numStudentPerGroup = 3;
    const numStudents = numGroups * numStudentPerGroup;

    const students = [];
    for (let i = 0; i < numStudents; i++) {
      const student = new User(`student${i}`);
      await student.save();
      const enrollment = new Enrollment(student, course, UserRole.STUDENT);
      await enrollment.save();
      students.push(student);
    }

    // groups
    const submissions = [];
    for (let j = 0; j < numGroups; j++) {
      const studentsOfGroup = [];
      // first student of the group
      const student = students[j * numStudentPerGroup];
      for (
        let i = j * numStudentPerGroup;
        i < (j + 1) * numStudentPerGroup;
        i++
      ) {
        studentsOfGroup.push(students[i]);
      }
      const group = new Group(`group${j}`, course, studentsOfGroup, [
        assignment,
      ]);
      await group.save();
      // make submission
      const file = new File("filename", ".pdf", null);
      await file.save();

      const submission = new Submission(
        student,
        group,
        assignmentVersion,
        file,
        true
      );
      await submission.save();
      submissions.push(submission);
    }

    const reviewsPerUser = 3;
    const studentNumbers: [User, number][] = [];
    for (const student of students) {
      studentNumbers.push([student, reviewsPerUser]);
    }

    // need to be made into an object
    const reviewAssignments = await generateReviewDistribution(
      submissions,
      studentNumbers
    );
    expect(reviewAssignments.length).toBe(reviewsPerUser * numStudents);
    for (const reviewAssignment of reviewAssignments) {
      const user = reviewAssignment.reviewer;
      const submission = reviewAssignment.submission;
      const submissionGroup = await submission.getGroup();
      expect(await submissionGroup.hasUser(user)).toBe(false);
    }
  });

  test("review distribution with uneven groups", async () => {
    // academic year
    const academicYear = await AcademicYear.findOneOrFail(1);
    /// faculty
    const faculty = await Faculty.findOneOrFail(1);

    // course
    const course = new Course(
      "CourseName",
      "ABC123",
      false,
      faculty,
      academicYear,
      null
    );
    await course.save();

    // assignment
    const assignment = new Assignment(
      "Example title",
      course,
      true,
      false,
      new Date("2020-06-23T10:00Z"),
      new Date("2020-06-24T10:00Z"),
      new Date("2020-06-25T10:00Z"),
      new Date("2020-06-26T10:00Z"),
      null,
      null,
      null,
      null,
      Extensions.PDF,
      true,
      true,
      true,
      null,
      false,
      AssignmentType.DOCUMENT
    );
    await assignment.save();
    assignment.state = AssignmentState.SUBMISSION;
    await assignment.save();

    const submissionQuestionnaire = new SubmissionQuestionnaire();
    await submissionQuestionnaire.save();
    // assignmentVersion
    const assignmentVersion = new AssignmentVersion(
      "default",
      assignment,
      [],
      2,
      false,
      submissionQuestionnaire,
      null
    );
    await assignmentVersion.save();
    // set review setting so users review the same assignment
    assignmentVersion.versionsToReview = [assignmentVersion];
    await assignmentVersion.save();

    // students
    const numGroups = 4;
    // 1 + 2 + 3 + 4
    const numStudents = 10;

    const students = [];
    for (let i = 0; i < numStudents; i++) {
      const student = new User(`student${i}`);
      await student.save();
      const enrollment = new Enrollment(student, course, UserRole.STUDENT);
      await enrollment.save();
      students.push(student);
    }

    // group creation
    const submissions = [];
    let studentIndex = 0;
    for (let j = 0; j < numGroups; j++) {
      const studentsOfGroup = [];
      // first student of the group
      const student = students[studentIndex];
      const endIndex = studentIndex + j;
      // add j students t the group
      while (studentIndex <= endIndex) {
        studentsOfGroup.push(students[studentIndex]);
        studentIndex++;
      }
      const group = new Group(`group${j}`, course, studentsOfGroup, [
        assignment,
      ]);
      await group.save();
      // make submission
      const file = new File("filename", ".pdf", null);
      await file.save();

      const submission = new Submission(
        student,
        group,
        assignmentVersion,
        file,
        true
      );
      await submission.save();
      submissions.push(submission);
    }

    // there are 4 other groups, so a division can be made
    // the average number of reviews per submission is 3*10/4 = 7.5
    // so every groups should get either 7 or 8 reviews
    // however for the group with 4 students, thre are only 6 other students whcih can review
    // so the algorithm should find a less fair solution
    const reviewsPerUser = 3;
    const studentNumbers: [User, number][] = [];
    for (const student of students) {
      studentNumbers.push([student, reviewsPerUser]);
    }

    // need to be made into an object
    const reviewAssignments = await generateReviewDistribution(
      submissions,
      studentNumbers
    );
    expect(reviewAssignments.length).toBe(reviewsPerUser * numStudents);
    // check whether the solution is valid
    for (const reviewAssignment of reviewAssignments) {
      const user = reviewAssignment.reviewer;
      const submission = reviewAssignment.submission;
      const submissionGroup = await submission.getGroup();
      expect(await submissionGroup.hasUser(user)).toBe(false);
    }
  });

  test("situation where review distribution is not possible", async () => {
    // academic year
    const academicYear = await AcademicYear.findOneOrFail(1);
    /// faculty
    const faculty = await Faculty.findOneOrFail(1);

    // course
    const course = new Course(
      "CourseName",
      "ABC123",
      false,
      faculty,
      academicYear,
      null
    );
    await course.save();

    // assignment
    const assignment = new Assignment(
      "Example title",
      course,
      true,
      false,
      new Date("2020-06-23T10:00Z"),
      new Date("2020-06-24T10:00Z"),
      new Date("2020-06-25T10:00Z"),
      new Date("2020-06-26T10:00Z"),
      null,
      null,
      null,
      null,
      Extensions.PDF,
      true,
      true,
      true,
      null,
      false,
      AssignmentType.DOCUMENT
    );
    await assignment.save();
    assignment.state = AssignmentState.SUBMISSION;
    await assignment.save();

    const submissionQuestionnaire = new SubmissionQuestionnaire();
    await submissionQuestionnaire.save();
    // assignmentVersion
    const assignmentVersion = new AssignmentVersion(
      "default",
      assignment,
      [],
      2,
      false,
      submissionQuestionnaire,
      null
    );
    await assignmentVersion.save();
    // set review setting so users review the same assignment
    assignmentVersion.versionsToReview = [assignmentVersion];
    await assignmentVersion.save();

    const student1 = new User(`student1`);
    await student1.save();
    const enrollment1 = new Enrollment(student1, course, UserRole.STUDENT);
    await enrollment1.save();
    const student2 = new User(`student2`);
    await student2.save();
    const enrollment2 = new Enrollment(student2, course, UserRole.STUDENT);
    await enrollment2.save();
    const student3 = new User(`student3`);
    await student3.save();
    const enrollment3 = new Enrollment(student3, course, UserRole.STUDENT);
    await enrollment3.save();

    const submissions: Submission[] = [];

    // submission 1
    const group1 = new Group(`group1`, course, [student1], [assignment]);
    await group1.save();
    // make submission
    const file1 = new File("filename", ".pdf", null);
    await file1.save();

    const submission1 = new Submission(
      student1,
      group1,
      assignmentVersion,
      file1,
      true
    );
    await submission1.save();
    submissions.push(submission1);

    // submission 1
    const group2 = new Group(
      `group2`,
      course,
      [student2, student3],
      [assignment]
    );
    await group2.save();
    // make submission
    const file2 = new File("filename", ".pdf", null);
    await file1.save();

    const submission2 = new Submission(
      student2,
      group2,
      assignmentVersion,
      file2,
      true
    );
    await submission2.save();
    submissions.push(submission2);

    const reviewsPerUser = 1;
    // need to be made into an object
    const generateDistributionPromise = generateReviewDistribution(
      submissions,
      [
        [student2, reviewsPerUser],
        [student3, reviewsPerUser],
      ]
    );
    expect.assertions(1);
    await expect(generateDistributionPromise).rejects.toThrow();
  });
});
