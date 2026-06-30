"use client";

import { useState } from "react";
import { ApiError, frontApiFetch } from "@/lib/api";

type UnitSystem = "metric" | "imperial";

const inputClass =
  "rounded-lg border bg-white dark:bg-zinc-900 px-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full";
const inputErrorClass = "border-red-400 dark:border-red-500";
const inputNormalClass = "border-zinc-200 dark:border-zinc-700";
const labelClass = "text-sm font-medium text-zinc-700 dark:text-zinc-300";

export default function ProfileForm() {
  const [units, setUnits] = useState<UnitSystem>("metric");
  const [age, setAge] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [weightLbs, setWeightLbs] = useState("");
  const [sex, setSex] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setLoading(true);
    setSaved(false);

    const height_cm =
      units === "metric"
        ? parseFloat(heightCm)
        : (parseFloat(heightFt) * 12 + parseFloat(heightIn)) * 2.54;

    const weight_kg = units === "metric" ? parseFloat(weightKg) : parseFloat(weightLbs) * 0.453592;

    try {
      await frontApiFetch("/api/profile", {
        method: "POST",
        body: JSON.stringify({
          age: parseInt(age, 10),
          height_cm: Math.round(height_cm * 10) / 10,
          weight_kg: Math.round(weight_kg * 10) / 10,
          sex,
        }),
      });
      setSaved(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.errors) setFieldErrors(err.errors);
      } else {
        setError("Failed to save profile. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Unit toggle */}
      <div className="flex rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden text-sm font-medium">
        {(["metric", "imperial"] as UnitSystem[]).map((u) => (
          <button
            key={u}
            type="button"
            onClick={() => setUnits(u)}
            className={`flex-1 py-2 transition-colors capitalize ${
              units === u
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            }`}
          >
            {u}
          </button>
        ))}
      </div>

      {/* Age */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="age" className={labelClass}>
          Age
        </label>
        <input
          id="age"
          type="number"
          required
          min={5}
          max={120}
          value={age}
          onChange={(e) => setAge(e.target.value)}
          className={`${inputClass} ${fieldErrors.age ? inputErrorClass : inputNormalClass}`}
          placeholder="Years"
        />
        {fieldErrors.age && (
          <p className="text-xs text-red-600 dark:text-red-400">{fieldErrors.age}</p>
        )}
      </div>

      {/* Height */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor={units === "metric" ? "height-cm" : "height-ft"} className={labelClass}>
          Height
        </label>
        {units === "metric" ? (
          <input
            id="height-cm"
            type="number"
            required
            min={50}
            max={280}
            value={heightCm}
            onChange={(e) => setHeightCm(e.target.value)}
            className={`${inputClass} ${fieldErrors.height_cm ? inputErrorClass : inputNormalClass}`}
            placeholder="cm"
          />
        ) : (
          <div className="flex gap-2">
            <input
              id="height-ft"
              type="number"
              required
              min={1}
              max={9}
              value={heightFt}
              onChange={(e) => setHeightFt(e.target.value)}
              className={`${inputClass} ${fieldErrors.height_cm ? inputErrorClass : inputNormalClass}`}
              placeholder="ft"
            />
            <input
              type="number"
              required
              min={0}
              max={11}
              value={heightIn}
              onChange={(e) => setHeightIn(e.target.value)}
              className={`${inputClass} ${fieldErrors.height_cm ? inputErrorClass : inputNormalClass}`}
              placeholder="in"
            />
          </div>
        )}
        {fieldErrors.height_cm && (
          <p className="text-xs text-red-600 dark:text-red-400">{fieldErrors.height_cm}</p>
        )}
      </div>

      {/* Weight */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor={units === "metric" ? "weight-kg" : "weight-lbs"} className={labelClass}>
          Weight
        </label>
        {units === "metric" ? (
          <input
            id="weight-kg"
            type="number"
            required
            min={20}
            max={400}
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            className={`${inputClass} ${fieldErrors.weight_kg ? inputErrorClass : inputNormalClass}`}
            placeholder="kg"
          />
        ) : (
          <input
            id="weight-lbs"
            type="number"
            required
            min={44}
            max={880}
            value={weightLbs}
            onChange={(e) => setWeightLbs(e.target.value)}
            className={`${inputClass} ${fieldErrors.weight_kg ? inputErrorClass : inputNormalClass}`}
            placeholder="lbs"
          />
        )}
        {fieldErrors.weight_kg && (
          <p className="text-xs text-red-600 dark:text-red-400">{fieldErrors.weight_kg}</p>
        )}
      </div>

      {/* Sex */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="sex" className={labelClass}>
          Sex
        </label>
        <select
          id="sex"
          required
          value={sex}
          onChange={(e) => setSex(e.target.value)}
          className={`${inputClass} ${fieldErrors.sex ? inputErrorClass : inputNormalClass}`}
        >
          <option value="" disabled>
            Select…
          </option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        {fieldErrors.sex && (
          <p className="text-xs text-red-600 dark:text-red-400">{fieldErrors.sex}</p>
        )}
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      {saved && <p className="text-sm text-green-600 dark:text-green-400">Profile saved.</p>}

      <button
        type="submit"
        disabled={loading}
        className="mt-2 rounded-full bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
