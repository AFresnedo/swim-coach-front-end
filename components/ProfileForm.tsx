"use client";

import { useEffect, useState } from "react";
import { ApiError, frontApiFetch } from "@/lib/api";
import { inputClass, inputErrorClass, inputNormalClass, labelClass } from "@/lib/form-styles";

type UnitSystem = "metric" | "imperial";

type Profile = {
  age: number;
  height_cm: number;
  weight_kg: number;
  sex: string;
};

function cmToFtIn(cm: number) {
  const totalInches = cm / 2.54;
  let ft = Math.floor(totalInches / 12);
  let inches = Math.round(totalInches % 12);
  if (inches === 12) {
    ft += 1;
    inches = 0;
  }
  return { ft, inches };
}

function kgToLbs(kg: number) {
  return Math.round(kg / 0.453592);
}

export default function ProfileForm() {
  const [units, setUnits] = useState<UnitSystem>("metric");
  const [age, setAge] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [weightLbs, setWeightLbs] = useState("");
  const [sex, setSex] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;

    frontApiFetch<Profile | null>("/api/profile")
      .then((profile) => {
        if (cancelled || !profile) return;
        const { ft, inches } = cmToFtIn(profile.height_cm);
        setAge(String(profile.age));
        setHeightCm(String(profile.height_cm));
        setHeightFt(String(ft));
        setHeightIn(String(inches));
        setWeightKg(String(profile.weight_kg));
        setWeightLbs(String(kgToLbs(profile.weight_kg)));
        setSex(profile.sex);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingProfile(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

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
        method: "PUT",
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
      {loadingProfile && (
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading your profile…</p>
      )}

      {/* Unit toggle */}
      <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden text-sm font-medium">
        {(["metric", "imperial"] as UnitSystem[]).map((u) => (
          <button
            key={u}
            type="button"
            onClick={() => setUnits(u)}
            className={`flex-1 py-2 transition-colors capitalize ${
              units === u
                ? "bg-gradient-aqua text-white"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
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
          aria-describedby="sex-hint"
          className={`${inputClass} ${fieldErrors.sex ? inputErrorClass : inputNormalClass}`}
        >
          <option value="" disabled>
            Select…
          </option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="prefer_not_to_say">Prefer not to say</option>
        </select>
        <p id="sex-hint" className="text-xs text-slate-500 dark:text-slate-400">
          Used to calculate performance benchmarks.
        </p>
        {fieldErrors.sex && (
          <p className="text-xs text-red-600 dark:text-red-400">{fieldErrors.sex}</p>
        )}
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      {saved && <p className="text-sm text-green-600 dark:text-green-400">Profile saved.</p>}

      <button
        type="submit"
        disabled={loading}
        className="mt-2 rounded-full bg-gradient-aqua px-4 py-3 text-sm font-semibold text-white shadow-aqua hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-[filter]"
      >
        {loading ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
