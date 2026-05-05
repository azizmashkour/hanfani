"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { getChaiApiStatusMessage } from "@/lib/chai/chai-api-response";
import type { ChaiSubmitResult } from "@/lib/chai/submit-public-model-card";
import { JsonPreviewBlock } from "./json-syntax-highlight";

type Phase = "preview" | "loading" | "result";

export interface ChaiPublishPayloadModalProps {
  open: boolean;
  onClose: () => void;
  /** Short label, e.g. model slug */
  headline: string;
  /** Full body sent to CHAI (user + organization + model_card) */
  payload: Record<string, unknown>;
  onPublish: () => Promise<ChaiSubmitResult>;
}

export function ChaiPublishPayloadModal({
  open,
  onClose,
  headline,
  payload,
  onPublish,
}: ChaiPublishPayloadModalProps) {
  const id = useId();
  const titleId = `${id}-title`;
  const descId = `${id}-desc`;
  const [phase, setPhase] = useState<Phase>("preview");
  const [submitResult, setSubmitResult] = useState<ChaiSubmitResult | null>(
    null
  );

  useEffect(() => {
    if (!open) return;
    setPhase("preview");
    setSubmitResult(null);
  }, [open]);

  const handleClose = useCallback(() => {
    setPhase("preview");
    setSubmitResult(null);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, handleClose]);

  async function handlePublish() {
    setPhase("loading");
    const result = await onPublish();
    setSubmitResult(result);
    setPhase("result");
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-[2px] dark:bg-black/70"
        onClick={() => {
          if (phase !== "loading") handleClose();
        }}
        disabled={phase === "loading"}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className={
          "relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden " +
          "rounded-2xl border border-stone-200 bg-white shadow-2xl " +
          "dark:border-stone-700 dark:bg-stone-900"
        }
        tabIndex={-1}
      >
        <div className="border-b border-stone-200 px-5 py-4 dark:border-stone-700">
          <h2
            id={titleId}
            className="text-lg font-semibold text-stone-900 dark:text-stone-50"
          >
            Review payload before publish
          </h2>
          <p
            id={descId}
            className="mt-1 text-[14px] text-stone-600 dark:text-stone-400"
          >
            Full JSON body for{" "}
            <span className="font-medium text-stone-800 dark:text-stone-200">
              {headline}
            </span>
            . Nothing is sent until you choose Publish.
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {phase === "preview" || phase === "loading" ? (
            <JsonPreviewBlock value={payload} />
          ) : submitResult ? (
            <div className="space-y-4">
              {(() => {
                const ok = submitResult.ok;
                const statusMessage = getChaiApiStatusMessage(submitResult.data);
                const fallbackDetail =
                  statusMessage ??
                  (!ok ? submitResult.error : undefined);
                return (
                  <div
                    className={
                      ok
                        ? "rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 " +
                          "text-[14px] text-emerald-900 dark:border-emerald-800/60 " +
                          "dark:bg-emerald-950/50 dark:text-emerald-100"
                        : "rounded-xl border border-red-200 bg-red-50 px-4 py-3 " +
                          "text-[14px] text-red-900 dark:border-red-900/50 " +
                          "dark:bg-red-950/40 dark:text-red-100"
                    }
                    role={ok ? "status" : "alert"}
                  >
                    <p className="font-mono text-[15px] font-semibold tabular-nums">
                      HTTP {submitResult.status}
                    </p>
                    {fallbackDetail ? (
                      <p
                        className={
                          "mt-2 whitespace-pre-wrap break-words leading-relaxed " +
                          (ok
                            ? "text-emerald-900 dark:text-emerald-100"
                            : "text-red-900 dark:text-red-100")
                        }
                      >
                        {fallbackDetail}
                      </p>
                    ) : null}
                  </div>
                );
              })()}
              {submitResult.data != null && (
                <div>
                  <p
                    className={
                      "mb-2 text-[12px] font-semibold uppercase tracking-wider " +
                      "text-stone-500 dark:text-stone-500"
                    }
                  >
                    Response body
                  </p>
                  <JsonPreviewBlock value={submitResult.data} />
                </div>
              )}
            </div>
          ) : null}
        </div>

        <div
          className={
            "flex flex-wrap items-center justify-end gap-3 border-t " +
            "border-stone-200 px-5 py-4 dark:border-stone-700"
          }
        >
          {phase === "preview" && (
            <>
              <button
                type="button"
                onClick={handleClose}
                className={
                  "rounded-xl border border-stone-300 px-4 py-2.5 text-[14px] " +
                  "font-medium text-stone-700 transition hover:bg-stone-50 " +
                  "dark:border-stone-600 dark:text-stone-200 dark:hover:bg-stone-800"
                }
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePublish}
                className={
                  "rounded-xl bg-stone-900 px-4 py-2.5 text-[14px] font-semibold " +
                  "text-white transition hover:bg-stone-800 dark:bg-stone-100 " +
                  "dark:text-stone-900 dark:hover:bg-stone-200"
                }
              >
                Publish
              </button>
            </>
          )}
          {phase === "loading" && (
            <>
              <span
                className={
                  "flex items-center gap-2 text-[14px] text-stone-600 dark:text-stone-400"
                }
              >
                <span
                  className={
                    "h-4 w-4 animate-spin rounded-full border-2 border-stone-200 " +
                    "border-t-stone-600 dark:border-stone-600 dark:border-t-stone-300"
                  }
                />
                Publishing…
              </span>
            </>
          )}
          {phase === "result" && (
            <button
              type="button"
              onClick={handleClose}
              className={
                "rounded-xl bg-stone-900 px-4 py-2.5 text-[14px] font-semibold " +
                "text-white transition hover:bg-stone-800 dark:bg-stone-100 " +
                "dark:text-stone-900 dark:hover:bg-stone-200"
              }
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
