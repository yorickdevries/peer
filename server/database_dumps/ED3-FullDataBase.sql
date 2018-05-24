-- Created by Vertabelo (http://vertabelo.com)
-- Last modification date: 2018-05-14 13:17:27.143

-- tables
-- Table: AssignmentList
CREATE TABLE AssignmentList (
    title varchar(100)  NOT NULL,
    description varchar(1000)  NOT NULL,
    due_date timestamptz NOT NULL,
    publish_date timestamptz NOT NULL,
    id SERIAL,
    Course_id int NOT NULL,
    CONSTRAINT AssignmentList_pk PRIMARY KEY (id)
);

-- Table: CourseList
CREATE TABLE CourseList (
    id SERIAL,
    description varchar(200)  NOT NULL,
    name varchar(200)  NOT NULL,
    CONSTRAINT CourseList_pk PRIMARY KEY (id)
);

-- Table: Enroll
CREATE TABLE Enroll (
    Course_id int NOT NULL,
    User_netid varchar(256)  NOT NULL,
    role varchar(25)  NOT NULL,
    CONSTRAINT Enroll_pk PRIMARY KEY (Course_id,User_netid)
);

-- Table: GroupExercise
CREATE TABLE GroupExercise (
    Assignment_id int NOT NULL,
    Group_id int NOT NULL,
    CONSTRAINT GroupExercise_pk PRIMARY KEY (Assignment_id,Group_id)
);

-- Table: GroupList
CREATE TABLE GroupList (
    id SERIAL,
    group_name varchar(20) NOT NULL,
    CONSTRAINT GroupList_pk PRIMARY KEY (id)
);

-- Table: GroupUsers
CREATE TABLE GroupUsers (
    User_netid varchar(256)  NOT NULL,
    Group_groupid int NOT NULL,
    CONSTRAINT GroupUsers_pk PRIMARY KEY (User_netid,Group_groupid)
);

-- Table: MCAnswer
CREATE TABLE MCAnswer (
    answer char(1)  NOT NULL,
    MCQuestion_id int NOT NULL,
    Review_id int NOT NULL,
    CONSTRAINT MCAnswer_pk PRIMARY KEY (MCQuestion_id,Review_id)
);

-- Table: MCOption
CREATE TABLE MCOption (
    id SERIAL,
    option varchar(100)  NOT NULL,
    MCQuestion_id int NOT NULL,
    CONSTRAINT MCOption_pk PRIMARY KEY (id)
);

-- Table: MCQuestion
CREATE TABLE MCQuestion (
    id SERIAL,
    question varchar(200)  NOT NULL,
    Rubric_Assignment_id int NOT NULL,
    question_number int NOT NULL,
    CONSTRAINT MCQuestion_pk PRIMARY KEY (id)
);

-- Table: OpenAnswer
CREATE TABLE OpenAnswer (
    answer varchar(200)  NOT NULL,
    OpenQuestion_id int NOT NULL,
    Review_id int NOT NULL,
    CONSTRAINT OpenAnswer_pk PRIMARY KEY (OpenQuestion_id,Review_id)
);

-- Table: OpenQuestion
CREATE TABLE OpenQuestion (
    id SERIAL,
    question varchar(200)  NOT NULL,
    Rubric_Assignment_id int NOT NULL,
    question_number int NOT NULL,
    CONSTRAINT OpenQuestion_pk PRIMARY KEY (id)
);

-- Table: RangeAnswer
CREATE TABLE RangeAnswer (
    answer int  NOT NULL,
    RangeQuestion_id int NOT NULL,
    Review_id int NOT NULL,
    CONSTRAINT RangeAnswer_pk PRIMARY KEY (RangeQuestion_id,Review_id)
);

-- Table: RangeQuestion
CREATE TABLE RangeQuestion (
    id SERIAL,
    question varchar(200)  NOT NULL,
    range int  NOT NULL,
    Rubric_Assignment_id int NOT NULL,
    question_number int NOT NULL,
    CONSTRAINT RangeQuestion_pk PRIMARY KEY (id)
);

-- Table: Review
CREATE TABLE Review (
    id SERIAL,
    comment varchar(500)  NOT NULL,
    User_netid varchar(256)  NOT NULL,
    Submission_id int NOT NULL,
    Rubric_Assignment_id int NOT NULL,
    CONSTRAINT Review_pk PRIMARY KEY (id)
);

-- Table: Rubric
CREATE TABLE Rubric (
    Assignment_id int NOT NULL,
    CONSTRAINT Rubric_pk PRIMARY KEY (Assignment_id)
);

-- Table: Submission
CREATE TABLE Submission (
    id SERIAL,
    User_netid varchar(256)  NOT NULL,
    Assignment_id int NOT NULL,
    file_path varchar(100)  NOT NULL,
    CONSTRAINT Submission_pk PRIMARY KEY (id)
);

-- Table: UserList
CREATE TABLE UserList (
    netid varchar(256)  NOT NULL,
    email varchar(256)  NOT NULL,
    CONSTRAINT UserList_pk PRIMARY KEY (netid)
);

-- foreign keys
-- Reference: Assignment_Course (table: AssignmentList)
ALTER TABLE AssignmentList ADD CONSTRAINT Assignment_Course
    FOREIGN KEY (Course_id)
    REFERENCES CourseList (id)
    NOT DEFERRABLE
    INITIALLY IMMEDIATE
;

-- Reference: Enroll_Course (table: Enroll)
ALTER TABLE Enroll ADD CONSTRAINT Enroll_Course
    FOREIGN KEY (Course_id)
    REFERENCES CourseList (id)
    NOT DEFERRABLE
    INITIALLY IMMEDIATE
;

-- Reference: Enroll_User (table: Enroll)
ALTER TABLE Enroll ADD CONSTRAINT Enroll_User
    FOREIGN KEY (User_netid)
    REFERENCES UserList (netid)
    NOT DEFERRABLE
    INITIALLY IMMEDIATE
;

-- Reference: GroupExercise_Exercise (table: GroupExercise)
ALTER TABLE GroupExercise ADD CONSTRAINT GroupExercise_Exercise
    FOREIGN KEY (Assignment_id)
    REFERENCES AssignmentList (id)
    NOT DEFERRABLE
    INITIALLY IMMEDIATE
;

-- Reference: GroupExercise_Group (table: GroupExercise)
ALTER TABLE GroupExercise ADD CONSTRAINT GroupExercise_Group
    FOREIGN KEY (Group_id)
    REFERENCES GroupList (id)
    NOT DEFERRABLE
    INITIALLY IMMEDIATE
;

-- Reference: GroupUsers_Group (table: GroupUsers)
ALTER TABLE GroupUsers ADD CONSTRAINT GroupUsers_Group
    FOREIGN KEY (Group_groupid)
    REFERENCES GroupList (id)
    NOT DEFERRABLE
    INITIALLY IMMEDIATE
;

-- Reference: GroupUsers_User (table: GroupUsers)
ALTER TABLE GroupUsers ADD CONSTRAINT GroupUsers_User
    FOREIGN KEY (User_netid)
    REFERENCES UserList (netid)
    NOT DEFERRABLE
    INITIALLY IMMEDIATE
;

-- Reference: MCAnswer_MCQuestion (table: MCAnswer)
ALTER TABLE MCAnswer ADD CONSTRAINT MCAnswer_MCQuestion
    FOREIGN KEY (MCQuestion_id)
    REFERENCES MCQuestion (id)
    NOT DEFERRABLE
    INITIALLY IMMEDIATE
;

-- Reference: MCAnswer_Review (table: MCAnswer)
ALTER TABLE MCAnswer ADD CONSTRAINT MCAnswer_Review
    FOREIGN KEY (Review_id)
    REFERENCES Review (id)
    NOT DEFERRABLE
    INITIALLY IMMEDIATE
;

-- Reference: MCOption_MCQuestion (table: MCOption)
ALTER TABLE MCOption ADD CONSTRAINT MCOption_MCQuestion
    FOREIGN KEY (MCQuestion_id)
    REFERENCES MCQuestion (id)
    NOT DEFERRABLE
    INITIALLY IMMEDIATE
;

-- Reference: MCQuestion_Rubric (table: MCQuestion)
ALTER TABLE MCQuestion ADD CONSTRAINT MCQuestion_Rubric
    FOREIGN KEY (Rubric_Assignment_id)
    REFERENCES Rubric (Assignment_id)
    NOT DEFERRABLE
    INITIALLY IMMEDIATE
;

-- Reference: OpenAnswer_OpenQuestion (table: OpenAnswer)
ALTER TABLE OpenAnswer ADD CONSTRAINT OpenAnswer_OpenQuestion
    FOREIGN KEY (OpenQuestion_id)
    REFERENCES OpenQuestion (id)
    NOT DEFERRABLE
    INITIALLY IMMEDIATE
;

-- Reference: OpenAnswer_Review (table: OpenAnswer)
ALTER TABLE OpenAnswer ADD CONSTRAINT OpenAnswer_Review
    FOREIGN KEY (Review_id)
    REFERENCES Review (id)
    NOT DEFERRABLE
    INITIALLY IMMEDIATE
;

-- Reference: OpenQuestion_Rubric (table: OpenQuestion)
ALTER TABLE OpenQuestion ADD CONSTRAINT OpenQuestion_Rubric
    FOREIGN KEY (Rubric_Assignment_id)
    REFERENCES Rubric (Assignment_id)
    NOT DEFERRABLE
    INITIALLY IMMEDIATE
;

-- Reference: RangeAnswer_RangeQuestion (table: RangeAnswer)
ALTER TABLE RangeAnswer ADD CONSTRAINT RangeAnswer_RangeQuestion
    FOREIGN KEY (RangeQuestion_id)
    REFERENCES RangeQuestion (id)
    NOT DEFERRABLE
    INITIALLY IMMEDIATE
;

-- Reference: RangeAnswer_Review (table: RangeAnswer)
ALTER TABLE RangeAnswer ADD CONSTRAINT RangeAnswer_Review
    FOREIGN KEY (Review_id)
    REFERENCES Review (id)
    NOT DEFERRABLE
    INITIALLY IMMEDIATE
;

-- Reference: RangeQuestion_Rubric (table: RangeQuestion)
ALTER TABLE RangeQuestion ADD CONSTRAINT RangeQuestion_Rubric
    FOREIGN KEY (Rubric_Assignment_id)
    REFERENCES Rubric (Assignment_id)
    NOT DEFERRABLE
    INITIALLY IMMEDIATE
;

-- Reference: Review_Rubric (table: Review)
ALTER TABLE Review ADD CONSTRAINT Review_Rubric
    FOREIGN KEY (Rubric_Assignment_id)
    REFERENCES Rubric (Assignment_id)
    NOT DEFERRABLE
    INITIALLY IMMEDIATE
;

-- Reference: Review_Submission (table: Review)
ALTER TABLE Review ADD CONSTRAINT Review_Submission
    FOREIGN KEY (Submission_id)
    REFERENCES Submission (id)
    NOT DEFERRABLE
    INITIALLY IMMEDIATE
;

-- Reference: Review_User (table: Review)
ALTER TABLE Review ADD CONSTRAINT Review_User
    FOREIGN KEY (User_netid)
    REFERENCES UserList (netid)
    NOT DEFERRABLE
    INITIALLY IMMEDIATE
;

-- Reference: Rubric_Exercise (table: Rubric)
ALTER TABLE Rubric ADD CONSTRAINT Rubric_Exercise
    FOREIGN KEY (Assignment_id)
    REFERENCES AssignmentList (id)
    NOT DEFERRABLE
    INITIALLY IMMEDIATE
;

-- Reference: Submission_Assignment (table: Submission)
ALTER TABLE Submission ADD CONSTRAINT Submission_Assignment
    FOREIGN KEY (Assignment_id)
    REFERENCES AssignmentList (id)
    NOT DEFERRABLE
    INITIALLY IMMEDIATE
;

-- Reference: Submission_User (table: Submission)
ALTER TABLE Submission ADD CONSTRAINT Submission_User
    FOREIGN KEY (User_netid)
    REFERENCES UserList (netid)
    NOT DEFERRABLE
    INITIALLY IMMEDIATE
;


-- Default insert queries
INSERT INTO "userlist" (
	"netid", "email")
	VALUES ('paulvanderlaan', 'p.j.vanderlaan-1@student.tudelft.nl');

INSERT INTO "userlist" (
	"netid", "email")
	VALUES ('henkjan', 'h.j@student.tudelft.nl');

INSERT INTO public.courselist(
    description, name)
    VALUES ('This is a beautiful course description!', 'ED-3');

INSERT INTO public.grouplist(
	id, group_name)
	VALUES (10, 'ED-3');

INSERT INTO public.assignmentlist(
	title, description, course_id, due_date, publish_date)
	VALUES ('Assignment 1', 'Example assignment number one', 1, '2018-05-01T20:30:00Z', '2018-04-01T20:30:00Z');

INSERT INTO public.rubric(
	assignment_id)
	VALUES (1);

INSERT INTO public.openquestion(
	question, rubric_assignment_id, question_number)
	VALUES ('How to insert queries?', 1, 1);

INSERT INTO public.rangequestion(
	question, range, rubric_assignment_id, question_number)
	VALUES ('How much fun is inserting queries?', 7, 1, 2);

INSERT INTO public.mcquestion(
	question, rubric_assignment_id, question_number)
	VALUES ('What is the best way to insert queries?', 1, 3);

INSERT INTO public.mcoption(
	option, mcquestion_id)
	VALUES ('By using pgAdmin', 1);

INSERT INTO public.mcoption(
	option, mcquestion_id)
	VALUES ('By using command line', 1);

INSERT INTO public.mcoption(
	option, mcquestion_id)
	VALUES ('By asking Brian', 1);

INSERT INTO public.enroll(
	course_id, user_netid, role)
	VALUES (1, 'paulvanderlaan', 'Owner');

INSERT INTO public.groupexercise(
	assignment_id, group_id)
	VALUES (1, 10);

INSERT INTO public.submission(
	user_netid, assignment_id, file_path)
	VALUES ('paulvanderlaan', 1, 'submission1.pdf');

INSERT INTO public.submission(
	user_netid, assignment_id, file_path)
	VALUES ('henkjan', 1, 'submission2.pdf');

INSERT INTO public.review(
	comment, user_netid, submission_id, rubric_assignment_id)
	VALUES ('Plagiaat', 'henkjan', 1, 1);

INSERT INTO public.mcanswer(
	answer, mcquestion_id, review_id)
	VALUES ('B', 1, 1);

INSERT INTO public.openanswer(
	answer, openquestion_id, review_id)
	VALUES ('Flesje water is beter dan flesje bier', 1, 1);

INSERT INTO public.rangeanswer(
	answer, rangequestion_id, review_id)
	VALUES (4, 1, 1);
-- End of file.




