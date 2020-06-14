// The way the user is returned from TU Delft Single Sign On
// Some fields are optional depending on whether the user is student/employee
export interface SSOUser {
  netid: string;
  studentNumber?: number;
  firstName: string;
  prefix?: string;
  lastName: string;
  email: string;
  affiliation: string | string[];
  displayName: string;
  study?: string | string[];
  organisationUnit?: string | string[];
}
