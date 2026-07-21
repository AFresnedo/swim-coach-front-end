"use client";

import { useState } from "react";
import CreateSwimTimeForm from "@/app/swim-log/_components/CreateSwimTimeForm";
import DateAndFilterControls from "@/app/swim-log/_components/DateAndFilterControls";
import SwimTimesTable from "@/app/swim-log/_components/SwimTimesTable";
import { useSwimTimesQuery } from "@/app/swim-log/_hooks/use-swim-times-query";
import { cardClass } from "@/lib/form-styles";

function todayLocalDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function SwimLog() {
  const [selectedDate, setSelectedDate] = useState(todayLocalDate);

  const { results, filters, getViewGeneration, insertIfCurrentView } =
    useSwimTimesQuery(selectedDate);

  return (
    <div className="flex flex-col gap-8">
      <DateAndFilterControls
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        filters={filters}
      />

      <details className={`group ${cardClass}`}>
        <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-slate-900 dark:text-slate-50 [&::-webkit-details-marker]:hidden">
          Log a swim time
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="size-5 text-slate-400 transition-transform group-open:rotate-180"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </summary>
        <div className="mt-4">
          <CreateSwimTimeForm
            selectedDate={selectedDate}
            getViewGeneration={getViewGeneration}
            insertIfCurrentView={insertIfCurrentView}
          />
        </div>
      </details>

      <SwimTimesTable results={results} hasActiveFilters={filters.hasActiveFilters} />
    </div>
  );
}
