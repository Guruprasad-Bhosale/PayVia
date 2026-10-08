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
    <Card className="border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden">
      <CardHeader className="p-4 border-b border-slate-800 bg-slate-950/60 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <ListChecks className="w-4 h-4 text-blue-400" />
          <CardTitle className="text-base font-bold text-white">
            Operational Stage Breakdown & Dependencies
          </CardTitle>
        </div>
        <span className="text-xs text-slate-400">
          Total Duration: <strong className="text-white">{plan.totalDurationDays} days</strong> /{" "}
          <span className="text-emerald-400">{plan.negotiatedDeliveryDays}d target</span>
        </span>
      </CardHeader>

      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
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
          <tbody className="divide-y divide-slate-800/80">
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
                  className="hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3.5 px-4 font-mono text-slate-500 font-bold">
                    0{idx + 1}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-white">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          task.status === "completed"
                            ? "bg-emerald-400"
                            : task.status === "in_progress"
                            ? "bg-blue-400 animate-ping"
                            : "bg-slate-600"
                        }`}
                      ></span>
                      <span>{task.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">
                    <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 font-mono text-[11px]">
                      {task.resourceName}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                    {formattedWindow}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-200">
                    {task.duration === 0 ? "Milestone" : `${task.duration} d`}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {task.dependencies.length > 0 ? (
                      <div className="flex items-center gap-1 text-[11px] text-blue-400">
                        <ArrowRight className="w-3 h-3" />
                        <span>Predecessor (FS)</span>
                      </div>
                    ) : (
                      <span className="text-slate-500 italic">None (Root)</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    {task.status === "completed" ? (
                      <Badge variant="success" className="text-[10px] py-0.5 px-2">
                        ✓ Complete
                      </Badge>
                    ) : task.status === "in_progress" ? (
                      <Badge variant="info" className="text-[10px] py-0.5 px-2">
                        ● In Progress ({task.progress}%)
                      </Badge>
                    ) : (
                      <Badge variant="default" className="text-[10px] py-0.5 px-2 text-slate-400 border-slate-700">
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
