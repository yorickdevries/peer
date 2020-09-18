import { getManager } from "typeorm";
import UserRole from "../enum/UserRole";
import Assignment from "../models/Assignment";
import Course from "../models/Course";
import Enrollment from "../models/Enrollment";
import Group from "../models/Group";
import User from "../models/User";
import ensureConnection from "./ensureConnection";

interface groupNameWithNetidList {
  groupName: string;
  netids: string[];
}

const importGroupsForAssignment = async function (
  assignmentId: number,
  groupNameWithNetidLists: groupNameWithNetidList[]
): Promise<string> {
  await ensureConnection();

  const assignment = await Assignment.findOneOrFail(assignmentId);

  // save the users and enroll them in the course
  await getManager().transaction(
    "REPEATABLE READ", // make sure the role isnt changed while importing
    async (transactionalEntityManager) => {
      const course = await transactionalEntityManager.findOneOrFail(
        Course,
        assignment.courseId
      );

      // iterate over all groups
      for (const groupNameWithNetidList of groupNameWithNetidLists) {
        const netids = groupNameWithNetidList.netids;
        // get or make users
        for (const netid of netids) {
          let user = await transactionalEntityManager.findOne(User, netid);
          // in case the user doesnt exists in the database yet, create it
          if (!user) {
            user = new User(netid);
            await transactionalEntityManager.save(user);
          }
          // enroll user in the course if not already
          let enrollment = await transactionalEntityManager.findOne(
            Enrollment,
            { where: { userNetid: user.netid, courseId: course.id } }
          );

          if (enrollment) {
            if (enrollment.role !== UserRole.STUDENT) {
              throw new Error(`${netid} is ${enrollment.role} in this course`);
            }
          } else {
            // enroll the user as student in the course
            enrollment = new Enrollment(user, course, UserRole.STUDENT);
            await transactionalEntityManager.save(enrollment);
          }
        }
      }
    }
  );
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
      for (const groupNameWithNetidList of groupNameWithNetidLists) {
        const netids = groupNameWithNetidList.netids;
        // get or make users
        const users = [];
        for (const netid of netids) {
          const user = await transactionalEntityManager.findOneOrFail(
            User,
            netid
          );
          users.push(user);
        }

        const groupName = groupNameWithNetidList.groupName;
        // make the group
        const group = new Group(groupName, course, users, [assignment]);
        await transactionalEntityManager.save(group);
        groups.push(group);
      }
    }
  );
  return `Imported ${groups.length} groups for assignment ${assignment.id}`;
};

export default importGroupsForAssignment;
