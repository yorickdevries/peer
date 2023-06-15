# How does peer work?
## Review Phases
In theory, Peer works using a 2-step or 3-step process:

1. Submission: Submit your work
2. Review: Give feedback on work from others
3. Evaluation: Evaluate the feedback you have received

The final stage can be enabled or disabled per assignment.

As with most things, reality is more complicated than the theory. Peer actually distinguishes 8 different states for an assignment:

1. Assignment is unpublished, all configuration can be adjusted
2. Assignment is published, students can make submissions
3. Submissions cannot be made any more
4. Students who made submissions are assigned to review other submissions
5. Reviews cannot be made any more
6. Students are able to see the feedback on their submissions
7. (Optional) Students are able to fill out an evaluation of their received feedback
8. (Optional) Evaluations cannot be made any more

It is possible to progress through these stages manually (when you press the button) or automatically (based on configured deadlines).

## Going back
Sometimes, you may want to go back from one stage to an earlier stage. However, **Peer does not support going back to an earlier stage**. By making it strictly impossible to go back to a previous state, we prevent a lot of edge cases and potential errors in the application. Additionally, students cannot lose any work they have done or are in the process of doing as a result of going backwards. For example, consider going back after reviews were distributed. Immediately after, a student may start looking at their assigned submission and start writing feedback. If we would allow the state to go back, then there is no guarantee that after the problem is fixed (we assume there was a reason to go back) that that same student gets the same submission to review: their review and work is lost.

However, this does impose more restrictions on you. Specifically, you should take extra care that the reviews are distributed at the correct moment, and that they are distributed in the way you intend. You can use this manual to read about specifics on how to configure Peer properly.

We are working on improving this:
* Making it clearer in the interface how reviews will be distributed
* Making going back possible in a minimally-destructive/disruptive way

Additionally, Peer allows you to accept late reviews and evaluations (and in some cases submissions), see [Additions after the Deadline](#additions-after-the-deadline) below.

## Additions after the Deadline
Sometimes, you want to allow students to still submit their work, review or evaluation after the deadline. Peer supports this to a certain degree.

### Late Submissions
If you configure an assignment to accept late submissions, students can still submit their assignments until reviews are distributed (phase 4). After reviews are distributed, it is not possible to add additional submissions. This is because all other students are already assigned to review work from their peers, and adding someone extra is impossible without changing who reviews what. If you have multiple students who would want to submit late, the reviews are already distributed and you really want to allow this, you could consider setting up a separate assignment for them or doing the peer review for this (hopefully small group) outside of peer.

If you have large scale problems, you can contact eip-ewi@tudelft.nl for support.

### Late Reviews
You can configure an assignment to accept late reviews. This means that students can still submit a review (give feedback) even after the deadline for reviews has passed. These can be made in any phase, as long as the review is assigned to the student.

The main caveat is that the student who made the original submission is *not informed* of the feedback they received late. This means they may not realize they received feedback after the deadline passed. Additionally, if you require students to evaluate their received feedback, then the student may likewise forget to evaluate this feedback.

### Late Evaluations
You can configure an assignment to accept late evaluations. This means that students can still submit evaluations (evaluate the received feedback) even after the deadline for evaluations has passed.

There is no real downside to accepting late evaluations for students, but you should keep it in mind if you use the evaluation for assigning TA-checks (student assistants checking some submissions or reviews) or for grading purposes.

## Groups
Internally, Peer _always_ uses groups for submissions, and _never_ for reviews. If your students do their work individually, then Peer considers them to each be in a group of 1 student. As a result, you may see the word "group" used occasionally, even when you are not using groups. Groups are considered and configured separately for each assignment. If you are using groups, you can import these from a Brightspace export or from a csv file with an identical format. It is also possible to copy the groups from a different assignment in the same course.

When working with actual groups, then any member of the group can make a submission on behalf of the group. However, when reviews are distributed, each member of the group is assigned n submissions (per your configuration) to give feedback on. In other words, **groups are completely ignored for the reviewing phase**.

We are currently working on allowing reviews to be distributed to groups as well, but this unfortunately requires some major changes to how peer works.

## Review Distribution
### Simple Assignments
Let's say you have a simple assignment. Each student (or group) does some work, and you want them to review each other without any further restrictions. This is very easy to set up in peer.

Under Review Distribution, click Create Default Assignment Version. Now set the number of assigments that each student should review and confirm.

If you do want to enforce some rules on who reviews whom, see [Assignment Versions](#assignment-versions) below.

### Assignment Versions
Assignment versions should be used when you want to make a distinction between different sets of students, and have them review each other (or not review each other). If you want different sets of students to review each other, they _must_ submit to the same assignment in Peer.

For example, lets say you have two different assignments (Assignment A and B) which students hand in at the same time. You want the students who submitted assignment A to give feedback to students who submitted assignment B, and vice versa. You can do so in Peer by, in a single assignment, creating two assignment versions (A and B), and indicating that version A reviews B and that version B reviews A.

Peer supports more complex setups as well, and is not limited in the amount of versions. For example, if you have 3 different assignments (A, B and C) you can set Peer to have students from A review B and C (1 of each), students from B review two submissions from A, and students from C review submissions from A and B and C (1 of each).

Even if you don't have students actually do different assignments, you may have reasons to want a specific part of the student population to review another specific part of the population (or not review them), or you may want certain students to submit a different number of reviews than other students. Here too you can use assignment versions, as this allows you to specify which student set should review which other student set(s). However, keep in mind that if your student sets don't interact with each other (your separate populations do not review each other), you could also just set this up as separate assignments.

Caveat: if you create complex schemes, you should make sure that the review distribution is possible. If the amount of submissions are not equal between assignment versions, you need to have every student give at least two reviews (or more if your versions are really skewed in submission counts). See [Distribution Details](#distribution-details) for the reason for this.

## Distribution Details
There are a lot of corner cases possible in the review distribution. Peer generally aims to make things fair and equal for everyone. That means: every student gives the same amount of reviews and every submission receives the same amount of reviews (or as close as possible). The rest of this section gives more specific details about what happens when this is not possible.

Peer has hard constraints (required):

* Every student gets assigned *exactly* `<your configured number>` of reviews
* Every submission gets the same number of reviews assigned, or as close to equal as possible

Additionally, peer attempts to satisfy the following soft constraints (not required):

* If "members of a group should get different submissions to review" is enabled, peer attempts to do so.

Finally, different assignment versions are considered entirely separate from each other. This means that when we talk about equal in the above constraints, we only consider equality between people who submitted in the same assignment version.

### Hard Constraint Details
The hard constraints must always be met, which can cause situations you might not have expected. For example, if you use assignment versions and the student counts for the different versions are very different. Consider that assignment version A is done by 100 students and assignment version B is done by 10 students. You tell peer that students from version A should give feedback to one submission from version B, and vice versa. This means that 10 students need to review 100 submissions, but you asked peer that each student should only do exactly one review. This is impossible, so peer will not distribute the reviews. You will need to change the configuration to have the people from version B do 10 reviews each.

Please note that this behavior already occurs if you have a difference of 1 submission between versions, which could even be caused with even numbers by a student or group not making a submission.

### Soft Constraint Details
The soft constraints are relaxed as necessary until the review distribution succeeds. For submissions receiving an equal amount of reviews, peer enforces a minimum and maximum number of assigned reviews. Initially these are both set to the average (rounded down and rounded up respectively), and peer will decrease/increase each by 5 at maximum. This means that peer will not find solutions that would have a submission receive more than 10 reviews more than any other submission.

It is possible to configure on an assignment version that the members of one group should each get a different submission to review. If this is possible (i.e. there are more submissions that a group can review than the amount of group members for each group), peer will enforce it. Otherwise peer will drop the constraint and do normal matching. Note that peer will not attempt to make it "as different as possible" in the case it is not possible. (It would require major changes to our algorithms to support such cases, and the added benefit is not large enough for us to do so.)
