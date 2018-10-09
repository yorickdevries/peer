-- Created by Vertabelo (http://vertabelo.com)
-- Default insert queries
INSERT INTO "userlist" (
	"netid", "email")
	VALUES ('paulvanderlaan', 'p.j.vanderlaan-1@student.tudelft.nl');

INSERT INTO "userlist" (
	"netid", "email")
	VALUES
		('henkjan', 'h.j@student.tudelft.nl'),
		('yorickdevries', NULL),
		('teacheraccount', 'email@adress.nl');

INSERT INTO public.courselist(
    description, name)
    VALUES
        ('Automata theory is the study of abstract machines and automata, as well as the computational problems that can be solved using them. It is a theory in theoretical computer science and discrete mathematics (a subject of study in both mathematics and computer science). The word automata (the plural of automaton) comes from the Greek word αὐτόματα, which means "self-acting".', 'Automata'),
        ('Concepts of Programming Languages describes the fundamental concepts of programming languages by presenting design issues, examining design choices, and critically comparing design alternatives without being language specific.', 'Concepts of Programming Languages'),
        ('Data modeling is a process used to define and analyze data requirements needed to support the business processes within the scope of corresponding information systems in organizations. Therefore, the process of data modeling involves professional data modelers working closely with business stakeholders, as well as potential users of the information system.', 'Information and Data Modeling'),
        ('In this real-world-tested curriculum, take a look at famous algorithms and equations, and see how yours stack up. See practical demos, compare “life scenarios” to their coding counterparts, and create an app for your final project.', 'Algorithms and Data structures');

INSERT INTO public.grouplist(
	id, group_name)
	VALUES
	(10, 'ED-3'),
	(11, 'ED-4'),
	(12, 'ED-5'),
	(13, 'ED-6')
	;

INSERT INTO public.assignmentlist(
	title, description, course_id, reviews_per_user, filename, publish_date, due_date, review_publish_date, review_due_date, one_person_groups)
	VALUES
	    ('Lab assignment 1', 'How to build a DFA', 2, 2, 'assignment1.pdf', '2017-04-01T20:30:00Z', '2018-05-01T20:30:00Z', '2019-03-01T20:30:00Z', '2020-05-01T20:30:00Z', false),
	    ('Lab assignment 2', 'How to build a NFA', 2, 2, 'assignment1.pdf', '2017-04-01T20:30:00Z', '2018-05-01T20:30:00Z', '2019-03-01T20:30:00Z', '2020-05-01T20:30:00Z', false),
	    ('Lab assignment 3', 'How to build a DFA given a NFA', 2, 2, 'assignment1.pdf', '2017-04-01T20:30:00Z', '2018-05-01T20:30:00Z', '2019-03-01T20:30:00Z', '2020-05-01T20:30:00Z', false),
	    ('Assignment 1', 'Example assignment number one', 2, 2, 'assignment1.pdf', '2012-04-01T20:30:00Z', '2013-05-01T20:30:00Z', '2014-03-01T20:30:00Z', '2015-05-01T20:30:00Z', false),
	    ('Assignment 2', 'An example of a second assignment', 2, 2, 'assignment1.pdf', '2017-04-01T20:30:00Z', '2018-05-01T20:30:00Z', '2019-03-01T20:30:00Z', '2020-05-01T20:30:00Z', false),
	    ('Assignment 3', 'This is another example of a third assignment.', 2, 2, 'assignment2.pdf', '2017-04-01T20:30:00Z', '2018-05-01T20:30:00Z', '2019-03-01T20:30:00Z', '2020-05-01T20:30:00Z', false),
	    ('A1', 'Example assignment number one', 3, 2, 'assignment2.pdf', '2017-04-01T20:30:00Z', '2018-05-01T20:30:00Z', '2019-03-01T20:30:00Z', '2020-05-01T20:30:00Z', false),
	    ('A2', 'An example of a second assignment', 3, 2, 'assignment2.pdf', '2017-04-01T20:30:00Z', '2018-05-01T20:30:00Z', '2019-03-01T20:30:00Z', '2020-05-01T20:30:00Z', false),
	    ('Assignment one', 'Example assignment number one', 4, 2, 'assignment2.pdf', '2017-04-01T20:30:00Z', '2018-05-01T20:30:00Z', '2019-03-01T20:30:00Z', '2020-05-01T20:30:00Z', false),
	    ('Assignment two', 'An example of a second assignment', 4, 2, 'assignment2.pdf', '2017-04-01T20:30:00Z', '2018-05-01T20:30:00Z', '2019-03-01T20:30:00Z', '2020-05-01T20:30:00Z', false),
	    ('Assignment three', 'This is another example of a third assignment.', 4, 2, 'assignment2.pdf', '2017-04-01T20:30:00Z', '2018-05-01T20:30:00Z', '2019-03-01T20:30:00Z', '2020-05-01T20:30:00Z', false),
		('Bonus Assignment', 'bonus description', 2, 2, 'assignment2.pdf', '2017-04-01T20:30:00Z', '2019-05-01T20:30:00Z', '2020-03-01T20:30:00Z', '2021-05-01T20:30:00Z', false)
	    ;


INSERT INTO public.rubric(
	assignment_id)
	VALUES (1), (2), (3), (4), (5), (6), (7), (8), (9), (10), (11);

INSERT INTO public.openquestion(
	question, rubric_assignment_id, question_number)
	VALUES
	    ('Did the author pay attention to the DFA?', 1, 1),
	    ('How did the author do overall?', 1, 2),
	    ('Did the author pay attention to the DFA?', 1, 3),
	    ('Indicate the improvements', 2, 1),
	    ('Did the author pay attention to the DFA?', 2, 3),
	    ('Some open question1', 3, 2),
	    ('Some open question_2', 3, 1),
	    ('Some open question5', 4, 1),
	    ('Some open question4', 5, 1),
	    ('Some open question3', 6, 1),
	    ('Some open question1', 7, 1),
	    ('Some open question2', 8, 1),
	    ('open question', 9, 1),
	    ('Some question', 10, 1),
	    ('Some open question two', 11, 1)
	;

INSERT INTO public.rangequestion(
	question, range, rubric_assignment_id, question_number)
	VALUES
	    ('Rate the DFA', 7, 1, 3),
	    ('Rate the design', 10, 1, 4),
	    ('Rate the assignment', 5, 2, 2),
	    ('Rate the assignment', 7, 3, 1),
	    ('Rate the assignment (again, but different)', 6, 3, 3),
	    ('Give a rating', 7, 4, 2),
	    ('Give a rating1', 3, 5, 2),
	    ('Give a rating2', 4, 6, 2),
	    ('Give a rating3', 8, 7, 2),
	    ('Give a rating4', 7, 8, 2),
	    ('Give a rating5', 4, 9, 2),
	    ('Give a rating6', 2, 10, 2),
	    ('Give a rating7', 5, 11, 2)
	;

INSERT INTO public.mcquestion(
	question, rubric_assignment_id, question_number)
	VALUES
	    ('What is the best way to insert queries?', 1, 4),
	    ('Choose what best relates to the author', 1, 5),
	    ('Choose an option', 2, 4),
	    ('Choose an option1', 3, 5),
	    ('Choose an option2', 4, 3),
	    ('Choose an option3', 5, 3),
	    ('Choose an option4', 6, 3),
	    ('Choose an option5', 7, 3),
	    ('Choose an option6', 8, 3),
	    ('Choose an option7', 9, 3),
	    ('Choose an option8', 10, 3),
	    ('Choose an option9', 11, 3)
	    ;

INSERT INTO public.mcoption(
	option, mcquestion_id)
	VALUES
	    ('By just doing it', 1),
	    ('By trying something else', 1),
	    ('By doing nothing', 1),
	    ('I do not know', 1),
	    ('Option 1', 2),
	    ('Option 2', 2),
	    ('He did enough work', 3),
	    ('He could have done more', 3),
	    ('He did not do anything at all, sadly...', 3),
	    ('Option 1', 4),
	    ('Option 2', 4),
	    ('Option 3', 4),
	    ('Option 1 (1)', 5),
	    ('Option 2 (1)', 5),
	    ('Option 3 (1)', 5),
	    ('Option 1 (2)', 6),
	    ('Option 2 (2)', 6),
	    ('Option 3 (2)', 6),
	    ('Option 1 [1]', 7),
	    ('Option 2 [1]', 7),
	    ('Option 3 [1]', 7),
	    ('Option 1 [2]', 8),
	    ('Option 2 [2]', 8),
	    ('Option 3 [2]', 8),
	    ('Option 1 ([1])', 9),
	    ('Option 2 ([1])', 9),
	    ('Option 3 ([1])', 9),
	    ('Option 1 ([2])', 10),
	    ('Option 2 ([2])', 10),
	    ('Option 3 ([2])', 10),
	    ('Option 1 ([3])', 11),
	    ('Option 2 ([3])', 11),
	    ('Option 3 ([3])', 11)
	    ;

INSERT INTO public.enroll(
	course_id, user_netid, role)
	VALUES
	    (2, 'paulvanderlaan', 'teacher'),
	    (3, 'paulvanderlaan', 'TA'),
	    (4, 'paulvanderlaan', 'TA'),
	    (1, 'henkjan', 'student'),
	    (2, 'henkjan', 'student'),
	    (3, 'henkjan', 'student')
	;

INSERT INTO public.assignmentgroup(
	assignment_id, group_id)
	VALUES 
	(1, 10),
	(1, 11),
	(4, 13);

INSERT INTO public.submission(
	user_netid, group_id, assignment_id, file_path, date)
	VALUES
	    ('paulvanderlaan', 10, 1, 'submission1.pdf', '2018-05-01T20:30:01Z'),
	    ('paulvanderlaan', 10, 1, 'submission1.pdf', '2018-05-01T20:30:02Z'),
	    ('paulvanderlaan', 10, 1, 'submission1.pdf', '2018-05-01T20:30:03Z'),
	    ('henkjan', 10, 1, 'submission2.pdf', '2018-05-01T20:29:04Z'),
	    ('henkjan', 10, 1, 'submission2.pdf', '2018-05-01T20:30:05Z'),
	    ('henkjan', 10, 1, 'submission2.pdf', '2018-05-01T20:30:06Z'),
	    ('henkjan', 10, 1, 'submission1.pdf', '2018-05-01T20:30:07Z'),
	    ('henkjan', 10, 1, 'submission1.pdf', '2018-05-01T20:30:08Z'),
	    ('henkjan', 10, 1, 'submission1.pdf', '2018-05-01T20:30:09Z'),
	    ('henkjan', 10, 1, 'submission1.pdf', '2018-05-01T20:30:10Z'),
	    ('henkjan', 10, 1, 'submission1.pdf', '2018-05-01T20:30:11Z'),
	    ('henkjan', 10, 1, 'submission2.pdf', '2018-05-01T20:30:12Z'),
	    ('henkjan', 10, 1, 'submission2.pdf', '2018-05-01T20:30:13Z'),
	    ('henkjan', 10, 1, 'submission2.pdf', '2018-05-01T20:30:14Z'),
	    ('henkjan', 10, 1, 'submission2.pdf', '2018-05-01T20:30:15Z'),
	    ('henkjan', 10, 1, 'submission2.pdf', '2018-05-01T20:30:16Z'),
	    ('henkjan', 12, 2, 'submission2.pdf', '2018-05-01T20:30:17Z'),
	    ('henkjan', 12, 3, 'submission2.pdf', '2018-05-01T20:30:18Z'),
	    ('henkjan', 12, 4, 'submission2.pdf', '2018-05-01T20:30:19Z'),
	    ('henkjan', 12, 5, 'submission2.pdf', '2018-05-01T20:30:20Z'),
	    ('henkjan', 12, 6, 'submission2.pdf', '2018-05-01T20:30:21Z'),
	    ('henkjan', 12, 7, 'submission2.pdf', '2018-05-01T20:30:22Z'),
	    ('henkjan', 12, 8, 'submission2.pdf', '2018-05-01T20:30:23Z'),
		('yorickdevries', 11, 1, 'submission1.pdf', '2018-05-01T15:30:01Z')
	;

INSERT INTO public.review(
	user_netid, submission_id, rubric_assignment_id, done)
	VALUES
	    ('henkjan', 1, 4, true),
	    ('henkjan', 2, 5, false),
	    ('henkjan', 3, 6, false),
	    ('paulvanderlaan', 3, 1, false),
	    ('paulvanderlaan', 5, 2, false),
	    ('paulvanderlaan', 6, 4, false),
	    ('paulvanderlaan', 7, 4, false),
	    ('paulvanderlaan', 8, 4, false),
	    ('paulvanderlaan', 8, 6, false),
	    ('paulvanderlaan', 8, 7, false),
	    ('paulvanderlaan', 8, 8, false)
	;

INSERT INTO public.mcanswer(
	answer, mcquestion_id, review_id)
	VALUES
	    (1, 1, 1),
	    (1, 2, 1),
	    (2, 3, 1),
	    (2, 4, 1),
	    (2, 5, 1),
	    (2, 6, 1),
	    (2, 7, 1)
	;

INSERT INTO public.openanswer(
	answer, openquestion_id, review_id)
	VALUES ('Flesje water is beter dan flesje bier', 1, 1);

INSERT INTO public.openanswer(
	answer, openquestion_id, review_id)
	VALUES ('Flesje water is beter dan flesje cola', 1, 2);

INSERT INTO public.rangeanswer(
	answer, rangequestion_id, review_id)
	VALUES (4, 1, 1);

INSERT INTO public.rangeanswer(
	answer, rangequestion_id, review_id)
	VALUES (3, 1, 2);

INSERT INTO public.groupusers(
	User_netid, Group_groupid)
	VALUES ('henkjan', 10), ('henkjan', 13);

INSERT INTO public.groupusers(
	User_netid, Group_groupid)
	VALUES ('paulvanderlaan', 10);

INSERT INTO public.groupusers(
	User_netid, Group_groupid)
	VALUES ('yorickdevries', 11);

INSERT INTO public.submissioncomment(
	comment, submission_id, netid)
	VALUES ('Keep it up Brian!', 16, 'paulvanderlaan');

-- End of file.




