-- Created by Vertabelo (http://vertabelo.com)
-- Default insert queries
INSERT INTO "userlist" (
	"netid", "email")
	VALUES ('paulvanderlaan', 'p.j.vanderlaan-1@student.tudelft.nl');

INSERT INTO "userlist" (
	"netid", "email")
	VALUES ('henkjan', 'h.j@student.tudelft.nl');

INSERT INTO public.courselist(
    description, name)
    VALUES
        ('Automata theory is the study of abstract machines and automata, as well as the computational problems that can be solved using them. It is a theory in theoretical computer science and discrete mathematics (a subject of study in both mathematics and computer science). The word automata (the plural of automaton) comes from the Greek word αὐτόματα, which means "self-acting".', 'Automata'),
        ('Concepts of Programming Languages describes the fundamental concepts of programming languages by presenting design issues, examining design choices, and critically comparing design alternatives without being language specific.', 'Concepts of Programming Languages'),
        ('Data modeling is a process used to define and analyze data requirements needed to support the business processes within the scope of corresponding information systems in organizations. Therefore, the process of data modeling involves professional data modelers working closely with business stakeholders, as well as potential users of the information system.', 'Information and Data Modeling'),
        ('In this real-world-tested curriculum, take a look at famous algorithms and equations, and see how yours stack up. See practical demos, compare “life scenarios” to their coding counterparts, and create an app for your final project.', 'Algorithms and Data structures');

INSERT INTO public.grouplist(
	id, group_name)
	VALUES (10, 'ED-3');

INSERT INTO public.assignmentlist(
	title, description, course_id, reviews_per_user, due_date, publish_date, filename)
	VALUES
	    ('Lab assignment 1', 'How to build a DFA', 2, 2, '2018-05-01T20:30:00Z', '2018-04-01T20:30:00Z', 'assignment1.pdf'),
	    ('Lab assignment 2', 'How to build a NFA', 2, 2, '2018-05-01T20:30:00Z', '2018-04-15T20:30:00Z', 'assignment1.pdf'),
	    ('Lab assignment 3', 'How to build a DFA given a NFA', 2, 2, '2018-05-01T20:30:00Z', '2018-03-01T20:30:00Z', 'assignment1.pdf'),
	    ('Assignment 1', 'Example assignment number one', 2, 2, '2018-05-01T20:30:00Z', '2018-04-01T20:30:00Z', 'assignment1.pdf'),
	    ('Assignment 2', 'An example of a second assignment', 2, 2, '2018-05-01T20:30:00Z', '2018-04-01T20:30:00Z', 'assignment2.pdf'),
	    ('Assignment 3', 'This is another example of a third assignment.', 2, 2, '2018-05-01T20:30:00Z', '2018-04-01T20:30:00Z', 'assignment2.pdf'),
	    ('A1', 'Example assignment number one', 3, 2, '2018-05-01T20:30:00Z', '2018-04-01T20:30:00Z', 'assignment2.pdf'),
	    ('A2', 'An example of a second assignment', 3, 2, '2018-05-01T20:30:00Z', '2018-04-01T20:30:00Z', 'assignment2.pdf'),
	    ('Assignment one', 'Example assignment number one', 4, 2, '2018-05-01T20:30:00Z', '2018-04-01T20:30:00Z', 'assignment2.pdf'),
	    ('Assignment two', 'An example of a second assignment', 4, 2, '2018-05-01T20:30:00Z', '2018-04-01T20:30:00Z', 'assignment2.pdf'),
	    ('Assignment three', 'This is another example of a third assignment.', 4, 2, '2018-05-01T20:30:00Z', '2018-04-01T20:30:00Z', 'assignment2.pdf')
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
	    (2, 'paulvanderlaan', 'student'),
	    (3, 'paulvanderlaan', 'student'),
	    (4, 'paulvanderlaan', 'student'),
	    (1, 'henkjan', 'student'),
	    (2, 'henkjan', 'student'),
	    (3, 'henkjan', 'student')
	;

INSERT INTO public.assignmentgroup(
	assignment_id, group_id)
	VALUES (1, 10);

INSERT INTO public.submission(
	user_netid, group_id, assignment_id, file_path, date)
	VALUES
	    ('paulvanderlaan', 10, 4, 'submission1.pdf', '2018-05-01T20:30:00Z'),
	    ('paulvanderlaan', 10, 5, 'submission1.pdf', '2018-05-01T20:30:00Z'),
	    ('paulvanderlaan', 10, 6, 'submission1.pdf', '2018-05-01T20:30:00Z'),
	    ('henkjan', 10, 1, 'submission2.pdf', '2018-05-01T20:30:00Z'),
	    ('henkjan', 10, 2, 'submission2.pdf', '2018-05-01T20:30:00Z'),
	    ('henkjan', 10, 3, 'submission2.pdf', '2018-05-01T20:30:00Z'),
	    ('henkjan', 10, 4, 'submission2.pdf', '2018-05-01T20:30:00Z'),
	    ('henkjan', 10, 5, 'submission2.pdf', '2018-05-01T20:30:00Z'),
	    ('henkjan', 10, 6, 'submission2.pdf', '2018-05-01T20:30:00Z'),
	    ('henkjan', 10, 7, 'submission2.pdf', '2018-05-01T20:30:00Z'),
	    ('henkjan', 10, 8, 'submission2.pdf', '2018-05-01T20:30:00Z')
	;

INSERT INTO public.review(
	comment, user_netid, submission_id, rubric_assignment_id)
	VALUES
	    ('Very good', 'henkjan', 1, 4),
	    ('Impressive', 'henkjan', 2, 5),
	    ('Excellent', 'henkjan', 3, 6),
	    ('Wow!', 'paulvanderlaan', 4, 1),
	    ('Wow!', 'paulvanderlaan', 5, 2),
	    ('Wow!', 'paulvanderlaan', 6, 3),
	    ('Wow!', 'paulvanderlaan', 7, 4),
	    ('Wow!', 'paulvanderlaan', 8, 5),
	    ('Wow!', 'paulvanderlaan', 8, 6),
	    ('Wow!', 'paulvanderlaan', 8, 7),
	    ('Wow!', 'paulvanderlaan', 8, 8)
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

INSERT INTO public.rangeanswer(
	answer, rangequestion_id, review_id)
	VALUES (4, 1, 1);
-- End of file.




