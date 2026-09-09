import {describe,expect,it} from "vitest";
import {validatePassword} from "./auth-form";

describe("account form",()=>{
  it("requires an eight-character password for a new account",()=>{
    expect(validatePassword("create-account","short")).toBe("Use at least 8 characters.");
    expect(validatePassword("create-account","long-enough")).toBe("");
  });

  it("allows an existing account to use its current password policy",()=>{
    expect(validatePassword("sign-in","legacy")).toBe("");
  });
});
