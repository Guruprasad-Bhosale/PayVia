import React from "react";
import { FulfillmentPlan } from "@/types/fulfillment";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ListChecks, ArrowRight } from "lucide-react";

interface TaskBreakdownTableProps {
  plan: FulfillmentPlan;
}

export const TaskBreakdownTable: React.FC<TaskBreakdownTableProps> = ({ plan }) => {
  return (
    <Card className="border-border bg-white shadow-sm overflow-hidden">
      <CardHeader className="p-4 border-b border-border bg-slate-50/70 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <ListChecks className="w-4 h-4 text-payvia-blue" />
          <CardTitle className="text-base font-bold text-foreground">
            Operational Stage Breakdown & Dependencies
          </CardTitle>
        </div>
        <span className="text-xs text-muted-foreground">
          Total Duration: <strong className="text-foreground">{plan.totalDurationDays} days</strong> /{" "}
          <span className="text-payvia-success font-semibold">{plan.negotiatedDeliveryDays}d target</span>
        </span>
      </CardHeader>

      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-muted-foreground uppercase tracking-wider text-[10px] border-b border-border">
            <tr>
              <th className="py-3 px-4">#</th>
              <th className="py-3 px-4">Stage Name</th>
              <th className="py-3 px-4">Assigned Resource</th>
              <th className="py-3 px-4">Scheduled Window</th>
              <th className="py-3 px-4">Duration</th>
              <th className="py-3 px-4">Dependencies</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {plan.tasks.map((task, idx) => {
              const startDate = new Date(task.startDate);
              const endDate = new Date(task.endDate);

              const formattedWindow = `${startDate.toLocaleDateString("en-US", {
                month: "numeric",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })} ➔ ${endDate.toLocaleDateString("en-US", {
                month: "numeric",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}`;

              return (
                <tr
                  key={task.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="py-3.5 px-4 font-mono text-muted-foreground font-bold">
                    0{idx + 1}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-foreground">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          task.status === "completed"
                            ? "bg-payvia-success"
                            : task.status === "in_progress"
                            ? "bg-payvia-blue animate-ping"
                            : "bg-slate-300"
                        }`}
                      ></span>
                      <span>{task.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-foreground">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-border font-mono text-[11px]">
                      {task.resourceName}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-muted-foreground font-mono text-[11px]">
                    {formattedWindow}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-foreground">
                    {task.duration === 0 ? "Milestone" : `${task.duration} d`}
                  </td>
                  <td className="py-3.5 px-4 text-muted-foreground">
                    {task.dependencies.length > 0 ? (
                      <div className="flex items-center gap-1 text-[11px] text-payvia-blue font-medium">
                        <ArrowRight className="w-3 h-3" />
                        <span>Predecessor (FS)</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground italic">None (Root)</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    {task.status === "completed" ? (
                      <Badge variant="success" className="text-[10px] py-0.5 px-2 font-semibold">
                        ✓ Complete
                      </Badge>
                    ) : task.status === "in_progress" ? (
                      <Badge variant="secondary" className="text-[10px] py-0.5 px-2 font-semibold text-payvia-navy bg-blue-50 border-blue-200">
                        ● In Progress ({task.progress}%)
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] py-0.5 px-2 text-muted-foreground">
                        Pending
                      </Badge>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
};
