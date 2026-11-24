import { describe, expect, it } from "vitest";
import { taskFilterParams } from "@/lib/task-filters";

describe("dashboard task filters", () => {
  it("omits default filters and trims owner and project values", () => {
    const params = taskFilterParams({ approval: "active", status: "all", owner: "  Maya  ", project: " Launch ", dueFrom: "", dueTo: "" });
    expect(params.toString()).toBe("assignee_name=Maya&project_name=Launch");
  });

  it("serializes each selected filter including inclusive deadline bounds", () => {
    const params = taskFilterParams({ approval: "approved", status: "completed", owner: "Li", project: "Mobile", dueFrom: "2026-11-20", dueTo: "2026-11-30" });
    expect(Object.fromEntries(params)).toEqual({
      approval_status: "approved",
      task_status: "completed",
      assignee_name: "Li",
      project_name: "Mobile",
      due_date_from: "2026-11-20",
      due_date_to: "2026-11-30",
    });
  });
});
