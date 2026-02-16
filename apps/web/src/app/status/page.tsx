"use client";

import { useEffect, useState } from "react";

type ServiceStatus = "operational" | "degraded" | "outage" | "checking";

interface ServiceCheck {
  name: string;
  status: ServiceStatus;
  message?: string;
  lastChecked?: string;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

export default function StatusPage() {
  const [services, setServices] = useState<ServiceCheck[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkServices = async () => {
    setIsLoading(true);
    const checks: ServiceCheck[] = [];

    // Web app is operational if this page loaded
    checks.push({
      name: "Web App",
      status: "operational",
      message: "Serving requests",
      lastChecked: new Date().toISOString(),
    });

    // Check API
    try {
      const res = await fetch(`${API_URL}/status`, {
        signal: AbortSignal.timeout(5000),
      });
      const data = await res.json();
      checks.push({
        name: "API",
        status: res.ok && data?.status === "operational" ? "operational" : "degraded",
        message: data?.status || `HTTP ${res.status}`,
        lastChecked: new Date().toISOString(),
      });
    } catch (err) {
      checks.push({
        name: "API",
        status: "outage",
        message: err instanceof Error ? err.message : "Unreachable",
        lastChecked: new Date().toISOString(),
      });
    }

    setServices(checks);
    setLastUpdated(new Date());
    setIsLoading(false);
  };

  useEffect(() => {
    checkServices();
    const interval = setInterval(checkServices, 60_000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const overallStatus: ServiceStatus = services.length === 0
    ? "checking"
    : services.some((s) => s.status === "outage")
      ? "outage"
      : services.some((s) => s.status === "degraded")
        ? "degraded"
        : "operational";

  const statusConfig = {
    operational: {
      label: "Operational",
      color: "bg-emerald-500",
      textColor: "text-emerald-600 dark:text-emerald-400",
      dotColor: "bg-emerald-500",
    },
    degraded: {
      label: "Degraded",
      color: "bg-amber-500",
      textColor: "text-amber-600 dark:text-amber-400",
      dotColor: "bg-amber-500",
    },
    outage: {
      label: "Outage",
      color: "bg-red-500",
      textColor: "text-red-600 dark:text-red-400",
      dotColor: "bg-red-500",
    },
    checking: {
      label: "Checking...",
      color: "bg-stone-400",
      textColor: "text-stone-600 dark:text-stone-400",
      dotColor: "bg-stone-400 animate-pulse",
    },
  };

  const config = statusConfig[overallStatus];

  return (
    <div className="min-h-screen bg-stone-50 font-sans dark:bg-stone-950">
      <main className="mx-auto max-w-2xl px-8 py-16">
        <h1 className="mb-2 text-[28px] font-semibold tracking-tight text-stone-900 dark:text-stone-50">
          Hanfani AI Status
        </h1>
        <p className="mb-10 text-[15px] text-stone-600 dark:text-stone-400">
          Real-time availability of our services
        </p>

        {/* Overall status */}
        <div className="mb-12 rounded-2xl bg-white p-6 shadow-sm dark:bg-stone-900 dark:shadow-stone-950/50">
          <div className="flex items-center gap-3">
            <span
              className={`h-3 w-3 rounded-full ${config.dotColor}`}
              aria-hidden
            />
            <span className={`font-medium ${config.textColor}`}>
              {isLoading ? "Checking..." : config.label}
            </span>
          </div>
          {lastUpdated && !isLoading && (
            <p className="mt-2 text-[14px] text-stone-500 dark:text-stone-400">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* Service list */}
        <div className="space-y-3">
          {services.map((service) => {
            const s = statusConfig[service.status] || statusConfig.checking;
            return (
              <div
                key={service.name}
                className="flex items-center justify-between rounded-2xl bg-white px-6 py-4 shadow-sm dark:bg-stone-900 dark:shadow-stone-950/50"
              >
                <div>
                  <p className="font-medium text-stone-900 dark:text-stone-50">
                    {service.name}
                  </p>
                  {service.message && (
                    <p className="text-[14px] text-stone-500 dark:text-stone-400">
                      {service.message}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${s.dotColor}`}
                    aria-hidden
                  />
                  <span className={`text-[14px] font-medium ${s.textColor}`}>
                    {s.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={checkServices}
          disabled={isLoading}
          className="mt-10 cursor-pointer rounded-xl bg-stone-900 px-5 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200"
        >
          {isLoading ? "Checking..." : "Refresh"}
        </button>
      </main>
    </div>
  );
}
