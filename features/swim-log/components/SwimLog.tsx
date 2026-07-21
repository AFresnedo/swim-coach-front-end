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

  const {
    times,
    nextCursor,
    loading,
    loadingMore,
    error,
    filterStroke,
    setFilterStroke,
    filterCourse,
    setFilterCourse,
    filterLength,
    setFilterLength,
    filterLengthError,
    filterOfficial,
    setFilterOfficial,
    handleLoadMore,
    getViewGeneration,
    insertIfCurrentView,
  } = useSwimTimesQuery(selectedDate);

  return (
    <div className="flex flex-col gap-8">
      <DateAndFilterControls
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        filterStroke={filterStroke}
        setFilterStroke={setFilterStroke}
        filterCourse={filterCourse}
        setFilterCourse={setFilterCourse}
        filterLength={filterLength}
        setFilterLength={setFilterLength}
        filterLengthError={filterLengthError}
        filterOfficial={filterOfficial}
        setFilterOfficial={setFilterOfficial}
      />

      <CreateSwimTimeForm
        selectedDate={selectedDate}
        getViewGeneration={getViewGeneration}
        insertIfCurrentView={insertIfCurrentView}
      />

      <SwimTimesTable
        times={times}
        loading={loading}
        error={error}
        filterStroke={filterStroke}
        filterCourse={filterCourse}
        filterLength={filterLength}
        filterOfficial={filterOfficial}
        nextCursor={nextCursor}
        loadingMore={loadingMore}
        handleLoadMore={handleLoadMore}
      />
    </div>
  );
}
