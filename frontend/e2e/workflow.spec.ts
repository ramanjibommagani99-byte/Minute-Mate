import { expect, test } from "@playwright/test";

const meetingId = "00000000-0000-4000-8000-000000000101";
const taskId = "00000000-0000-4000-8000-000000000202";
const source = "[00:12] Maya will send the launch guide by November 24, 2026.";
const apiRoutePattern = /^http:\/\/(?:localhost|127\.0\.0\.1):(?!3000)\d+\/(?:auth|meetings|tasks|reminders)(?:\/|\?|$)/;
function corsHeaders(route: import("@playwright/test").Route) {
  const requestHeaders = route.request().headers();
  return {
    "access-control-allow-origin": requestHeaders.origin ?? "http://127.0.0.1:3000",
    "access-control-allow-credentials": "true",
    "access-control-allow-methods": requestHeaders["access-control-request-method"] ?? "GET, POST, PATCH, OPTIONS",
    "access-control-allow-headers": requestHeaders["access-control-request-headers"] ?? "content-type, authorization",
    vary: "Origin",
  };
}
function fulfillJson(route: import("@playwright/test").Route, status: number, json: unknown) {
  return route.fulfill({ status, headers: corsHeaders(route), contentType: "application/json", body: JSON.stringify(json) });
}
const task = {
  id: taskId,
  title: "Send the launch guide",
  description: null,
  assignee_name: "Maya",
  due_date: "2026-11-24",
  due_date_original: "November 24, 2026",
  status: "not_started",
  approval_status: "pending",
  confidence_score: 0.91,
  evidence: [{ id: "evidence-1", quote_text: source.replace("[00:12] ", ""), timestamp_seconds: 12, match_score: 1 }],
  trust: { evidence_valid: true, timestamp_valid: true, date_valid: true, confidence_valid: true, ready_for_approval: true, warnings: [] },
};

test.beforeEach(async ({ context }) => {
  // The test backend is mocked; the cookie only bypasses the frontend route guard.
  await context.addCookies([{ name: "minutemate_access_token", value: "playwright-test-session", url: "http://127.0.0.1:3000", httpOnly: true }]);
});

test("captures a meeting, requires approval, and lists its task on the filtered dashboard", async ({ page }) => {
  test.setTimeout(180_000);
  let approval = "pending";
  const receivedMeetings: Array<Record<string, unknown>> = [];
  await page.route(apiRoutePattern, async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (request.method() === "OPTIONS") return route.fulfill({ status: 204, headers: corsHeaders(route) });
    if (request.method() === "GET" && url.pathname === "/reminders") return fulfillJson(route, 200, []);
    if (request.method() === "POST" && url.pathname === "/meetings") {
      receivedMeetings.push(request.postDataJSON() as Record<string, unknown>);
      return fulfillJson(route, 201, { id: meetingId, title: "Launch planning", project_name: "Website", meeting_date: null, source_type: "transcript", source_text: source, created_at: "2026-11-19T09:00:00Z", updated_at: "2026-11-19T09:00:00Z" });
    }
    if (request.method() === "GET" && url.pathname === `/meetings/${meetingId}`) {
      return fulfillJson(route, 200, { id: meetingId, title: "Launch planning", meeting_date: null, source_type: "transcript", source_text: source, created_at: "2026-11-19T09:00:00Z" });
    }
    if (request.method() === "POST" && url.pathname === `/meetings/${meetingId}/extract`) {
      return fulfillJson(route, 200, { meeting_id: meetingId, meeting_title: "Launch planning", summary: "Maya owns the launch guide.", tasks: [{ ...task, meeting_id: meetingId }], decisions: [], risks: [], open_questions: [] });
    }
    if (request.method() === "GET" && url.pathname === `/meetings/${meetingId}/extraction`) return fulfillJson(route, 200, { meeting_id: meetingId, meeting_title: "Launch planning", summary: "Maya owns the launch guide.", tasks: [{ ...task, approval_status: approval }], decisions: [], risks: [], open_questions: [] });
    if (request.method() === "POST" && url.pathname === `/tasks/${taskId}/decision`) {
      const body = request.postDataJSON() as { action: string };
      approval = body.action === "approve" ? "approved" : body.action === "reject" ? "rejected" : "needs_review";
      return fulfillJson(route, 200, { ...task, approval_status: approval });
    }
    if (request.method() === "GET" && url.pathname === "/tasks") {
      const matches = (!url.searchParams.get("assignee_name") || "Maya".toLowerCase().includes(url.searchParams.get("assignee_name")!.toLowerCase()))
        && (!url.searchParams.get("project_name") || "Website".toLowerCase().includes(url.searchParams.get("project_name")!.toLowerCase()))
        && (!url.searchParams.get("due_date_from") || task.due_date >= url.searchParams.get("due_date_from")!)
        && (!url.searchParams.get("due_date_to") || task.due_date <= url.searchParams.get("due_date_to")!);
      return fulfillJson(route, 200, approval === "approved" && matches ? [{ ...task, approval_status: approval, meeting_id: meetingId, meeting_title: "Launch planning", project_name: "Website", meeting_date: null }] : []);
    }
    return fulfillJson(route, 404, { detail: `Unexpected test request ${request.method()} ${url.pathname}` });
  });

  await page.goto("/meetings/new", { waitUntil: "load", timeout: 120_000 });
  await page.getByLabel("Meeting title").fill("Launch planning");
  await page.getByLabel("Project").fill("Website");
  await page.getByLabel("Transcript or notes").fill(source);
  const meetingSaved = page.waitForResponse((response) => response.url().endsWith("/meetings") && response.request().method() === "POST");
  await page.getByRole("button", { name: "Save meeting source" }).click();
  expect((await meetingSaved).status()).toBe(201);
  expect(receivedMeetings[0]?.project_name).toBe("Website");
  await page.goto(`/meetings/${meetingId}`, { waitUntil: "load", timeout: 120_000 });
  await expect(page.getByText(source)).toBeVisible();
  const extractionSaved = page.waitForResponse((response) => response.url().endsWith(`/meetings/${meetingId}/extract`) && response.request().method() === "POST");
  await page.getByRole("button", { name: "Extract meeting insights" }).click();
  expect((await extractionSaved).status()).toBe(200);
  await page.goto(`/review/${meetingId}`, { waitUntil: "load", timeout: 120_000 });
  await expect(page.getByRole("heading", { name: "Send the launch guide" })).toBeVisible();
  await page.getByRole("button", { name: "Approve" }).click();
  await expect(page.getByText("approved", { exact: true }).first()).toBeVisible();

  await page.goto("/dashboard", { waitUntil: "load", timeout: 120_000 });
  await page.getByLabel("Filter by owner").fill("Maya");
  await page.getByLabel("Filter by project").fill("Website");
  await page.getByLabel("Due date from").fill("2026-11-20");
  await page.getByLabel("Due date through").fill("2026-11-30");
  await expect(page.getByRole("heading", { name: "Send the launch guide" })).toBeVisible();
});

test("home navigation reaches meeting input and separate task views", async ({ page }) => {
  await page.route(apiRoutePattern, (route) => route.request().method() === "OPTIONS"
    ? route.fulfill({ status: 204, headers: corsHeaders(route) })
    : fulfillJson(route, 200, []));
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const startMeeting = page.getByRole("link", { name: "Start a meeting" });
  await expect(startMeeting).toHaveAttribute("href", "/meetings/new");
  await startMeeting.click();
  await page.waitForURL("**/meetings/new");
  await expect(page.getByRole("heading", { name: "Start with the source." })).toBeVisible();
  await page.goto("/dashboard?view=review", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Review and follow through" })).toBeVisible();
  await expect(page.getByLabel("Approval state")).toHaveValue("review");
  await expect(page.getByRole("button", { name: /Review queue/ })).toHaveAttribute("aria-pressed", "true");
  await page.goto("/dashboard?view=follow-through", { waitUntil: "domcontentloaded" });
  await expect(page.getByLabel("Approval state")).toHaveValue("approved");
  await expect(page.getByRole("button", { name: /Follow through/ })).toHaveAttribute("aria-pressed", "true");
});

test("guided sample reviews and tracks data without API requests", async ({ page }) => {
  const apiRequests: string[] = [];
  page.on("request", (request) => { if (apiRoutePattern.test(request.url())) apiRequests.push(request.url()); });
  await page.goto("/demo", { waitUntil: "load", timeout: 120_000 });
  await expect(page.getByRole("heading", { name: /From conversation/ })).toBeVisible();
  await page.getByRole("button", { name: /Extract sample insights/ }).click();
  await expect(page.getByRole("heading", { name: "Proposed work" })).toBeVisible();
  await page.getByRole("button", { name: "Approve", exact: true }).first().click();
  await page.getByRole("button", { name: "Continue with 1 approved" }).click();
  await expect(page.getByRole("heading", { name: "Approved commitments" })).toBeVisible();
  await page.getByLabel("Progress status").selectOption("in_progress");
  expect(apiRequests).toEqual([]);
});
