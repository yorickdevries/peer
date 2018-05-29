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
    filename varchar(100) NOT NULL,
    CONSTRAINT AssignmentList_pk PRIMARY KEY (id)
);

-- Table: CourseList
CREATE TABLE CourseList (
    id SERIAL,
    description varchar(2000)  NOT NULL,
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

-- Table: AssignmentGroup
CREATE TABLE AssignmentGroup (
    Assignment_id int NOT NULL,
    Group_id int NOT NULL,
    CONSTRAINT AssignmentGroup_pk PRIMARY KEY (Assignment_id,Group_id)
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
    answer int NOT NULL,
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
    type_question char(2) DEFAULT 'mc',
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
    type_question char(4) DEFAULT 'open',
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
    type_question char(5) DEFAULT 'range',
    CONSTRAINT RangeQuestion_pk PRIMARY KEY (id)
);

-- Table: Review
CREATE TABLE Review (
    id SERIAL,
    comment varchar(500),
    User_netid varchar(256)  NOT NULL,
    Submission_id int NOT NULL,
    Rubric_Assignment_id int NOT NULL,
    done BOOLEAN NOT NULL DEFAULT FALSE,
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
    Group_id int NOT NULL,
    Assignment_id int NOT NULL,
    file_path varchar(100)  NOT NULL,
    CONSTRAINT Submission_pk PRIMARY KEY (id)
);

-- Table: UserList
CREATE TABLE UserList (
    netid varchar(256)  NOT NULL,
    email varchar(256),
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

-- Reference: AssignmentGroup_Assignment (table: AssignmentGroup)
ALTER TABLE AssignmentGroup ADD CONSTRAINT AssignmentGroup_Assignment
    FOREIGN KEY (Assignment_id)
    REFERENCES AssignmentList (id)
    NOT DEFERRABLE
    INITIALLY IMMEDIATE
;

-- Reference: AssignmentGroup_Group (table: AssignmentGroup)
ALTER TABLE AssignmentGroup ADD CONSTRAINT AssignmentGroup_Group
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
    ON DELETE CASCADE
    NOT DEFERRABLE
    INITIALLY IMMEDIATE
;

-- Reference: MCAnswer_Review (table: MCAnswer)
ALTER TABLE MCAnswer ADD CONSTRAINT MCAnswer_Review
    FOREIGN KEY (Review_id)
    REFERENCES Review (id)
    ON DELETE CASCADE
    NOT DEFERRABLE
    INITIALLY IMMEDIATE
;

-- Reference: MCOption_MCQuestion (table: MCOption)
ALTER TABLE MCOption ADD CONSTRAINT MCOption_MCQuestion
    FOREIGN KEY (MCQuestion_id)
    REFERENCES MCQuestion (id)
    ON DELETE CASCADE
    NOT DEFERRABLE
    INITIALLY IMMEDIATE
;

-- Reference: MCQuestion_Rubric (table: MCQuestion)
ALTER TABLE MCQuestion ADD CONSTRAINT MCQuestion_Rubric
    FOREIGN KEY (Rubric_Assignment_id)
    REFERENCES Rubric (Assignment_id)
    ON DELETE CASCADE
    NOT DEFERRABLE
    INITIALLY IMMEDIATE
;

-- Reference: OpenAnswer_OpenQuestion (table: OpenAnswer)
ALTER TABLE OpenAnswer ADD CONSTRAINT OpenAnswer_OpenQuestion
    FOREIGN KEY (OpenQuestion_id)
    REFERENCES OpenQuestion (id)
    ON DELETE CASCADE
    NOT DEFERRABLE
    INITIALLY IMMEDIATE
;

-- Reference: OpenAnswer_Review (table: OpenAnswer)
ALTER TABLE OpenAnswer ADD CONSTRAINT OpenAnswer_Review
    FOREIGN KEY (Review_id)
    REFERENCES Review (id)
    ON DELETE CASCADE
    NOT DEFERRABLE
    INITIALLY IMMEDIATE
;

-- Reference: OpenQuestion_Rubric (table: OpenQuestion)
ALTER TABLE OpenQuestion ADD CONSTRAINT OpenQuestion_Rubric
    FOREIGN KEY (Rubric_Assignment_id)
    REFERENCES Rubric (Assignment_id)
    ON DELETE CASCADE
    NOT DEFERRABLE
    INITIALLY IMMEDIATE
;

-- Reference: RangeAnswer_RangeQuestion (table: RangeAnswer)
ALTER TABLE RangeAnswer ADD CONSTRAINT RangeAnswer_RangeQuestion
    FOREIGN KEY (RangeQuestion_id)
    REFERENCES RangeQuestion (id)
    ON DELETE CASCADE
    NOT DEFERRABLE
    INITIALLY IMMEDIATE
;

-- Reference: RangeAnswer_Review (table: RangeAnswer)
ALTER TABLE RangeAnswer ADD CONSTRAINT RangeAnswer_Review
    FOREIGN KEY (Review_id)
    REFERENCES Review (id)
    ON DELETE CASCADE
    NOT DEFERRABLE
    INITIALLY IMMEDIATE
;

-- Reference: RangeQuestion_Rubric (table: RangeQuestion)
ALTER TABLE RangeQuestion ADD CONSTRAINT RangeQuestion_Rubric
    FOREIGN KEY (Rubric_Assignment_id)
    REFERENCES Rubric (Assignment_id)
    ON DELETE CASCADE
    NOT DEFERRABLE
    INITIALLY IMMEDIATE
;

-- Reference: Review_Rubric (table: Review)
ALTER TABLE Review ADD CONSTRAINT Review_Rubric
    FOREIGN KEY (Rubric_Assignment_id)
    REFERENCES Rubric (Assignment_id)
    ON DELETE CASCADE
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

-- Reference: Rubric_Assignment (table: Rubric)
ALTER TABLE Rubric ADD CONSTRAINT Rubric_Assignment
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

-- Reference: Submission_Group (table: Submission)
ALTER TABLE Submission ADD CONSTRAINT Submission_Group
    FOREIGN KEY (Group_id)
    REFERENCES GroupList (id)
    NOT DEFERRABLE
    INITIALLY IMMEDIATE
;

-- End of file.
