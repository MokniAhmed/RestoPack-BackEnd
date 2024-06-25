import get from "crud/get";
import list from "crud/list";
import User from "models/user.model";
import { Role } from "models/user.model";
import { userType } from "types/user.type";

export default {
  getUsers: list(User, userType, { authorizationRoles: [] }),
  getUserById: get(User, userType, { authorizationRoles: [] }),
};
