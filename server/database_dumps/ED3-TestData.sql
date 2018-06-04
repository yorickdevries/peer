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

INSERT INTO public.courselist(
    description, name)
    VALUES ('This is a beautiful course description!', 'ED-3');

INSERT INTO public.grouplist(
	id, group_name)
	VALUES (10, 'ED-3');

INSERT INTO public.groupusers(
	User_netid, Group_groupid)
	VALUES ('henkjan', 10);

INSERT INTO public.groupusers(
	User_netid, Group_groupid)
	VALUES ('paulvanderlaan', 10);

INSERT INTO public.assignmentlist(
	title, description, course_id, due_date, publish_date, filename)
	VALUES ('Assignment 1', 'Example assignment number one', 1, '2018-05-01T20:30:00Z', '2018-04-01T20:30:00Z', 'assignment1.pdf');

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
	VALUES (1, 'paulvanderlaan', 'student');

INSERT INTO public.assignmentgroup(
	assignment_id, group_id)
	VALUES (1, 10);

INSERT INTO public.submission(
	user_netid, assignment_id, file_path)
	VALUES ('paulvanderlaan', 1, 'submission1.pdf');

INSERT INTO public.submission(
	user_netid, assignment_id, file_path)
	VALUES ('henkjan', 1, 'submission2.pdf');

INSERT INTO public.review(
	comment, user_netid, submission_id, rubric_assignment_id, done)
	VALUES ('Plagiaat', 'henkjan', 1, 1, false), ('Review finished!', 'paulvanderlaan', 1, 1, true);

INSERT INTO public.mcanswer(
	answer, mcquestion_id, review_id)
	VALUES (1, 1, 1);

INSERT INTO public.openanswer(
	answer, openquestion_id, review_id)
	VALUES ('Flesje water is beter dan flesje bier', 1, 1);

INSERT INTO public.rangeanswer(
	answer, rangequestion_id, review_id)
	VALUES (4, 1, 1);
-- End of file.




