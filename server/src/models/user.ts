export interface UserModel {
  netid: string;
  studentNumber?: number;
  firstName?: string;
  prefix?: string;
  lastName?: string;
  email?: string;
  affiliation?: string | string[];
  displayName?: string;
  study?: string;
  organisationUnit?: string | string[];
}
