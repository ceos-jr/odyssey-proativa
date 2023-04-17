import { Roles } from "../utils/constants";

export const mockUsers = {
  ADMIN: {
    id: "al814zcy80074hloomogrg1mv",
    role: Roles.Admin,
    name: "Teacher Migol",
    email: "migol@ceos.com",
    image: null,
  },
  MEMBER: {
    id: "bl814zcy80074hloomogrg1mv",
    role: Roles.Member,
    name: "Student Tubias",
    email: "tubias@ceos.com",
    image: null,
  },
  UNAUTHENTICATED: null,
};

export const getMockUser = (role: Roles) => {
  return mockUsers[role];
};
