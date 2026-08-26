"use client";

import { type UnitSystem, useProfileForm } from "@/app/profile/_hooks/use-profile-form";
import Field from "@/components/Field";
import {
  inputClass,
  inputErrorClass,
  inputNormalClass,
  labelClass,
  primaryButtonLargeClass,
} from "@/shared/form-styles";

export default function ProfileForm() {
  const {
    units,
    setUnits,
    age,
    setAge,
    heightCm,
    setHeightCm,
    heightFt,
    setHeightFt,
    heightIn,
    setHeightIn,
    weightKg,
    setWeightKg,
    weightLbs,
    setWeightLbs,
    sex,
    setSex,
    loadingProfile,
    error,
    fieldErrors,
    loading,
    saved,
    handleSubmit,
  } = useProfileForm();

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
