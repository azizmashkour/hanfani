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
      color: "bg-zinc-400",
      textColor: "text-zinc-600 dark:text-zinc-400",
      dotColor: "bg-zinc-400 animate-pulse",
    },
  };

  const config = statusConfig[overallStatus];

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
      <main className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="mb-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Hanfani AI Status
        </h1>
        <p className="mb-8 text-zinc-600 dark:text-zinc-400">
          Real-time availability of our services
        </p>

        {/* Overall status */}
        <div className="mb-10 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
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
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* Service list */}
        <div className="space-y-4">
          {services.map((service) => {
            const s = statusConfig[service.status] || statusConfig.checking;
            return (
              <div
                key={service.name}
                className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-50">
                    {service.name}
                  </p>
                  {service.message && (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {service.message}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${s.dotColor}`}
                    aria-hidden
                  />
                  <span className={`text-sm font-medium ${s.textColor}`}>
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
          className="mt-8 cursor-pointer rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {isLoading ? "Checking..." : "Refresh"}
        </button>
      </main>
    </div>
  );
}
