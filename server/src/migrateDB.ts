import "reflect-metadata"; // needed for typeORM to work
import { createConnection } from "typeorm";
import * as ormconfig from "./ormconfig";
import _ from "lodash";
import parseNetID from "./util/parseNetID";
import saveUserFromSSO from "./util/saveUserFromSSO";
import { PreparedStatement } from "pg-promise";
import Database from "./old_api/database";
import path from "path";
import fs from "fs";
import config from "config";
const assignmentFolder = (config.get("assignments") as any).fileFolder;
const submissionFolder = (config.get("submissions") as any).fileFolder;
const reviewsFolder = (config.get("reviews") as any).fileFolder;
import constructFile from "./util/fileFactory";
import Faculty from "./models/Faculty";
import AcademicYear from "./models/AcademicYear";
import Course from "./models/Course";
import Assignment from "./models/Assignment";
import User from "./models/User";
import Enrollment from "./models/Enrollment";
import Group from "./models/Group";
import UserRole from "./enum/UserRole";
import Submission from "./models/Submission";
import Questionnaire from "./models/Questionnaire";
import SubmissionQuestionnaire from "./models/SubmissionQuestionnaire";
import ReviewQuestionnaire from "./models/ReviewQuestionnaire";
import MultipleChoiceQuestion from "./models/MultipleChoiceQuestion";
import CheckboxQuestion from "./models/CheckboxQuestion";
import OpenQuestion from "./models/OpenQuestion";
import RangeQuestion from "./models/RangeQuestion";
import UploadQuestion from "./models/UploadQuestion";
import CheckboxQuestionOption from "./models/CheckboxQuestionOption";
import MultipleChoiceQuestionOption from "./models/MultipleChoiceQuestionOption";
import File from "./models/File";
import Review from "./models/Review";
import ReviewOfSubmission from "./models/ReviewOfSubmission";
import ReviewOfReview from "./models/ReviewOfReview";
import OpenQuestionAnswer from "./models/OpenQuestionAnswer";
import RangeQuestionAnswer from "./models/RangeQuestionAnswer";
import UploadQuestionAnswer from "./models/UploadQuestionAnswer";
import CheckboxQuestionAnswer from "./models/CheckboxQuestionAnswer";
import MultipleChoiceQuestionAnswer from "./models/MultipleChoiceQuestionAnswer";
import SubmissionComment from "./models/SubmissionComment";

// parse the postgres syntax for lists
const replacePostgresSyntax = function (name?: string | string[]) {
  if (typeof name === "string") {
    // replace postgres syntax
    if (name.startsWith("{") && name.endsWith("}")) {
      name = name.replace("{", "[");
      name = name.replace("}", "]");
      name = JSON.parse(name);
    }
    return name;
  } else if (name === undefined) {
    return undefined;
  } else {
    throw new Error("incorrect name: " + name);
  }
};

const migrateDB = async function (): Promise<void> {
  console.log("Start migration");

  // database connection with mysql database
  const connection = await createConnection(ormconfig);
  console.log(connection.name);

  /*
   * User,
   * Affiliation,
   * Study,
   * OrganisationUnit,
   */
  // get all users
  console.log("importing users");
  const userStatement = new PreparedStatement({
    name: "users",
    text: 'SELECT * FROM "userlist"',
  });
  const oldUsers = await Database.executeQuery(userStatement);
  console.log("num users:", oldUsers.length);

  const userMap: Map<string, User> = new Map<string, User>();

  const newUsers: (string | undefined)[] = [];
  for (const oldUser of oldUsers) {
    const netid: string = parseNetID(oldUser.netid);
    const studentNumber: number | undefined = oldUser.studentnumber
      ? oldUser.studentnumber
      : undefined;
    const firstName: string | undefined = oldUser.firstname
      ? oldUser.firstname
      : undefined;
    const prefix: string | undefined = oldUser.prefix
      ? oldUser.prefix
      : undefined;
    const lastName: string | undefined = oldUser.lastname
      ? oldUser.lastname
      : undefined;
    const email: string | undefined = oldUser.email ? oldUser.email : undefined;
    const displayName: string | undefined = oldUser.displayname
      ? oldUser.displayname
      : undefined;
    let affiliation: string | string[] | undefined = oldUser.affiliation
      ? oldUser.affiliation
      : undefined;
    affiliation = replacePostgresSyntax(affiliation);
    let study: string | string[] | undefined = oldUser.study
      ? oldUser.study
      : undefined;
    study = replacePostgresSyntax(study);
    let organisationUnit:
      | string
      | string[]
      | undefined = oldUser.organisationunit
      ? oldUser.organisationunit
      : undefined;
    organisationUnit = replacePostgresSyntax(organisationUnit);

    // save user and fields to the database
    const savedNetid = await saveUserFromSSO(
      netid,
      studentNumber,
      firstName,
      prefix,
      lastName,
      email,
      displayName,
      affiliation,
      study,
      organisationUnit
    );
    if (newUsers.includes(savedNetid)) {
      throw new Error(`${savedNetid} is a duplicate`);
    }
    if (savedNetid !== oldUser.netid || !savedNetid) {
      throw new Error(`incorrect netid: ${netid}`);
    }
    newUsers.push(savedNetid);
    // fecth the user for the usermap
    const user = await User.findOneOrFail(savedNetid);
    userMap.set(savedNetid, user);
  }
  console.log(`saved ${newUsers.length} users`);

  /*
   * Faculty,
   */
  console.log();
  console.log("importing faculties");
  // const facultyStatement = new PreparedStatement({
  //   name: "faculties",
  //   text: 'SELECT * FROM "facultylist"',
  // });
  // const oldFaculties = await Database.executeQuery(facultyStatement);
  // console.log(oldFaculties);

  // map to convert the previous names to the new objects
  const facultyMap: Map<string, Faculty> = new Map<string, Faculty>();
  facultyMap.set(
    "EWI",
    await new Faculty(
      "EEMCS",
      "Electrical Engineering, Mathematics & Computer Science"
    ).save()
  );
  facultyMap.set(
    "3ME",
    await new Faculty(
      "3mE",
      "Mechanical, Maritime and Materials Engineering"
    ).save()
  );
  facultyMap.set("TNW", await new Faculty("AS", "Applied Sciences").save());
  facultyMap.set(
    "TBM",
    await new Faculty("TPM", "Technology, Policy and Management").save()
  );
  facultyMap.set(
    "BK",
    await new Faculty("ABE", "Architecture and the Built Environment").save()
  );
  facultyMap.set(
    "CITG",
    await new Faculty("CEG", "Civil Engineering and Geosciences").save()
  );
  facultyMap.set(
    "IO",
    await new Faculty("IDE", "Industrial Design Engineering").save()
  );
  facultyMap.set("LR", await new Faculty("AE", "Aerospace Engineering").save());

  /*
   * AcademicYear,
   */
  console.log();
  console.log("importing academic years");
  // const academicYearStatement = new PreparedStatement({
  //   name: "AcademicYearList",
  //   text: 'SELECT * FROM "academicyearlist"',
  // });
  // const oldAcademicYears = await Database.executeQuery(academicYearStatement);
  // console.log(oldAcademicYears);

  // map to convert the previous names to the new objects
  const academicYearMap: Map<string, AcademicYear> = new Map<
    string,
    AcademicYear
  >();
  academicYearMap.set(
    "2018/2019",
    await new AcademicYear("2018/2019", false).save()
  );
  academicYearMap.set(
    "2019/2020",
    await new AcademicYear("2019/2020", true).save()
  );
  academicYearMap.set(
    "2020/2021",
    await new AcademicYear("2020/2021", true).save()
  );

  /*
   * Course,
   */
  console.log();
  console.log("importing courses");
  const courseStatement = new PreparedStatement({
    name: "courseList",
    text: 'SELECT * FROM "courselist"',
  });
  const oldCourses = await Database.executeQuery(courseStatement);
  const sortedOldCourses = _.sortBy(oldCourses, "id");
  console.log("num courses: ", sortedOldCourses.length);

  const courseMap: Map<number, Course> = new Map<number, Course>();

  for (const oldCourse of sortedOldCourses) {
    const oldId: number = oldCourse.id;
    const description: string | null = oldCourse.description
      ? oldCourse.description
      : null;
    const name: string = oldCourse.name;
    const courseCode: string = oldCourse.course_code;
    const enrollable: boolean = oldCourse.enrollable;
    const faculty: Faculty = facultyMap.get(oldCourse.faculty)!;
    const academicYear: AcademicYear = academicYearMap.get(
      oldCourse.academic_year
    )!;

    const newCourse = new Course(
      name,
      courseCode,
      enrollable,
      faculty,
      academicYear,
      description
    );
    await newCourse.save();
    courseMap.set(oldId, newCourse);
  }

  /*
   * Enrollment,
   */
  console.log();
  console.log("importing enrollments");
  const enrollmentStatement = new PreparedStatement({
    name: "enrollment",
    text: 'SELECT * FROM "enroll"',
  });
  const oldEnrollments = await Database.executeQuery(enrollmentStatement);
  console.log("num oldEnrollments: ", oldEnrollments.length);

  // create the enrollments
  for (const oldEnrollment of oldEnrollments) {
    const course = courseMap.get(oldEnrollment.course_id)!;
    const user = userMap.get(oldEnrollment.user_netid)!;
    let role = oldEnrollment.role;
    // change role in case of TA
    if (role === "TA") {
      role = "teachingassistant";
    }

    // FIX incorrect roles thorughout the database
    // edge case where I did a review, so must be a student
    if (user.netid === "yorickdevries" && course.id === 2) {
      console.log(
        `${user.netid} changed from ${role} to student in course ${course.id}`
      );
      role = "student";
    }
    // test course
    if (user.netid === "mlopescunha" && course.id === 5) {
      console.log(
        `${user.netid} changed from ${role} to student in course ${course.id}`
      );
      role = "student";
    }
    // test course
    if (user.netid === "yorickdevries" && course.id === 8) {
      console.log(
        `${user.netid} changed from ${role} to student in course ${course.id}`
      );
      role = "student";
    }
    // another mixed test course
    if (user.netid === "lpnkoopman" && course.id === 12) {
      console.log(
        `${user.netid} changed from ${role} to student in course ${course.id}`
      );
      role = "student";
    }
    if (user.netid === "rhelwig" && course.id === 12) {
      console.log(
        `${user.netid} changed from ${role} to student in course ${course.id}`
      );
      role = "student";
    }
    if (user.netid === "sbezelev" && course.id === 12) {
      console.log(
        `${user.netid} changed from ${role} to student in course ${course.id}`
      );
      role = "student";
    }
    if (user.netid === "mauritswassena" && course.id === 12) {
      console.log(
        `${user.netid} changed from ${role} to student in course ${course.id}`
      );
      role = "student";
    }

    // course 16
    if (user.netid === "mjjoosten" && course.id === 16) {
      console.log(
        `${user.netid} changed from ${role} to student in course ${course.id}`
      );
      role = "student";
    }
    // note: test ta approval need to be changed to null (should error automatically)
    if (user.netid === "evavanoosten" && course.id === 16) {
      console.log(
        `${user.netid} changed from ${role} to student in course ${course.id}`
      );
      role = "student";
    }
    if (user.netid === "beslamimossall" && course.id === 16) {
      console.log(
        `${user.netid} changed from ${role} to student in course ${course.id}`
      );
      role = "student";
    }
    if (user.netid === "jvandegrint" && course.id === 16) {
      console.log(
        `${user.netid} changed from ${role} to student in course ${course.id}`
      );
      role = "student";
    }

    const newEnrollment = new Enrollment(user, course, role);
    await newEnrollment.save();
  }

  // AD course (mathijs/stefan made teacher now)
  // make mathijs a teacher for AD
  const mathijsEnrollment = new Enrollment(
    userMap.get("mdeweerdt")!,
    courseMap.get(2)!,
    UserRole.TEACHER
  );
  await mathijsEnrollment.save();
  const stefanEnrollment = new Enrollment(
    userMap.get("stefanhugtenbu")!,
    courseMap.get(2)!,
    UserRole.TEACHER
  );
  await stefanEnrollment.save();

  /*
   * Assignment,
   */
  console.log();
  console.log("importing assignments");
  const assignmentStatement = new PreparedStatement({
    name: "assignmentList",
    text: 'SELECT * FROM "assignmentlist"',
  });
  const oldAssignments = await Database.executeQuery(assignmentStatement);
  const sortedOldAssignments = _.sortBy(oldAssignments, "id");
  console.log("num assignments: ", sortedOldAssignments.length);

  const assignmentMap: Map<number, Assignment> = new Map<number, Assignment>();
  for (const oldAssignment of sortedOldAssignments) {
    // id
    const oldId = oldAssignment.id;
    // title
    const title = oldAssignment.title;
    // description
    let description = oldAssignment.description
      ? oldAssignment.description
      : null;
    if (description === " ") {
      description = null;
    }
    // course_id
    const course = courseMap.get(oldAssignment.course_id)!;
    // reviews_per_user
    const reviewsPerUser = oldAssignment.reviews_per_user;
    // filename
    let file;
    if (oldAssignment.filename) {
      const filePath = path.resolve(assignmentFolder, oldAssignment.filename);
      if (!fs.existsSync(filePath)) {
        throw new Error(`${filePath} does not exist`);
      }
      const fileBuffer = fs.readFileSync(filePath);
      // also saves the file to disk
      file = await constructFile(fileBuffer, filePath);
    } else {
      file = null;
    }

    // publish_date
    const publishDate = new Date(oldAssignment.publish_date);
    // due_date
    const dueDate = new Date(oldAssignment.due_date);
    // review_publish_date
    const reviewPublishDate = new Date(oldAssignment.review_publish_date);
    // review_due_date
    const reviewDueDate = new Date(oldAssignment.review_due_date);
    // one_person_groups
    const enrollable = oldAssignment.one_person_groups;
    // review_evaluation_due_date
    const reviewEvaluationDueDate = oldAssignment.review_evaluation_due_date
      ? new Date(oldAssignment.review_evaluation_due_date)
      : null;
    // review_evaluation
    const reviewEvaluation = oldAssignment.review_evaluation;
    // external_link
    const externalLink = oldAssignment.external_link
      ? oldAssignment.external_link
      : null;
    // will be filled in later
    const submissionQuestionnaire = null;
    const reviewQuestionnaire = null;

    const newAssignment = new Assignment(
      title,
      course,
      reviewsPerUser,
      enrollable,
      reviewEvaluation,
      publishDate,
      dueDate,
      reviewPublishDate,
      reviewDueDate,
      reviewEvaluationDueDate,
      description,
      file,
      externalLink,
      submissionQuestionnaire,
      reviewQuestionnaire
    );
    await newAssignment.save();
    assignmentMap.set(oldId, newAssignment);
  }
  // console.log(assignmentMap);

  // File, will be saved in respective using classes
  /*
   * Group,
   */
  console.log();
  console.log("importing groups");
  const groupStatement = new PreparedStatement({
    name: "groupList",
    text: 'SELECT * FROM "grouplist"',
  });
  const oldGroups = await Database.executeQuery(groupStatement);
  const sortedOldGroups = _.sortBy(oldGroups, "id");
  console.log("num groups: ", sortedOldGroups.length);

  interface GroupforImport {
    groupName: string;
    assignments: Assignment[];
    users: User[];
    course?: Course;
  }
  const groupforImportMap: Map<number, GroupforImport> = new Map<
    number,
    GroupforImport
  >();
  for (const oldGroup of sortedOldGroups) {
    const groupforImport: GroupforImport = {
      groupName: oldGroup.group_name,
      assignments: [],
      users: [],
    };
    groupforImportMap.set(oldGroup.id, groupforImport);
  }

  //AssignmentGroup
  const assignmentGroupStatement = new PreparedStatement({
    name: "assignmentgroup",
    text: 'SELECT * FROM "assignmentgroup"',
  });
  const oldAssignmentGroups = await Database.executeQuery(
    assignmentGroupStatement
  );
  // console.log(oldAssignmentGroups);

  console.log("go over assignmentgroups");
  for (const oldAssignmentGroup of oldAssignmentGroups) {
    const assignment = assignmentMap.get(oldAssignmentGroup.assignment_id)!;
    const groupId = oldAssignmentGroup.group_id;
    const group = groupforImportMap.get(groupId)!;
    group.assignments.push(assignment);
  }

  //GroupUsers
  const groupUsersStatement = new PreparedStatement({
    name: "groupUsers",
    text: 'SELECT * FROM "groupusers"',
  });
  const oldGroupUsers = await Database.executeQuery(groupUsersStatement);
  // console.log(oldGroupUsers);

  console.log("go over groupusers");
  for (const oldGroupUser of oldGroupUsers) {
    const user = userMap.get(oldGroupUser.user_netid)!;
    const groupId = oldGroupUser.group_groupid;
    const group = groupforImportMap.get(groupId)!;
    if (
      user.netid === "lcschroten" &&
      (groupId === 14287 || groupId === 14088)
    ) {
      console.log(
        `skipping group ${groupId} for ${user.netid} because teacher`
      );
      continue;
    }
    group.users.push(user);
  }

  console.log("assign the right course");
  for (const [_key, groupforImport] of groupforImportMap) {
    if (groupforImport.users.length < 1) {
      console.log("empty group:");
      console.log(_key, groupforImport.groupName);
    }
    if (groupforImport.assignments.length !== 1) {
      throw new Error(`${_key}, ${groupforImport}`);
    } else {
      // there is only one assignment
      groupforImport.course = await groupforImport.assignments[0].getCourse();
    }
  }
  // make the groups in the database
  const groupMap: Map<number, Group> = new Map<number, Group>();
  for (const [oldId, groupforImport] of groupforImportMap) {
    if (oldId === 14086) {
      console.log("skipped sanders group");
      continue;
    }
    if (oldId === 14526) {
      console.log("skipped mkrceks group");
      continue;
    }
    // add users to group as they made submissions
    if (oldId === 13188) {
      groupforImport.users.push(userMap.get("beslamimossall")!);
    }
    if (oldId === 13190) {
      groupforImport.users.push(userMap.get("mjjoosten")!);
    }
    // i guess this was an accidental deletion?
    if (oldId === 14668) {
      groupforImport.users.push(userMap.get("mmager")!);
    }
    const group = new Group(
      groupforImport.groupName,
      groupforImport.course!,
      groupforImport.users,
      groupforImport.assignments
    );
    await group.save();
    groupMap.set(oldId, group);
  }
  //console.log(groupMap);

  /*
   * Submission,
   */
  const submissionStatement = new PreparedStatement({
    name: "submissionStatement",
    text: 'SELECT * FROM "submission"',
  });
  const oldSubmissions = await Database.executeQuery(submissionStatement);
  const sortedOldSubmissions = _.sortBy(oldSubmissions, "id");
  console.log("num submissions: ", sortedOldSubmissions.length);

  const submissionMap: Map<number, Submission> = new Map<number, Submission>();

  for (const sortedOldSubmission of sortedOldSubmissions) {
    const oldId = sortedOldSubmission.id;
    const user = userMap.get(sortedOldSubmission.user_netid)!;
    const group = groupMap.get(sortedOldSubmission.group_id)!;
    const assignment = assignmentMap.get(sortedOldSubmission.assignment_id)!;

    // veel van de files zijn niet hier nu
    let filePath = path.resolve(
      submissionFolder,
      sortedOldSubmission.file_path
    );
    const fileExtension = path.extname(filePath);
    if (!fs.existsSync(filePath)) {
      //throw new Error(`${filePath} does not exist`);
      // TODO: remove this code and throw error if the file is not found
      // console.log("niet gevonden");
      // filePath = dummyFilePath;
      filePath = "";
    }
    let file: File;
    if (filePath !== "") {
      const fileBuffer = fs.readFileSync(filePath);
      // also saves the file to disk
      file = await constructFile(fileBuffer, filePath);
    } else {
      // get just file 1
      file = new File(
        "filename",
        fileExtension,
        "0000000000000000000000000000000000000000000000000000000000000000"
      );
      await file.save();
    }

    const date = sortedOldSubmission.date;

    // make this into a submission entry
    //console.log(oldId, user, group, assignment, file, date);
    const submission = new Submission(user, group, assignment, file);
    await submission.save();
    submission.createdAt = date;
    await submission.save();
    submissionMap.set(oldId, submission);
  }

  /*
   * Questionnaire,
   * SubmissionQuestionnaire,
   * ReviewQuestionnaire,
   */
  console.log();
  console.log("importing questionnaires");
  const rubricStatement = new PreparedStatement({
    name: "rubricList",
    text: 'SELECT * FROM "rubric"',
  });
  const oldRubrics = await Database.executeQuery(rubricStatement);
  const sortedOldRubrics = _.sortBy(oldRubrics, "id");
  console.log("num Rubrics: ", sortedOldRubrics.length);
  // console.log(sortedOldRubrics);

  const questionnaireMap: Map<number, Questionnaire> = new Map<
    number,
    Questionnaire
  >();
  for (const oldRubric of sortedOldRubrics) {
    // id SERIAL,
    const oldId = oldRubric.id;
    // Assignment_id int NOT NULL,
    const assignment: Assignment = assignmentMap.get(oldRubric.assignment_id)!;
    // type varchar(100) NOT NULL,
    const typeOfQ = oldRubric.type;

    // console.log(oldId, assignment, typeOfQ);
    if (typeOfQ === "submission") {
      const questionnaire = new SubmissionQuestionnaire();
      await questionnaire.save();
      assignment.submissionQuestionnaire = questionnaire;
      await assignment.save();
      // set values in the map
      assignmentMap.set(oldRubric.assignment_id, assignment);
      questionnaireMap.set(oldId, questionnaire);
    } else if (typeOfQ === "review") {
      const questionnaire = new ReviewQuestionnaire();
      await questionnaire.save();
      assignment.reviewQuestionnaire = questionnaire;
      await assignment.save();
      // set values in the map
      assignmentMap.set(oldRubric.assignment_id, assignment);
      questionnaireMap.set(oldId, questionnaire);
    } else {
      throw new Error("wrong type");
    }
  }

  // Question,
  // CheckboxQuestion,
  console.log();
  console.log("importing checkboxquestions");
  const checkboxquestionStatement = new PreparedStatement({
    name: "checkboxquestionList",
    text: 'SELECT * FROM "checkboxquestion"',
  });
  const oldcheckboxquestions = await Database.executeQuery(
    checkboxquestionStatement
  );
  const sortedOldcheckboxquestions = _.sortBy(oldcheckboxquestions, "id");
  console.log("num checkboxquestions: ", sortedOldcheckboxquestions.length);
  // console.log(sortedOldRubrics);

  const checkboxquestionMap: Map<number, CheckboxQuestion> = new Map<
    number,
    CheckboxQuestion
  >();
  for (const oldquestion of sortedOldcheckboxquestions) {
    // console.log(oldMcquestion);
    //     id SERIAL,
    const oldId = oldquestion.id;
    //     question varchar(5000) NOT NULL,
    const questiontext = oldquestion.question;
    //     Rubric_id int NOT NULL,
    const questionnaire = questionnaireMap.get(oldquestion.rubric_id)!;
    //     question_number int NOT NULL,
    const questionNumber = oldquestion.question_number;
    //     optional boolean NOT NULL,
    const optional = oldquestion.optional;

    // console.log(oldId, question, rubric, questionNumber, optional);
    const question = new CheckboxQuestion(
      questiontext,
      questionNumber,
      optional,
      questionnaire
    );
    await question.save();
    checkboxquestionMap.set(oldId, question);
  }

  // MultipleChoiceQuestion,
  console.log();
  console.log("importing MCquestions");
  const mcquestionStatement = new PreparedStatement({
    name: "MCquestionList",
    text: 'SELECT * FROM "mcquestion"',
  });
  const oldMcquestions = await Database.executeQuery(mcquestionStatement);
  const sortedOldMcquestions = _.sortBy(oldMcquestions, "id");
  console.log("num mcquestions: ", sortedOldMcquestions.length);
  // console.log(sortedOldRubrics);

  const mcquestionMap: Map<number, MultipleChoiceQuestion> = new Map<
    number,
    MultipleChoiceQuestion
  >();
  for (const oldMcquestion of sortedOldMcquestions) {
    // console.log(oldMcquestion);
    //     id SERIAL,
    const oldId = oldMcquestion.id;
    //     question varchar(5000) NOT NULL,
    const questiontext =
      oldMcquestion.question !== "" ? oldMcquestion.question : "Empty question";
    //     Rubric_id int NOT NULL,
    const questionnaire = questionnaireMap.get(oldMcquestion.rubric_id)!;
    //     question_number int NOT NULL,
    const questionNumber =
      oldMcquestion.question_number > 0 ? oldMcquestion.question_number : 1;
    //     optional boolean NOT NULL,
    const optional = oldMcquestion.optional;

    // console.log(oldId, question, rubric, questionNumber, optional);
    const question = new MultipleChoiceQuestion(
      questiontext,
      questionNumber,
      optional,
      questionnaire
    );
    await question.save();
    mcquestionMap.set(oldId, question);
  }

  // OpenQuestion,
  console.log();
  console.log("importing openquestions");
  const openquestionStatement = new PreparedStatement({
    name: "openquestionList",
    text: 'SELECT * FROM "openquestion"',
  });
  const oldOpenquestions = await Database.executeQuery(openquestionStatement);
  const sortedOldOpenQuestions = _.sortBy(oldOpenquestions, "id");
  console.log("num openquestions: ", sortedOldOpenQuestions.length);
  // console.log(sortedOldRubrics);

  const openquestionMap: Map<number, OpenQuestion> = new Map<
    number,
    OpenQuestion
  >();
  for (const oldquestion of sortedOldOpenQuestions) {
    // console.log(oldMcquestion);

    // id SERIAL,
    const oldId = oldquestion.id;
    // question varchar(5000) NOT NULL,
    const questiontext =
      oldquestion.question !== "" ? oldquestion.question : "Empty question";
    // Rubric_id int NOT NULL,
    const questionnaire = questionnaireMap.get(oldquestion.rubric_id)!;
    // question_number int NOT NULL,
    const questionNumber =
      oldquestion.question_number > 0 ? oldquestion.question_number : 1;
    // optional boolean NOT NULL,
    const optional = oldquestion.optional;

    const question = new OpenQuestion(
      questiontext,
      questionNumber,
      optional,
      questionnaire
    );
    await question.save();
    openquestionMap.set(oldId, question);
  }

  // RangeQuestion,
  console.log();
  console.log("importing rangequestions");
  const rangequestionStatement = new PreparedStatement({
    name: "rangequestionList",
    text: 'SELECT * FROM "rangequestion"',
  });
  const oldRangeQuestions = await Database.executeQuery(rangequestionStatement);
  const sortedOldRangeQuestions = _.sortBy(oldRangeQuestions, "id");
  console.log("num rangequestions: ", sortedOldRangeQuestions.length);

  const rangeQuestionMap: Map<number, RangeQuestion> = new Map<
    number,
    RangeQuestion
  >();
  for (const oldquestion of sortedOldRangeQuestions) {
    // id SERIAL,
    const oldId = oldquestion.id;
    // question varchar(5000) NOT NULL,
    const questiontext = oldquestion.question;
    // Rubric_id int NOT NULL,
    const questionnaire = questionnaireMap.get(oldquestion.rubric_id)!;
    // question_number int NOT NULL,
    const questionNumber =
      oldquestion.question_number > 0 ? oldquestion.question_number : 1;
    // optional boolean NOT NULL,
    const optional = oldquestion.optional;
    // range int NOT NULL,
    const range = oldquestion.range;

    const question = new RangeQuestion(
      questiontext,
      questionNumber,
      optional,
      questionnaire,
      range
    );
    await question.save();
    rangeQuestionMap.set(oldId, question);
  }

  // UploadQuestion,
  console.log();
  console.log("importing uploadquestions");
  const uploadQuestionStatement = new PreparedStatement({
    name: "uploadquestionList",
    text: 'SELECT * FROM "uploadquestion"',
  });
  const oldUploadQuestions = await Database.executeQuery(
    uploadQuestionStatement
  );
  const sortedOldUploadQuestions = _.sortBy(oldUploadQuestions, "id");
  console.log("num uploadquestions: ", sortedOldUploadQuestions.length);

  const uploadQuestionMap: Map<number, UploadQuestion> = new Map<
    number,
    UploadQuestion
  >();
  for (const oldquestion of sortedOldUploadQuestions) {
    // id SERIAL,
    const oldId = oldquestion.id;
    // question varchar(5000) NOT NULL,
    const questiontext = oldquestion.question;
    // Rubric_id int NOT NULL,
    const questionnaire = questionnaireMap.get(oldquestion.rubric_id)!;
    // question_number int NOT NULL,
    const questionNumber =
      oldquestion.question_number > 0 ? oldquestion.question_number : 1;
    // optional boolean NOT NULL,
    const optional = oldquestion.optional;
    // extension varchar(100) NOT NULL,
    const extension = oldquestion.extension;

    const question = new UploadQuestion(
      questiontext,
      questionNumber,
      optional,
      questionnaire,
      extension
    );
    await question.save();
    uploadQuestionMap.set(oldId, question);
  }

  // QuestionOption,
  // CheckboxQuestionOption,
  // QuestionOption,
  console.log();
  console.log("importing checkboxquestionoptions");
  const checkboxoptionStatement = new PreparedStatement({
    name: "checkboxoptionList",
    text: 'SELECT * FROM "checkboxoption"',
  });

  const oldCheckboxOptions = await Database.executeQuery(
    checkboxoptionStatement
  );
  const sortedOldCheckboxOptions = _.sortBy(oldCheckboxOptions, "id");
  console.log("num checkboxopitons: ", sortedOldCheckboxOptions.length);

  const checkboxOptionsMap: Map<number, CheckboxQuestionOption> = new Map<
    number,
    CheckboxQuestionOption
  >();
  for (const oldCheckboxOption of sortedOldCheckboxOptions) {
    // id SERIAL,
    const oldId = oldCheckboxOption.id;
    // option varchar(5000) NOT NULL,
    const optionText = oldCheckboxOption.option;
    // CheckboxQuestion_id int NOT NULL,
    const question = checkboxquestionMap.get(
      oldCheckboxOption.checkboxquestion_id
    )!;
    // const question = oldCheckboxOption.checkboxquestion_id;

    //console.log(oldId, optionText, question);
    const option = new CheckboxQuestionOption(optionText, question);
    await option.save();

    checkboxOptionsMap.set(oldId, option);
  }

  // MultipleChoiceQuestionOption,
  // MultipleChoiceQuestionOption,
  console.log();
  console.log("importing mcquestionoptions");
  const mcoptionStatement = new PreparedStatement({
    name: "mcoptionList",
    text: 'SELECT * FROM "mcoption"',
  });

  const oldMCOptions = await Database.executeQuery(mcoptionStatement);
  const sortedOldMCOptions = _.sortBy(oldMCOptions, "id");
  console.log("num mcquestionsoptions: ", sortedOldMCOptions.length);

  const mcOptionsMap: Map<number, MultipleChoiceQuestionOption> = new Map<
    number,
    MultipleChoiceQuestionOption
  >();
  for (const oldMCOption of sortedOldMCOptions) {
    // id SERIAL,
    const oldId = oldMCOption.id;
    // option varchar(5000) NOT NULL,
    const optionText = oldMCOption.option !== "" ? oldMCOption.option : "Empty";
    //     MCQuestion_id int NOT NULL,
    const question = mcquestionMap.get(oldMCOption.mcquestion_id)!;
    // const question = oldMCOption.mcquestion_id;

    // console.log(oldId, optionText, question);
    const option = new MultipleChoiceQuestionOption(optionText, question);
    await option.save();

    mcOptionsMap.set(oldId, option);
  }

  // Review,
  // ReviewOfSubmission,
  // ReviewOfReview,
  console.log();
  console.log("importing reviews");
  const reviewStatement = new PreparedStatement({
    name: "reviewList",
    text: 'SELECT * FROM "review"',
  });

  const oldReviews = await Database.executeQuery(reviewStatement);
  const sortedOldReviews = _.sortBy(oldReviews, "id");
  console.log("num reviews: ", sortedOldReviews.length);
  const reviewMap: Map<number, Review> = new Map<number, Review>();
  for (const oldReview of sortedOldReviews) {
    // correct incorrect change made in the past
    if (
      oldReview.user_netid === "gfincatodelour" &&
      oldReview.rubric_id === 18 &&
      oldReview.submission_id === 1233
    ) {
      oldReview.submission_id = 1223;
      console.log("corrected gfincatodelour review");
    }
    // id SERIAL,
    const oldId = oldReview.id;
    // User_netid varchar(500) NOT NULL,
    const user = userMap.get(oldReview.user_netid)!;
    // Submission_id int,
    const submission = oldReview.submission_id
      ? submissionMap.get(oldReview.submission_id)
      : null;
    // evaluated_review_id int, (this review should be defiend as we go over all reviews in order of id)
    const evaluatedReview = oldReview.evaluated_review_id
      ? reviewMap.get(oldReview.evaluated_review_id)
      : null;
    // // flagged BOOLEAN NOT NULL DEFAULT FALSE,
    // const flagged = oldReview.flagged;
    // Rubric_id int NOT NULL,
    const questionnaire = questionnaireMap.get(oldReview.rubric_id)!;
    // // done BOOLEAN NOT NULL DEFAULT FALSE,
    // const done = oldReview.done;
    // // creation_date timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    // const creationDate = oldReview.creation_date;
    // // started_at timestamptz,
    // const startedAt = oldReview.started_at ? oldReview.started_at : null;
    // // downloaded_at timestamptz,
    // const downloadedAt = oldReview.downloaded_at ? oldReview.downloaded_at : null;
    // // submitted_at timestamptz,
    // const submittedAt = oldReview.submitted_at ? oldReview.submitted_at : null;
    // // saved_at timestamptz,
    // const savedAt = oldReview.saved_at ? oldReview.saved_at : null;
    // // approved boolean,
    // const approval = oldReview.approved ? oldReview.approved : null;
    // // ta_netid varchar(500),
    // const taNetid = oldReview.ta_netid ? oldReview.ta_netid : null;

    // some basic check
    if (submission !== null && evaluatedReview !== null) {
      throw new Error("both submission and review are defined!");
    }
    let review: Review;
    if (submission) {
      if (!(questionnaire instanceof SubmissionQuestionnaire)) {
        throw new Error("Wrong questionnaire type");
      }
      // other fields need to be set once the answers are imported (at the very last)
      review = new ReviewOfSubmission(
        questionnaire,
        user,
        false,
        false,
        null,
        null,
        null,
        null,
        null,
        null,
        submission
      );
    } else if (
      evaluatedReview &&
      evaluatedReview instanceof ReviewOfSubmission
    ) {
      if (!(questionnaire instanceof ReviewQuestionnaire)) {
        throw new Error("Wrong questionnaire type");
      }
      // other fields need to be set once the answers are imported (at the very last)
      review = new ReviewOfReview(
        questionnaire,
        user,
        false,
        false,
        null,
        null,
        null,
        null,
        null,
        null,
        evaluatedReview
      );
    } else {
      throw new Error("both submission and review are not defined!");
    }
    await review.save();
    reviewMap.set(oldId, review);
  }
  // QuestionAnswer,
  // CheckboxQuestionAnswer,
  console.log();
  console.log("importing CheckboxAnswer");
  const checkboxAnswersStatement = new PreparedStatement({
    name: "CheckboxAnswerList",
    text: 'SELECT * FROM "checkboxanswer"',
  });
  const oldCheckboxAnswers = await Database.executeQuery(
    checkboxAnswersStatement
  );
  console.log("num oldCheckboxAnswers (T AND F): ", oldCheckboxAnswers.length);

  // review answer map to
  const checkBoxAnswerMapToFill: Map<
    string,
    CheckboxQuestionOption[]
  > = new Map<string, CheckboxQuestionOption[]>();
  for (const oldAnswer of oldCheckboxAnswers) {
    const chosen = oldAnswer.answer;
    if (chosen) {
      const option = checkboxOptionsMap.get(oldAnswer.checkboxoption_id)!;
      // questionId
      const questionId = (await option.getQuestion()).id;
      // const review = reviewMap.get(oldAnswer.review_id)!;
      const reviewOldId = oldAnswer.review_id;

      const key = String(reviewOldId) + "-" + String(questionId);
      if (checkBoxAnswerMapToFill.has(key)) {
        const answer = checkBoxAnswerMapToFill.get(key)!;
        answer.push(option);
        checkBoxAnswerMapToFill.set(key, answer);
      } else {
        const answer = [option];
        checkBoxAnswerMapToFill.set(key, answer);
      }
    }
  }
  // save the answers to the database
  for (const [key, options] of checkBoxAnswerMapToFill) {
    // ket the values out of the key
    const values = key.split("-");
    const reviewOldId = Number.parseInt(values[0]);
    const questionId = Number.parseInt(values[1]);

    // get the values from the ids
    const question = await CheckboxQuestion.findOneOrFail(questionId);
    const review = reviewMap.get(reviewOldId)!;
    // save to database
    const answer = new CheckboxQuestionAnswer(question, review, options);
    await answer.save();
  }

  // MultipleChoiceQuestionAnswer,
  console.log();
  console.log("importing MCAnswers");
  const MCAnswersStatement = new PreparedStatement({
    name: "MCAnswerList",
    text: 'SELECT * FROM "mcanswer"',
  });
  const oldMCAnswers = await Database.executeQuery(MCAnswersStatement);
  console.log("num oldMCAnswers: ", oldMCAnswers.length);

  for (const oldAnswer of oldMCAnswers) {
    const option = mcOptionsMap.get(oldAnswer.answer)!;
    const question = mcquestionMap.get(oldAnswer.mcquestion_id)!;
    const review = reviewMap.get(oldAnswer.review_id)!;
    const answer = new MultipleChoiceQuestionAnswer(question, review, option);
    await answer.save();
  }

  // OpenQuestionAnswer,
  console.log();
  console.log("importing openanswers");
  const openQuestionAnswerStatement = new PreparedStatement({
    name: "openquestionanswerList",
    text: 'SELECT * FROM "openanswer"',
  });
  const oldOpenAnswers = await Database.executeQuery(
    openQuestionAnswerStatement
  );
  console.log("num oldOpenAnswers: ", oldOpenAnswers.length);

  for (const oldOpenAnswer of oldOpenAnswers) {
    const answerText =
      oldOpenAnswer.answer !== "" ? oldOpenAnswer.answer : "Empty answer";
    const question = openquestionMap.get(oldOpenAnswer.openquestion_id)!;
    const review = reviewMap.get(oldOpenAnswer.review_id)!;
    const answer = new OpenQuestionAnswer(question, review, answerText);
    await answer.save();
  }

  // RangeQuestionAnswer,
  console.log();
  console.log("importing RangeQuestionAnswers");
  const rangeQuestionAnswerStatement = new PreparedStatement({
    name: "rangequestionanswerList",
    text: 'SELECT * FROM "rangeanswer"',
  });
  const oldRangeAnswers = await Database.executeQuery(
    rangeQuestionAnswerStatement
  );
  console.log("num oldRangeAnswers: ", oldRangeAnswers.length);

  for (const oldAnswer of oldRangeAnswers) {
    const answerNumber = oldAnswer.answer;
    const question = rangeQuestionMap.get(oldAnswer.rangequestion_id)!;
    const review = reviewMap.get(oldAnswer.review_id)!;
    const answer = new RangeQuestionAnswer(question, review, answerNumber);
    await answer.save();
  }

  // UploadQuestionAnswer,
  console.log();
  console.log("importing UploadQuestionAnswers");
  const uploadQuestionAnswerStatement = new PreparedStatement({
    name: "uploadquestionanswerList",
    text: 'SELECT * FROM "uploadanswer"',
  });
  const oldUploadAnswers = await Database.executeQuery(
    uploadQuestionAnswerStatement
  );
  console.log("num oldUploadAnswers: ", oldUploadAnswers.length);

  for (const oldAnswer of oldUploadAnswers) {
    const fileName = oldAnswer.answer;
    const question = uploadQuestionMap.get(oldAnswer.uploadquestion_id)!;
    const review = reviewMap.get(oldAnswer.review_id)!;

    let filePath = path.resolve(reviewsFolder, fileName);
    const fileExtension = path.extname(filePath);
    if (!fs.existsSync(filePath)) {
      //throw new Error(`${filePath} does not exist`);
      // TODO: remove this code and throw error if the file is not found
      // console.log("niet gevonden");
      // filePath = dummyFilePath;
      filePath = "";
    }
    //  else {
    //   console.log("wel gevonden");
    // }
    let file: File;
    if (filePath !== "") {
      const fileBuffer = fs.readFileSync(filePath);
      // also saves the file to disk
      file = await constructFile(fileBuffer, filePath);
    } else {
      // get just file 1
      file = new File(
        "filename",
        fileExtension,
        "0000000000000000000000000000000000000000000000000000000000000000"
      );
      // set name to feedback as it is now some numbers
      file.name = "feedback";
      await file.save();
    }

    const answer = new UploadQuestionAnswer(question, review, file);
    await answer.save();
  }

  // SubmissionComment,
  console.log();
  console.log("importing submissioncomments");
  const submissionCommentStatement = new PreparedStatement({
    name: "submissionCommentStatement",
    text: 'SELECT * FROM "submissioncomment"',
  });
  const submissionComments = await Database.executeQuery(
    submissionCommentStatement
  );
  const orderedsubmissionComments = _.sortBy(submissionComments, "id");
  console.log("num submissioncomments: ", orderedsubmissionComments.length);

  for (const submissionComment of orderedsubmissionComments) {
    // const oldId = submissionComment.id;
    const commentText = submissionComment.comment;
    const submission = submissionMap.get(submissionComment.submission_id)!;
    const user = userMap.get(submissionComment.netid)!;

    // console.log(oldId, commentText, submission, user);
    const comment = new SubmissionComment(commentText, user, submission);
    await comment.save();
  }
  // ReviewComment,
  console.log();
  console.log("importing reviewcomments");
  const reviewCommentStatement = new PreparedStatement({
    name: "reviewCommentStatement",
    text: 'SELECT * FROM "reviewcomment"',
  });
  const reviewComments = await Database.executeQuery(reviewCommentStatement);
  if (reviewComments.length > 0) {
    throw new Error("there are reviewcomments!");
  }

  // update all reviews (they can now be subbmitted as the questions are there)
  for (const oldReview of sortedOldReviews) {
    // id SERIAL,
    const oldId = oldReview.id;
    const review = reviewMap.get(oldId)!;

    // User_netid varchar(500) NOT NULL,
    // already set

    // Submission_id int,
    //aleady set
    // evaluated_review_id int, (this review should be defiend as we go over all reviews in order of id)
    // already set
    // flagged BOOLEAN NOT NULL DEFAULT FALSE,
    const flagged = oldReview.flagged;
    review.flaggedByReviewer = flagged;
    // Rubric_id int NOT NULL,
    // already set
    // done BOOLEAN NOT NULL DEFAULT FALSE,
    const done = oldReview.done;
    review.submitted = done;
    // creation_date timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    const creationDate = oldReview.creation_date;
    review.createdAt = creationDate;
    // started_at timestamptz,
    const startedAt = oldReview.started_at ? oldReview.started_at : null;
    review.startedAt = startedAt;
    // downloaded_at timestamptz,
    const downloadedAt = oldReview.downloaded_at
      ? oldReview.downloaded_at
      : null;
    review.downloadedAt = downloadedAt;
    // submitted_at timestamptz,
    const submittedAt = oldReview.submitted_at ? oldReview.submitted_at : null;
    review.submittedAt = submittedAt;
    // saved_at timestamptz,
    const savedAt = oldReview.saved_at ? oldReview.saved_at : null;
    review.savedAt = savedAt;
    // approved boolean,
    const oldApproval = oldReview.approved;
    let approval;
    if (typeof oldApproval === "boolean") {
      approval = oldApproval;
    } else {
      approval = null;
    }
    review.approvalByTA = approval;
    // ta_netid varchar(500),
    const tauser = oldReview.ta_netid ? userMap.get(oldReview.ta_netid)! : null;
    review.approvingTA = tauser;

    // log the errors to the console so they can be solved in one go
    try {
      await review.save();
      reviewMap.set(oldId, review);
    } catch (error) {
      console.log(error);
      console.log(oldReview);
    }
  }

  console.log("Done migration");
  return;
};

const migrateDBTest = async function (): Promise<void> {
  console.log("Start migrationtest ");

  // database connection with mysql database
  const connection = await createConnection(ormconfig);
  console.log(connection.name);
};

console.log(migrateDB, migrateDBTest);

// migrateDBTest()
migrateDB()
  .then(() => {
    console.log("finished succesfully");
    process.exit(0);
  })
  .catch((error) => {
    console.log(error);
    console.log("did not finish succesfully");
    process.exit(0);
  });
