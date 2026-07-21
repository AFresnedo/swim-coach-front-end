"use client";

import { useEffect, useState } from "react";
import Field from "@/components/Field";
import {
  inputClass,
  inputErrorClass,
  inputNormalClass,
  labelClass,
  primaryButtonLargeClass,
} from "@/lib/form-styles";
import { apiErrorDetails } from "@/lib/front-api";
import { useAbortableEffect } from "@/lib/use-abortable-effect";
import { isAuthRedirect, useProtectedFrontFetch } from "@/lib/use-protected-front-fetch";

type UnitSystem = "metric" | "imperial";

type Profile = {
  age: number;
  height_cm: number;
  weight_kg: number;
  sex: string;
  unit_preference: UnitSystem;
};

const CM_PER_INCH = 2.54;
const KG_PER_LB = 0.453592;

function cmToFtIn(cm: number) {
  const totalInches = cm / CM_PER_INCH;
  let ft = Math.floor(totalInches / 12);
  let inches = Math.round(totalInches % 12);
  if (inches === 12) {
    ft += 1;
    inches = 0;
  }
  return { ft, inches };
}

function kgToLbs(kg: number) {
  return Math.round(kg / KG_PER_LB);
}

function ftInToCm(ft: number, inches: number) {
  return Math.round((ft * 12 + inches) * 2.54 * 10) / 10;
}

function lbsToKg(lbs: number) {
  return Math.round(lbs * 0.453592 * 10) / 10;
}

export default function ProfileForm() {
  const protectedFrontFetch = useProtectedFrontFetch();
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

  useAbortableEffect(
    (signal) => {
      protectedFrontFetch<Profile | null>("/api/profile", { signal })
        .then((profile) => {
          if (signal.aborted || !profile) return;
          const { ft, inches } = cmToFtIn(profile.height_cm);
          setAge(String(profile.age));
          setHeightCm(String(profile.height_cm));
          setHeightFt(String(ft));
          setHeightIn(String(inches));
          setWeightKg(String(profile.weight_kg));
          setWeightLbs(String(kgToLbs(profile.weight_kg)));
          setSex(profile.sex);
          setUnits(profile.unit_preference);
        })
        .catch((err) => {
          if (signal.aborted || isAuthRedirect(err)) return;
          setError("Failed to load your profile. Please try again.");
        })
        .finally(() => {
          if (!signal.aborted) setLoadingProfile(false);
        });
    },
    [protectedFrontFetch],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally only resyncs on unit toggle, not on every keystroke in the source fields
  useEffect(() => {
    if (units === "imperial") {
      const cm = parseFloat(heightCm);
      if (!Number.isNaN(cm)) {
        const { ft, inches } = cmToFtIn(cm);
        setHeightFt(String(ft));
        setHeightIn(String(inches));
      }
      const kg = parseFloat(weightKg);
      if (!Number.isNaN(kg)) setWeightLbs(String(kgToLbs(kg)));
    } else {
      const ft = parseFloat(heightFt);
      const inches = parseFloat(heightIn);
      if (!Number.isNaN(ft) && !Number.isNaN(inches)) {
        setHeightCm(String(ftInToCm(ft, inches)));
      }
      const lbs = parseFloat(weightLbs);
      if (!Number.isNaN(lbs)) setWeightKg(String(lbsToKg(lbs)));
    }
  }, [units]);

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setLoading(true);
    setSaved(false);

    const height_cm =
      units === "metric"
        ? parseFloat(heightCm)
        : (parseFloat(heightFt) * 12 + parseFloat(heightIn)) * CM_PER_INCH;

    const weight_kg = units === "metric" ? parseFloat(weightKg) : parseFloat(weightLbs) * KG_PER_LB;

    try {
      await protectedFrontFetch("/api/profile", {
        method: "PUT",
        body: JSON.stringify({
          age: parseInt(age, 10),
          height_cm: Math.round(height_cm * 10) / 10,
          weight_kg: Math.round(weight_kg * 10) / 10,
          sex,
          unit_preference: units,
        }),
      });
      setSaved(true);
    } catch (err) {
      if (isAuthRedirect(err)) return;
      const { message, fieldErrors } = apiErrorDetails(
        err,
        "Failed to save profile. Please try again.",
      );
      setError(message);
      if (fieldErrors) setFieldErrors(fieldErrors);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {loadingProfile && (
        <p className="text-slate-500 text-sm dark:text-slate-400">Loading your profile…</p>
      )}

      {/* Unit toggle */}
      <div className="flex overflow-hidden rounded-lg border border-slate-200 font-medium text-sm dark:border-slate-700">
        {(["metric", "imperial"] as UnitSystem[]).map((u) => (
          <button
            key={u}
            type="button"
            onClick={() => setUnits(u)}
            className={`flex-1 py-2 capitalize transition-colors ${
              units === u
                ? "bg-gradient-aqua text-white"
                : "bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
          >
            {u}
          </button>
        ))}
      </div>

      {/* Age */}
      <Field htmlFor="age" label="Age" error={fieldErrors.age}>
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
          aria-describedby={fieldErrors.age ? "age-error" : undefined}
        />
      </Field>

      {/* Height */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor={units === "metric" ? "height-cm" : "height-ft"} className={labelClass}>
          Height
        </label>
        {units === "metric" ? (
          <input
            id="height-cm"
            type="number"
            step="any"
            required
            min={50}
            max={280}
            value={heightCm}
            onChange={(e) => setHeightCm(e.target.value)}
            className={`${inputClass} ${fieldErrors.height_cm ? inputErrorClass : inputNormalClass}`}
            placeholder="cm"
            aria-describedby={fieldErrors.height_cm ? "height-error" : undefined}
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
              aria-describedby={fieldErrors.height_cm ? "height-error" : undefined}
            />
            <input
              id="height-in"
              type="number"
              required
              min={0}
              max={11}
              value={heightIn}
              onChange={(e) => setHeightIn(e.target.value)}
              className={`${inputClass} ${fieldErrors.height_cm ? inputErrorClass : inputNormalClass}`}
              placeholder="in"
              aria-label="Inches"
              aria-describedby={fieldErrors.height_cm ? "height-error" : undefined}
            />
          </div>
        )}
        {fieldErrors.height_cm && (
          <p id="height-error" className="text-red-600 text-xs dark:text-red-400">
            {fieldErrors.height_cm}
          </p>
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
            step="any"
            required
            min={20}
            max={400}
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            className={`${inputClass} ${fieldErrors.weight_kg ? inputErrorClass : inputNormalClass}`}
            placeholder="kg"
            aria-describedby={fieldErrors.weight_kg ? "weight-error" : undefined}
          />
        ) : (
          <input
            id="weight-lbs"
            type="number"
            step="any"
            required
            min={44}
            max={880}
            value={weightLbs}
            onChange={(e) => setWeightLbs(e.target.value)}
            className={`${inputClass} ${fieldErrors.weight_kg ? inputErrorClass : inputNormalClass}`}
            placeholder="lbs"
            aria-describedby={fieldErrors.weight_kg ? "weight-error" : undefined}
          />
        )}
        {fieldErrors.weight_kg && (
          <p id="weight-error" className="text-red-600 text-xs dark:text-red-400">
            {fieldErrors.weight_kg}
          </p>
        )}
      </div>

      {/* Sex */}
      <Field htmlFor="sex" label="Sex" error={fieldErrors.sex}>
        <select
          id="sex"
          required
          value={sex}
          onChange={(e) => setSex(e.target.value)}
          aria-describedby={fieldErrors.sex ? "sex-hint sex-error" : "sex-hint"}
          className={`${inputClass} ${fieldErrors.sex ? inputErrorClass : inputNormalClass}`}
        >
          <option value="" disabled>
            Select…
          </option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="prefer_not_to_say">Prefer not to say</option>
        </select>
        <p id="sex-hint" className="text-slate-500 text-xs dark:text-slate-400">
          Used to power future performance benchmarks.
        </p>
      </Field>

      {error && (
        <p role="alert" className="text-red-600 text-sm dark:text-red-400">
          {error}
        </p>
      )}
      {saved && (
        <p role="status" className="text-green-600 text-sm dark:text-green-400">
          Profile saved.
        </p>
      )}

      <button type="submit" disabled={loading} className={`${primaryButtonLargeClass} mt-2`}>
        {loading ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
