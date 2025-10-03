import bcrypt from "bcrypt";
import { Admin } from "../models/Admin";
import { signAdminToken } from "../utils/jwt";

class InvalidCredentialsError extends Error {
  constructor() {
    super("Invalid email or password");
    this.name = "InvalidCredentialsError";
  }
}

export const loginAdmin = async (email: string, password: string) => {
  const admin = await Admin.findOne({ email }).select("+password role").exec();

  if (!admin) {
    throw new InvalidCredentialsError();
  }

  const isPasswordValid = await bcrypt.compare(password, admin.password);

  if (!isPasswordValid) {
    throw new InvalidCredentialsError();
  }

  const token = signAdminToken({
    adminId: admin.id,
    role: admin.role,
  });

  return {
    token,
    admin: {
      id: admin.id,
      fullName: admin.fullName,
      email: admin.email,
      phoneNumber: admin.phoneNumber,
      role: admin.role,
      emailVerified: admin.emailVerified,
      phoneVerified: admin.phoneVerified,
    },
  };
};

export { InvalidCredentialsError };
