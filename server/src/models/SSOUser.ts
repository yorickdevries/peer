// The way the user is returned from TU Delft Single Sign On
export interface SSOUser {
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
