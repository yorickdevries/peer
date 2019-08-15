import "mocha";
import chai from "chai";
import { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import mockDate from "mockdate";

chai.use(chaiAsPromised);

import CoursesPS from "../src/prepared_statements/courses_ps";
import UserPS from "../src/prepared_statements/user_ps";
import RubricPS from "../src/prepared_statements/rubric_ps";
import GroupsPS from "../src/prepared_statements/group_ps";
import SubmissionsPS from "../src/prepared_statements/submissions_ps";
import AssignmentPS from "../src/prepared_statements/assignment_ps";
import TestData from "./test_helpers/test_data";
import ReviewDistributionTwoAssignments from "../src/reviewDistributionTwoAssignments";

describe("DistributeReviews two assignments", () => {
    /**
     * Make a clean database before each test.
     */
    beforeEach(async () => {
        await TestData.initializeDatabase();
    });

    /**
     * Reset the date to the non-mocked form
     */
    afterEach(function () {
        mockDate.reset();
     });

    /**
     * good weather test
     */
    it("normal review distribution", async () => {
        mockDate.set("2018-05-01T20:30:00.000Z");

        // Add a course
        const course = await CoursesPS.executeCreateCourse("coursedescription", "coursename", true);

        // Add two assignments
        const assignment1: any = await AssignmentPS.executeAddAssignment(
            "TestAssignment 1",
            "Description",
            course.id, 2,
            "filename",
            new Date("2016-05-01T20:30:00.000Z"),
            new Date("2017-05-01T21:30:00.000Z"),
            new Date("2018-05-01T22:30:00.000Z"),
            new Date("2019-05-01T23:30:00.000Z"),
            false,
            false);

        const assignment2: any = await AssignmentPS.executeAddAssignment(
            "TestAssignment 2",
            "Description",
            course.id, 2,
            "filename",
            new Date("2017-05-01T20:30:00.000Z"),
            new Date("2017-05-01T21:30:00.000Z"),
            new Date("2017-05-01T22:30:00.000Z"),
            new Date("2017-05-01T23:30:00.000Z"),
            false,
            false);

        // create rubrics
        await RubricPS.executeCreateRubric(assignment1.id, "submission");
        await RubricPS.executeCreateRubric(assignment2.id, "submission");

        // make students
        const student1 = await UserPS.executeAddUser("studentone");
        const student2 = await UserPS.executeAddUser("studenttwo");
        const student3 = await UserPS.executeAddUser("studentthree");
        const student4 = await UserPS.executeAddUser("studentfour");

        const group1: any = await GroupsPS.executeAddGroup("Group1");
        const group2: any = await GroupsPS.executeAddGroup("Group2");
        const group3: any = await GroupsPS.executeAddGroup("Group3");
        const group4: any = await GroupsPS.executeAddGroup("Group4");

        // add students to group
        await GroupsPS.executeAddStudenttoGroup("studentone", group1.id);
        await GroupsPS.executeAddStudenttoGroup("studenttwo", group2.id);
        await GroupsPS.executeAddStudenttoGroup("studentthree", group3.id);
        await GroupsPS.executeAddStudenttoGroup("studentfour", group4.id);

        // add groups to assignment
        await GroupsPS.executeAddGrouptoAssignment(group1.id, assignment1.id);
        await GroupsPS.executeAddGrouptoAssignment(group2.id, assignment1.id);
        await GroupsPS.executeAddGrouptoAssignment(group3.id, assignment2.id);
        await GroupsPS.executeAddGrouptoAssignment(group4.id, assignment2.id);

        // add submissions
        await SubmissionsPS.executeCreateSubmission("studentone", group1.id, assignment1.id, "filepath");
        await SubmissionsPS.executeCreateSubmission("studenttwo", group2.id, assignment1.id, "filepath");
        await SubmissionsPS.executeCreateSubmission("studentthree", group3.id, assignment2.id, "filepath");
        await SubmissionsPS.executeCreateSubmission("studentfour", group4.id, assignment2.id, "filepath");

        const reviews = await ReviewDistributionTwoAssignments.distributeReviews(assignment1.id, assignment2.id, 2);
        for (const review of reviews) {
            if (review.userNetId == "studentone" || review.userNetId == "studenttwo") {
                expect(review.assignmentID).to.not.equal(assignment1.id);
            } else if (review.userNetId == "studentthree" || review.userNetId == "studentfour") {
                expect(review.assignmentID).to.not.equal(assignment2.id);
            } else {
                expect(true).to.equal(false);
            }
        }
    });

    /**
     * non equal groups
     */
    it("unequal groups review distribution", async () => {
        mockDate.set("2018-05-01T20:30:00.000Z");

        // Add a course
        const course = await CoursesPS.executeCreateCourse("coursedescription", "coursename", true);

        // Add two assignments
        const assignment1: any = await AssignmentPS.executeAddAssignment(
            "TestAssignment 1",
            "Description",
            course.id, 2,
            "filename",
            new Date("2016-05-01T20:30:00.000Z"),
            new Date("2017-05-01T21:30:00.000Z"),
            new Date("2018-05-01T22:30:00.000Z"),
            new Date("2019-05-01T23:30:00.000Z"),
            false,
            false);

        const assignment2: any = await AssignmentPS.executeAddAssignment(
            "TestAssignment 2",
            "Description",
            course.id, 2,
            "filename",
            new Date("2017-05-01T20:30:00.000Z"),
            new Date("2017-05-01T21:30:00.000Z"),
            new Date("2017-05-01T22:30:00.000Z"),
            new Date("2017-05-01T23:30:00.000Z"),
            false,
            false);

        // create rubrics
        await RubricPS.executeCreateRubric(assignment1.id, "submission");
        await RubricPS.executeCreateRubric(assignment2.id, "submission");

        // make students
        const student1 = await UserPS.executeAddUser("studentone");
        const student2 = await UserPS.executeAddUser("studenttwo");
        const student3 = await UserPS.executeAddUser("studentthree");
        const student4 = await UserPS.executeAddUser("studentfour");
        const student5 = await UserPS.executeAddUser("studentfive");
        const student6 = await UserPS.executeAddUser("studentsix");

        const group1: any = await GroupsPS.executeAddGroup("Group1");
        const group2: any = await GroupsPS.executeAddGroup("Group2");
        const group3: any = await GroupsPS.executeAddGroup("Group3");
        const group4: any = await GroupsPS.executeAddGroup("Group4");
        const group5: any = await GroupsPS.executeAddGroup("Group5");
        const group6: any = await GroupsPS.executeAddGroup("Group6");

        // add students to group
        await GroupsPS.executeAddStudenttoGroup("studentone", group1.id);
        await GroupsPS.executeAddStudenttoGroup("studenttwo", group2.id);
        await GroupsPS.executeAddStudenttoGroup("studentthree", group3.id);
        await GroupsPS.executeAddStudenttoGroup("studentfour", group4.id);
        await GroupsPS.executeAddStudenttoGroup("studentfive", group5.id);
        await GroupsPS.executeAddStudenttoGroup("studentsix", group6.id);

        // add groups to assignment
        await GroupsPS.executeAddGrouptoAssignment(group1.id, assignment1.id);
        await GroupsPS.executeAddGrouptoAssignment(group2.id, assignment1.id);
        await GroupsPS.executeAddGrouptoAssignment(group3.id, assignment2.id);
        await GroupsPS.executeAddGrouptoAssignment(group4.id, assignment2.id);
        await GroupsPS.executeAddGrouptoAssignment(group5.id, assignment2.id);
        await GroupsPS.executeAddGrouptoAssignment(group6.id, assignment2.id);

        // add submissions
        await SubmissionsPS.executeCreateSubmission("studentone", group1.id, assignment1.id, "filepath");
        await SubmissionsPS.executeCreateSubmission("studenttwo", group2.id, assignment1.id, "filepath");
        await SubmissionsPS.executeCreateSubmission("studentthree", group3.id, assignment2.id, "filepath");
        await SubmissionsPS.executeCreateSubmission("studentfour", group4.id, assignment2.id, "filepath");
        await SubmissionsPS.executeCreateSubmission("studentfive", group5.id, assignment2.id, "filepath");
        await SubmissionsPS.executeCreateSubmission("studentsix", group6.id, assignment2.id, "filepath");

        const reviews = await ReviewDistributionTwoAssignments.distributeReviews(assignment1.id, assignment2.id, 2);
        for (const review of reviews) {
            if (review.userNetId == "studentone" || review.userNetId == "studenttwo") {
                expect(review.assignmentID).to.not.equal(assignment1.id);
            }
        }
    });

    it("shuffletest", async () => {
        const submissions = [];
        submissions.push({count: 0, submission: {assignment_id: 1}});
        submissions.push({count: 0, submission: {assignment_id: 2}});
        submissions.push({count: 1, submission: {assignment_id: 1}});
        submissions.push({count: 1, submission: {assignment_id: 2}});
        submissions.push({count: 2, submission: {assignment_id: 1}});
        submissions.push({count: 2, submission: {assignment_id: 2}});
        submissions.push({count: 3, submission: {assignment_id: 1}});
        submissions.push({count: 3, submission: {assignment_id: 2}});
        submissions.push({count: 4, submission: {assignment_id: 1}});
        submissions.push({count: 4, submission: {assignment_id: 2}});
        submissions.push({count: 0, submission: {assignment_id: 1}});
        submissions.push({count: 0, submission: {assignment_id: 2}});
        submissions.push({count: 1, submission: {assignment_id: 1}});
        submissions.push({count: 1, submission: {assignment_id: 2}});
        submissions.push({count: 2, submission: {assignment_id: 1}});
        submissions.push({count: 2, submission: {assignment_id: 2}});
        submissions.push({count: 3, submission: {assignment_id: 1}});
        submissions.push({count: 3, submission: {assignment_id: 2}});
        submissions.push({count: 4, submission: {assignment_id: 1}});
        submissions.push({count: 4, submission: {assignment_id: 2}});
        submissions.push({count: 0, submission: {assignment_id: 3}});
        submissions.push({count: 1, submission: {assignment_id: 3}});

        // random order
        ReviewDistributionTwoAssignments.shuffle(submissions);
        // sort SubmissionAssignmentIdCount
        ReviewDistributionTwoAssignments.sortSubmissionAssignmentIdCount(submissions, 1);
        // assertaions
        const first = submissions[0];
        expect(first.count).to.equal(0);
        expect(first.submission.assignment_id).to.not.equal(1);
    });

});