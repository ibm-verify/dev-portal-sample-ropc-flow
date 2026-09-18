/**
 * E2E test for the ROPC (Resource Owner Password Credentials) flow.
 *
 * Strategy
 * --------
 * The ROPC sample is a CLI app (server.js) that:
 *   1. Reads Username + Password synchronously from stdin via readline-sync
 *   2. Performs OIDC discovery against TENANT_URL
 *   3. Exchanges credentials for tokens using grant_type=password
 *   4. Calls the userinfo endpoint
 *   5. Prints "Successfully retrieved user information" + a table of claims
 *   6. Exits
 *
 * This test spawns the app inside Docker with stdin piped, writes the
 * credentials, and asserts the expected success output.
 *
 * Secrets are never printed in logs.
 */

import { spawn } from "child_process";
import * as assert from "assert";

// ---------------------------------------------------------------------------
// Configuration — all sourced from environment variables
// ---------------------------------------------------------------------------
const DOCKER_IMAGE = process.env.DOCKER_IMAGE ?? "ropc-sample:e2e";
const TENANT_URL = mustEnv("TENANT_URL");
const CLIENT_ID = mustEnv("CLIENT_ID");
const CLIENT_SECRET = mustEnv("CLIENT_SECRET");
const SCOPE = process.env.SCOPE ?? "openid";
const TEST_USERNAME = mustEnv("TEST_USERNAME");
const TEST_PASSWORD = mustEnv("TEST_PASSWORD");

const TIMEOUT_MS = 60_000; // 60 s for the full ROPC exchange

function mustEnv(name: string): string {
  const val = process.env[name];
  if (!val) {
    throw new Error(`Required environment variable ${name} is not set`);
  }
  return val;
}

// ---------------------------------------------------------------------------
// Helper: sanitise output for safe logging (never log tokens/passwords)
// ---------------------------------------------------------------------------
function sanitise(text: string): string {
  return text
    .replace(/password[^\n]*/gi, "password: [REDACTED]")
    .replace(/"access_token"\s*:\s*"[^"]+"/gi, '"access_token": "[REDACTED]"')
    .replace(/"id_token"\s*:\s*"[^"]+"/gi, '"id_token": "[REDACTED]"')
    .replace(/"refresh_token"\s*:\s*"[^"]+"/gi, '"refresh_token": "[REDACTED]"');
}

// ---------------------------------------------------------------------------
// Main test
// ---------------------------------------------------------------------------
async function runROPCFlowTest(): Promise<void> {
  console.log("\n=== ROPC E2E Test ===");
  console.log(`Image : ${DOCKER_IMAGE}`);
  console.log(`Tenant: ${TENANT_URL}`);
  console.log(`Scope : ${SCOPE}`);

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      proc.kill("SIGKILL");
      reject(
        new Error(
          `Timeout: ROPC flow did not complete within ${TIMEOUT_MS / 1000}s`
        )
      );
    }, TIMEOUT_MS);

    // Run the containerised app with credentials injected as env vars.
    // server.js reads TEST_USERNAME / TEST_PASSWORD directly when set,
    // bypassing readline-sync's /dev/tty requirement entirely.
    // --rm : auto-remove after exit
    const proc = spawn(
      "docker",
      [
        "run",
        "--rm",
        "-e", `TENANT_URL=${TENANT_URL}`,
        "-e", `CLIENT_ID=${CLIENT_ID}`,
        "-e", `CLIENT_SECRET=${CLIENT_SECRET}`,
        "-e", `SCOPE=${SCOPE}`,
        "-e", `TEST_USERNAME=${TEST_USERNAME}`,
        "-e", `TEST_PASSWORD=${TEST_PASSWORD}`,
        DOCKER_IMAGE,
      ],
      {
        stdio: ["ignore", "pipe", "pipe"],
      }
    );

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });

    proc.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    proc.on("error", (err) => {
      clearTimeout(timer);
      reject(new Error(`Failed to start docker process: ${err.message}`));
    });

    proc.on("close", (code) => {
      clearTimeout(timer);

      // Always log sanitised output for debugging
      console.log("\n--- stdout (sanitised) ---");
      console.log(sanitise(stdout));
      if (stderr.trim()) {
        console.log("--- stderr (sanitised) ---");
        console.log(sanitise(stderr));
      }

      try {
        // 1. Process must exit 0
        assert.strictEqual(
          code,
          0,
          `Process exited with code ${code}. Check stderr above.`
        );

        // 2. Must confirm successful user info retrieval
        assert.ok(
          stdout.includes("Successfully retrieved user information"),
          `Expected "Successfully retrieved user information" in stdout.\nSanitised output:\n${sanitise(stdout)}`
        );

        // 3. Must NOT have printed an error description (token exchange failure)
        assert.ok(
          !stdout.includes("Error description:"),
          `Token exchange failed. Sanitised stdout:\n${sanitise(stdout)}`
        );

        // 4. Assert userinfo fields returned by IBM Verify are present in table output
        const expectedFields = [
          "sub",
          "preferred_username",
          "name",
          "displayName",
          "realmName",
          "uniqueSecurityName",
          "userType",
          "auth_time",
          "amr",
        ];
        for (const field of expectedFields) {
          assert.ok(
            stdout.includes(field),
            `Expected userinfo field "${field}" in stdout.\nSanitised output:\n${sanitise(stdout)}`
          );
        }

        console.log("\n✓ ROPC flow completed successfully");
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  });
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------
(async () => {
  try {
    await runROPCFlowTest();
    process.exit(0);
  } catch (err) {
    console.error("\n✗ ROPC E2E test FAILED:", (err as Error).message);
    process.exit(1);
  }
})();
