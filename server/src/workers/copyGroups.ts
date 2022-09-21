import { getManager } from "typeorm";
import Assignment from "../models/Assignment";
import Course from "../models/Course";
import Group from "../models/Group";
import ensureConnection from "../util/ensureConnection";

const copyGroupsForAssignment = async function (
  assignmentId: number,
  copyFromAssignmentId: number
): Promise<string> {
  await ensureConnection();

  const assignment = await Assignment.findOneOrFail(assignmentId);
  const copyFromAssignment = await Assignment.findOneOrFail(
    copyFromAssignmentId
  );

  const copyFromAssignmentGroups = await copyFromAssignment.getGroups();
  // save the users of the groups in the course
  const groups: Group[] = [];
  await getManager().transaction(
    "SERIALIZABLE", // serializable is the only way to make sure to groups exist before import
    async (transactionalEntityManager) => {
      const existingGroups = await transactionalEntityManager
        .createQueryBuilder(Group, "group")
        .leftJoin("group.assignments", "assignment")
        .where("assignment.id = :id", { id: assignment.id })
        .getMany();
      if (existingGroups.length > 0) {
        throw new Error("There are already groups for this assignment");
      }
      const course = await transactionalEntityManager.findOneOrFail(
        Course,
        assignment.courseId
      );
      // iterate over all groups
      for (const copyFromAssignmentGroup of copyFromAssignmentGroups) {
        const groupWithUsers = await transactionalEntityManager.findOneOrFail(
          Group,
          copyFromAssignmentGroup.id,
          { relations: ["users"] }
        );
        // get users
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const users = groupWithUsers.users!;
        const groupName = groupWithUsers.name;
        // make the new group
        const group = new Group(groupName, course, users, [assignment]);
        await group.validateOrReject();
        await transactionalEntityManager.save(group);
        groups.push(group);
      }
    }
  );
  return `Copied ${groups.length} groups for assignment ${assignment.id}`;
};

export default copyGroupsForAssignment;
