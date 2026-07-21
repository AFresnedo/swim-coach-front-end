"use client";

import { useState } from "react";
import CreateSwimTimeForm from "@/features/swim-log/components/CreateSwimTimeForm";
import DateAndFilterControls from "@/features/swim-log/components/DateAndFilterControls";
import SwimTimesTable from "@/features/swim-log/components/SwimTimesTable";
import { useSwimTimesQuery } from "@/features/swim-log/hooks/use-swim-times-query";

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

      <CreateSwimTimeForm
        selectedDate={selectedDate}
        getViewGeneration={getViewGeneration}
        insertIfCurrentView={insertIfCurrentView}
      />

      <SwimTimesTable results={results} hasActiveFilters={filters.hasActiveFilters} />
    </div>
  );
}
