"use client";

import React, { useEffect, useRef, useState } from "react";
import { FulfillmentPlan } from "@/types/fulfillment";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  Clock,
  Layers,
  Sparkles,
} from "lucide-react";

// Bryntum CSS imports
import "@bryntum/scheduler/scheduler.css";
import "@bryntum/scheduler/stockholm-dark.css";
import "@bryntum/scheduler/fontawesome/css/fontawesome.css";
import "@bryntum/scheduler/fontawesome/css/solid.css";

import type { EventModel, ResourceModel } from "@bryntum/scheduler";

interface BryntumSchedulerProps {
  plan: FulfillmentPlan;
  onTaskClick?: (taskId: string) => void;
}

export const BryntumScheduler: React.FC<BryntumSchedulerProps> = ({
  plan,
  onTaskClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const schedulerInstanceRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    async function initScheduler() {
      if (!containerRef.current) return;

      // Clean up previous instance if exists
      if (schedulerInstanceRef.current) {
        try {
          schedulerInstanceRef.current.destroy();
        } catch {
          // ignore
        }
        schedulerInstanceRef.current = null;
      }

      try {
        const { Scheduler } = await import("@bryntum/scheduler");

        if (isCancelled || !containerRef.current) return;

        // Map resources
        const resources = plan.resources.map((r) => ({
          id: r.id,
          name: r.name,
          role: r.role,
          category: r.category,
          eventColor: r.eventColor || "blue",
        }));

        // Map events/tasks
        const events = plan.tasks.map((t) => ({
          id: t.id,
          resourceId: t.resourceId,
          name: t.name,
          startDate: t.startDate,
          endDate: t.endDate,
          duration: t.duration,
          durationUnit: t.durationUnit,
          iconCls: t.iconCls || "b-fa b-fa-tasks",
          eventColor: t.eventColor || "blue",
          cls: t.isMilestone ? "b-milestone-event" : `b-task-${t.type}`,
          isMilestone: Boolean(t.isMilestone),
          progress: t.progress,
        }));

        // Map finish-to-start dependencies
        const dependencies = plan.dependencies.map((d) => ({
          id: d.id,
          from: d.from,
          to: d.to,
          type: d.type ?? 2, // 2 = Finish-to-Start
          cls: "b-dependency-line",
        }));

        const startDate = new Date(plan.createdAt);
        const deadlineDate = new Date(plan.deliveryDeadline);
        // Add 18 hours buffer to the viewport end date so deadline is clearly visible
        const endDate = new Date(deadlineDate.getTime() + 18 * 60 * 60 * 1000);

        const scheduler = new Scheduler({
          appendTo: containerRef.current,
          autoHeight: false,
          rowHeight: 52,
          barMargin: 8,
          resourceMargin: 6,
          startDate,
          endDate,
          viewPreset: {
            base: "dayAndWeek",
            timeResolution: {
              unit: "hour",
              increment: 6,
            },
            headers: [
              {
                unit: "day",
                dateFormat: "ddd MM/DD",
              },
              {
                unit: "hour",
                dateFormat: "HH:mm",
                increment: 12,
              },
            ],
          },
          columns: [
            {
              type: "resourceInfo",
              text: "Operational Station / Resource",
              field: "name",
              width: 240,
              showImage: false,
            },
            {
              text: "Role & Domain",
              field: "role",
              width: 200,
            },
          ],
          resources,
          events,
          dependencies,
          features: {
            dependencies: true,
            eventTooltip: {
              template: (data: { eventRecord: EventModel; resourceRecord?: ResourceModel }) => {
                const task = data.eventRecord;
                const res = data.resourceRecord;
                return `
                  <div class="p-2 space-y-1 text-xs">
                    <div class="font-bold text-sm">${task.name || "Task"}</div>
                    <div>Resource: <strong>${res?.name || String(task.resourceId || "")}</strong></div>
                    <div>Start: ${task.startDate ? new Date(task.startDate).toLocaleString() : ""}</div>
                    <div>End: ${task.endDate ? new Date(task.endDate).toLocaleString() : ""}</div>
                    <div>Progress: ${Number(task.get("progress") ?? 0)}%</div>
                  </div>
                `;
              },
            },
            stripe: true,
            timeRanges: {
              showCurrentTimeLine: false,
              enableResizing: false,
            },
          },
          timeRanges: [
            {
              name: "Negotiated Delivery Deadline",
              startDate: plan.deliveryDeadline,
              duration: 0,
              cls: "b-deadline-line",
            },
          ],
          listeners: {
            eventClick: (event: { eventRecord?: EventModel }) => {
              if (event.eventRecord?.id && onTaskClick) {
                onTaskClick(String(event.eventRecord.id));
              }
            },
          },
        });

        schedulerInstanceRef.current = scheduler;
        setIsReady(true);
      } catch (err) {
        console.error("[Bryntum Scheduler Init Error]:", err);
      }
    }

    initScheduler();

    return () => {
      isCancelled = true;
      if (schedulerInstanceRef.current) {
        try {
          schedulerInstanceRef.current.destroy();
        } catch {
          // ignore
        }
        schedulerInstanceRef.current = null;
      }
    };
  }, [plan, onTaskClick]);

  const handleZoomIn = () => {
    if (schedulerInstanceRef.current) {
      schedulerInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (schedulerInstanceRef.current) {
      schedulerInstanceRef.current.zoomOut();
    }
  };

  const handleZoomToFit = () => {
    if (schedulerInstanceRef.current) {
      schedulerInstanceRef.current.zoomToFit({
        leftMargin: 40,
        rightMargin: 40,
      });
    }
  };

  const handleScrollToStart = () => {
    if (schedulerInstanceRef.current) {
      schedulerInstanceRef.current.scrollToDate(new Date(plan.createdAt), {
        block: "start",
        animate: true,
      });
    }
  };

  return (
    <Card className="border-slate-800 bg-slate-900/90 shadow-2xl overflow-hidden">
      {/* Scheduler Interactive Toolbar */}
      <div className="p-3.5 border-b border-slate-800 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-bold text-white tracking-wide">
            Fulfillment Timeline & Resource Dependencies
          </span>
          <span className="text-xs text-slate-400 hidden sm:inline">
            ({plan.tasks.length} tasks, {plan.dependencies.length} dependencies)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            className="h-8 px-2.5 text-xs text-slate-300 hover:text-white border-slate-700"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5 mr-1" />
            <span>Zoom +</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            className="h-8 px-2.5 text-xs text-slate-300 hover:text-white border-slate-700"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5 mr-1" />
            <span>Zoom -</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomToFit}
            className="h-8 px-2.5 text-xs text-slate-300 hover:text-white border-slate-700"
            title="Fit Timeline to Screen"
          >
            <Maximize2 className="w-3.5 h-3.5 mr-1" />
            <span>Fit All</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleScrollToStart}
            className="h-8 px-2 text-xs text-blue-400 hover:text-blue-300"
            title="Jump to Start"
          >
            <Clock className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Bryntum Container */}
      <div className="relative w-full bg-slate-950/90">
        <div
          ref={containerRef}
          id="payvia-bryntum-container"
          className="w-full h-[480px] text-xs font-sans"
        />

        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm text-slate-400 text-sm gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
            <span>Initializing Bryntum Scheduler Engine...</span>
          </div>
        )}
      </div>

      {/* Bottom Timeline Legend */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-cyan-500"></span>
            <span>Fintech Gateway</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-blue-500"></span>
            <span>Order Processing</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-indigo-500"></span>
            <span>Warehouse Picking</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-purple-500"></span>
            <span>Packaging & QA</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-teal-500"></span>
            <span>Air/Linehaul Transit</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-emerald-500"></span>
            <span>Customer Handover Milestone</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-indigo-400 font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Finish-to-Start Synchronized</span>
        </div>
      </div>
    </Card>
  );
};
