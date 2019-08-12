-- Created by Vertabelo (http://vertabelo.com)
-- Default insert queries
INSERT INTO "userlist" (
	"netid", "email")
	VALUES ('paulvanderlaan', 'p.j.vanderlaan-1@student.tudelft.nl');

INSERT INTO "userlist" (
	"netid", "email")
	VALUES ('henkjan', 'h.j@student.tudelft.nl');

INSERT INTO "userlist" (
	"netid", "email")
	VALUES ('yorickdevries', NULL);

INSERT INTO "userlist" (
	"netid", "email")
	VALUES ('bplanje', NULL);

INSERT INTO "userlist" (
	"netid", "email")
	VALUES ('newstudent', NULL);

INSERT INTO "userlist" (
	"netid", "email")
	VALUES ('adversary', NULL);

INSERT INTO public.courselist(
    description, name, enrollable)
    VALUES ('This is a beautiful course description!', 'ED-3', true),
	('Test-course', 'ED-4', true),
	('Test-course2', 'ED-5', false);

INSERT INTO public.grouplist(group_name)
	VALUES
	('Group 1'),
	('Group 2'),
	('Group 3'),
	('Group 4'),
	('Group 5'),
	('Group 6'),
	('Group 7'),
	('Group 8'),
	('Group 9'),
	('ED-3'),
	('Group 11'),
	('Group 12'),
	('Group 13'),
	('Group 14'),
	('Group 15'),
	('Group 16'),
	('Group 17'),
	('Group 18'),
	('Group 19'),
	('Group 20'),
	('Group 21'),
	('Group 22'),
	('Group 23'),
	('Group 24');

INSERT INTO public.groupusers(
	User_netid, Group_groupid)
	VALUES ('henkjan', 10);

INSERT INTO public.groupusers(
	User_netid, Group_groupid)
	VALUES ('henkjan', 23);

INSERT INTO public.groupusers(
	User_netid, Group_groupid)
	VALUES ('henkjan', 24);

INSERT INTO public.groupusers(
	User_netid, Group_groupid)
	VALUES ('paulvanderlaan', 10);

INSERT INTO public.groupusers(
	User_netid, Group_groupid)
	VALUES ('henkjan', 20);

INSERT INTO public.groupusers(
	User_netid, Group_groupid)
	VALUES ('yorickdevries', 21);

INSERT INTO public.groupusers(
	User_netid, Group_groupid)
	VALUES ('bplanje', 21);

INSERT INTO public.groupusers(
	User_netid, Group_groupid)
	VALUES ('paulvanderlaan', 22);

INSERT INTO public.assignmentlist(
	title, description, course_id, reviews_per_user, filename, publish_date, due_date, review_publish_date, review_due_date, one_person_groups)
	VALUES ('Assignment 1', 'Example assignment number one', 1, 2, 'assignment1.pdf', '2018-04-01T20:30:00Z', '2018-05-01T20:30:00Z',  '2018-05-02T20:30:00Z', '2018-05-03T20:30:00Z', false),
	('Assignment 2', 'Example assignment number two', 1, 1, 'assignment2.pdf', '2018-04-01T20:30:00Z', '2018-05-01T20:30:00Z',  '2020-05-01T20:30:00Z', '9999-05-01T20:30:00Z', false),
	('Assignment 3', 'Example assignment number three', 1, 1, 'assignment3.pdf', '2018-04-01T20:30:00Z', '2018-05-01T20:30:00Z',  '2020-05-01T20:30:00Z', '9999-05-01T20:30:00Z', false),
	('Assignment 4', 'Example assignment number four', 3, 2, 'assignment1.pdf', '2018-04-01T20:30:00Z', '2030-05-01T20:30:00Z',  '2030-05-02T20:30:00Z', '2030-05-03T20:30:00Z', false),
	('Assignment 5', 'Example assignment number five', 3, 2, 'assignment1.pdf', '2018-04-01T20:30:00Z', '2018-05-01T20:30:00Z',  '2018-05-02T20:30:00Z', '2030-05-03T20:30:00Z', false);

INSERT INTO public.rubric(
	assignment_id, type)
	VALUES (1, 'assignment');

INSERT INTO public.rubric(
	assignment_id, type)
	VALUES (2, 'assignment');

INSERT INTO public.openquestion(
	question, rubric_id, question_number)
	VALUES ('How to insert queries?', 1, 1);

INSERT INTO public.openquestion(
	question, rubric_id, question_number)
	VALUES ('This is a question for assignment 2?', 2, 1);

INSERT INTO public.rangequestion(
	question, range, rubric_id, question_number)
	VALUES ('How much fun is inserting queries?', 7, 1, 2);

INSERT INTO public.mcquestion(
	question, rubric_id, question_number)
	VALUES ('What is the best way to insert queries?', 1, 3);

INSERT INTO public.mcquestion(
	question, rubric_id, question_number)
	VALUES ('Is the right Answer A?', 1, 4);

INSERT INTO public.mcoption(
	option, mcquestion_id)
	VALUES ('By using pgAdmin', 1);

INSERT INTO public.mcoption(
	option, mcquestion_id)
	VALUES ('By using command line', 1);

INSERT INTO public.mcoption(
	option, mcquestion_id)
	VALUES ('By asking Brian', 1);

INSERT INTO public.mcoption(
	option, mcquestion_id)
	VALUES ('A', 2);

INSERT INTO public.enroll(
	course_id, user_netid, role)
	VALUES (1, 'paulvanderlaan', 'student'),
	(1, 'bplanje', 'teacher'),
	(2, 'bplanje', 'teacher'),
	(3, 'bplanje', 'teacher'),
	(3, 'henkjan', 'student'),
	(3, 'adversary', 'TA')
	;

INSERT INTO public.assignmentgroup(
	assignment_id, group_id)
	VALUES (1, 10);

INSERT INTO public.assignmentgroup(
	assignment_id, group_id)
	VALUES (2, 20);

INSERT INTO public.assignmentgroup(
	assignment_id, group_id)
	VALUES (2, 21);

INSERT INTO public.assignmentgroup(
	assignment_id, group_id)
	VALUES (2, 22);

INSERT INTO public.assignmentgroup(
	assignment_id, group_id)
	VALUES (4, 23);

INSERT INTO public.assignmentgroup(
	assignment_id, group_id)
	VALUES (5, 24);

INSERT INTO public.submission(
	user_netid, group_id, assignment_id, file_path, date)
	VALUES ('paulvanderlaan', 10, 1, 'submission1.pdf', '2018-05-01T20:30:01Z');

INSERT INTO public.submission(
	user_netid, group_id, assignment_id, file_path, date)
	VALUES ('henkjan', 10, 1, 'submission2.pdf', '2018-05-01T20:30:00Z');

INSERT INTO public.submission(
	user_netid, group_id, assignment_id, file_path, date)
	VALUES ('henkjan', 20, 2, 'submission1.pdf','2018-05-01T20:30:30Z');

INSERT INTO public.submission(
	user_netid, group_id, assignment_id, file_path, date)
	VALUES ('yorickdevries', 21, 2, 'submission2_old.pdf', '2018-05-01T20:30:32Z');

INSERT INTO public.submission(
	user_netid, group_id, assignment_id, file_path, date)
	VALUES ('yorickdevries', 21, 2, 'submission2.pdf', '2018-05-01T22:30:04Z');

INSERT INTO public.review(
	user_netid, submission_id, rubric_id, done)
	VALUES ('henkjan', 1, 1, false), ('paulvanderlaan', 1, 1, true);

INSERT INTO public.mcanswer(
	answer, mcquestion_id, review_id)
	VALUES (1, 1, 1);

INSERT INTO public.openanswer(
	answer, openquestion_id, review_id)
	VALUES ('Flesje water is beter dan flesje bier', 1, 1);

INSERT INTO public.rangeanswer(
	answer, rangequestion_id, review_id)
	VALUES (4, 1, 1);

INSERT INTO public.reviewcomment(
	comment, review_id, netid)
	VALUES ('Keep it up Brian!', 1, 'paulvanderlaan');

INSERT INTO public.submissioncomment(
	comment, submission_id, netid)
	VALUES ('Keep it up Brian!', 1, 'paulvanderlaan');
-- End of file.




