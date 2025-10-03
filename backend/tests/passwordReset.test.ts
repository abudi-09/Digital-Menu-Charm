import assert from "node:assert";
import { Types } from "mongoose";
import {
  initiatePasswordReset,
  verifyEmailForReset,
} from "../src/services/passwordResetService";
import { Admin } from "../src/models/Admin";
import { PasswordResetSession } from "../src/models/PasswordResetSession";
import * as notificationService from "../src/services/notificationService";
import { hashToken } from "../src/utils/security";

type CleanupFn = () => void | Promise<void>;

type AdminStub = {
  _id: Types.ObjectId;
  id: string;
  email: string;
  phoneNumber: string;
  fullName?: string;
};

const stubAdminFindOne = (admin: AdminStub | null): CleanupFn => {
  const adminModel = Admin as unknown as {
    findOne: (...args: unknown[]) => { exec: () => Promise<AdminStub | null> };
  };
  const originalFindOne = adminModel.findOne;
  adminModel.findOne = () => ({
    exec: async () => admin,
  });
  return () => {
    adminModel.findOne = originalFindOne;
  };
};

const stubAdminFind = (admins: AdminStub[] | null): CleanupFn => {
  const adminModel = Admin as unknown as {
    find: (...args: unknown[]) => { exec: () => Promise<AdminStub[] | null> };
  };
  const originalFind = adminModel.find;
  adminModel.find = () => ({ exec: async () => admins ?? [] });
  return () => {
    adminModel.find = originalFind;
  };
};

const stubPasswordResetCreate = (
  sessionId: string
): {
  cleanup: CleanupFn;
  calls: Array<Record<string, unknown>>;
} => {
  const model = PasswordResetSession as unknown as {
    create: (
      ...args: unknown[]
    ) => Promise<{ id: string; save: () => Promise<void> }>;
  };
  const originalCreate = model.create;
  const calls: Array<Record<string, unknown>> = [];
  model.create = async (payload: { [key: string]: unknown }) => {
    calls.push(payload);
    return {
      ...payload,
      id: sessionId,
      save: async () => undefined,
    } as { id: string; save: () => Promise<void> };
  };
  return {
    cleanup: () => {
      model.create = originalCreate;
    },
    calls,
  };
};

const stubSendEmail = () => {
  const service = notificationService as unknown as {
    sendEmail: (options: unknown) => Promise<void>;
    isSmsServiceConfigured: () => boolean;
  };
  const originalSendEmail = service.sendEmail;
  const calls: unknown[] = [];
  service.sendEmail = async (options: unknown) => {
    calls.push(options);
  };
  return {
    cleanup: () => {
      service.sendEmail = originalSendEmail;
    },
    calls,
  };
};

const stubSmsConfigured = (value: boolean): CleanupFn => {
  const service = notificationService as unknown as {
    isSmsServiceConfigured: () => boolean;
  };
  const original = service.isSmsServiceConfigured;
  service.isSmsServiceConfigured = () => value;
  return () => {
    service.isSmsServiceConfigured = original;
  };
};

export const runPasswordResetTests = async () => {
  const adminId = new Types.ObjectId();
  const adminStub: AdminStub = {
    _id: adminId,
    id: adminId.toString(),
    email: "owner@example.com",
    phoneNumber: "+1 555-123-4567",
    fullName: "Owner",
  };

  // Happy path: matching email and phone number should create a session and send email
  {
    const cleanupFns: CleanupFn[] = [];
    cleanupFns.push(stubAdminFindOne(adminStub));
    const createStub = stubPasswordResetCreate("session-123");
    cleanupFns.push(createStub.cleanup);
    const emailStub = stubSendEmail();
    cleanupFns.push(emailStub.cleanup);

    try {
      const result = await initiatePasswordReset("email", "owner@example.com");

      assert.strictEqual(result.sessionId, "session-123");
      assert.strictEqual(result.maskedEmail.includes("***"), true);
      assert.strictEqual(createStub.calls.length, 1);
      assert.strictEqual(emailStub.calls.length, 1);
      const sessionPayload = createStub.calls[0];
      const adminIdFromPayload = sessionPayload.adminId as Types.ObjectId;
      assert.strictEqual(adminIdFromPayload.toString(), adminId.toString());
    } finally {
      await Promise.all(cleanupFns.map((fn) => fn()));
    }
  }

  // Unknown email should throw
  {
    const cleanupFns: CleanupFn[] = [];
    cleanupFns.push(stubAdminFindOne(null));
    const emailStub = stubSendEmail();
    cleanupFns.push(emailStub.cleanup);

    try {
      await assert.rejects(
        initiatePasswordReset("email", "nope@example.com"),
        (error: unknown) =>
          error instanceof Error &&
          error.message.includes("provided email was not found")
      );
      assert.strictEqual(emailStub.calls.length, 0);
    } finally {
      await Promise.all(cleanupFns.map((fn) => fn()));
    }
  }

  // Mismatched phone number should throw
  {
    const cleanupFns: CleanupFn[] = [];
    cleanupFns.push(stubAdminFindOne(adminStub));
    const emailStub = stubSendEmail();
    cleanupFns.push(emailStub.cleanup);
    cleanupFns.push(stubSmsConfigured(true));

    try {
      // stub Admin.find to return the known admin list and then try unknown phone
      cleanupFns.push(stubAdminFind([adminStub]));
      try {
        await assert.rejects(
          initiatePasswordReset("phone", "+1 000-000-0000"),
          (error: unknown) =>
            error instanceof Error &&
            error.message.includes("phone number was not found")
        );
      } finally {
        await Promise.all(cleanupFns.map((fn) => fn()));
      }
      assert.strictEqual(emailStub.calls.length, 0);
    } finally {
      await Promise.all(cleanupFns.map((fn) => fn()));
    }
  }

  // Basic email verification path (no SMS configured)
  {
    const cleanupFns: CleanupFn[] = [];
    const adminId2 = new Types.ObjectId();
    const adminStub2: AdminStub = {
      _id: adminId2,
      id: adminId2.toString(),
      email: "admin2@example.com",
      phoneNumber: "+1 555-000-1111",
      fullName: "Owner2",
    };
    // create session stub
    const token = "tok123";
    const sessionId = new Types.ObjectId();
    const session: any = {
      _id: sessionId,
      id: sessionId.toString(),
      adminId: adminId2,
      emailTokenHash: hashToken(token),
      emailTokenExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
      emailVerified: false,
      smsVerified: false,
      status: "pending",
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      save: async () => undefined,
    };

    // Stubs
    const adminModel = Admin as any;
    const originalFindById = adminModel.findById;
    adminModel.findById = () => ({ exec: async () => adminStub2 });
    cleanupFns.push(() => (adminModel.findById = originalFindById));

    const sessionModel = PasswordResetSession as any;
    const originalFindByIdSession = sessionModel.findById;
    sessionModel.findById = () => ({ exec: async () => session });
    cleanupFns.push(() => (sessionModel.findById = originalFindByIdSession));

    const notif = notificationService as any;
    const originalSmsConfigured = notif.isSmsServiceConfigured;
    notif.isSmsServiceConfigured = () => false;
    cleanupFns.push(
      () => (notif.isSmsServiceConfigured = originalSmsConfigured)
    );

    try {
      const result = await verifyEmailForReset(session.id, token);
      assert.strictEqual(
        result.smsRequired,
        false,
        "SMS not required when disabled"
      );
      assert.strictEqual(session.emailVerified, true);
      assert.strictEqual(session.smsVerified, true);
      assert.strictEqual(session.status, "sms-verified");
    } finally {
      await Promise.all(cleanupFns.map((fn) => fn()));
    }
  }
  console.info("Password reset service tests passed ✅");
};
