import assert from "node:assert";
import {
  generateNumericCode,
  generateRandomToken,
  hashToken,
  validatePasswordStrength,
} from "../src/utils/security";
import { runPasswordResetTests } from "./passwordReset.test";

const runSecurityTests = () => {
  const strongPasswords = ["Admin@2024!", "Secure#Pass123", "MyHotelRoom$42"];

  strongPasswords.forEach((password) => {
    assert.strictEqual(
      validatePasswordStrength(password),
      true,
      `Expected strong password to pass validation: ${password}`
    );
  });

  const weakPasswords = [
    "short",
    "alllowercase1",
    "ALLUPPERCASE1",
    "NOLOWERCASE!",
    "nonumberorsymbol",
  ];

  weakPasswords.forEach((password) => {
    assert.strictEqual(
      validatePasswordStrength(password),
      false,
      `Expected weak password to fail validation: ${password}`
    );
  });

  const token = generateRandomToken();
  const hashed = hashToken(token);
  assert.strictEqual(hashed.length, 64, "Hashed token should be 64 hex chars");

  const code = generateNumericCode(6);
  assert.strictEqual(code.length, 6, "Verification code must be six digits");
  assert.match(code, /^\d{6}$/u, "Verification code must contain only digits");
};

const runAllTests = async () => {
  runSecurityTests();
  console.info("Security utilities tests passed ✅");
  await runPasswordResetTests();
};

runAllTests()
  .then(() => {
    console.info("All backend tests passed ✅");
  })
  .catch((error) => {
    console.error("Backend tests failed ❌", error);
    process.exit(1);
  });
