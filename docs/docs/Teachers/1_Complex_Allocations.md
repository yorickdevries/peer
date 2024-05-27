# Complex Allocations
## Assigning TAs to reviews
Lets say you have 10 students and 5 TAs. You want every student to give one review to another student, and also to receive 1 review from a TA.

It is possible to do so with a workaround using assignment versions. Assignment versions give you a lot of control over the peer review division between versions. If we treat TAs as doing a special version of the assignment, we can have the distribution work:

- Create custom assignment version, call it “Students”.
- Create custom assignment version, call it “TAs”
- Edit assignment version students, set that each student should review 1 from Students.
- Edit assignment version TAs, set that each TA should review 2 from “Students” and 2 from “TAs” (enter 2, ctrl click (cmd click on mac) both Students and TAs.

Configurations for students and TAs respectively:
!(Configuration for students)[./1_Complex_Allocations/1_version_students.png]
!(Configuration for TAs)[./1_Complex_Allocations/2_version_tas.png]

When fully configured, this should appear like so:

!(Overview of configured assignment versions)[./1_Complex_Allocations/0_version_overview.png]

Next, we need to set up the review questionnaires. Add a questionnaire for students with the review questions you want to ask.
For the TAs questionnaire, put only a single optional question, indicating that the TA does not need to fill it out.

!(Overview of configured assignment versions)[./1_Complex_Allocations/3_review_questionnaire_tas.png]

The students can hand in their assignment under the “students” version.
Each TA also needs to hand in a (empty) file. In the distribution peer will assign each student with 1 review for another student, and each TA with 2 reviews for students and 2 reviews for another TA. The TAs need not actually submit the reviews to the other TAs.
