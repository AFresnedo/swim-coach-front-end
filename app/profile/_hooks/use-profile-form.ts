"use client";

import { useEffect, useState } from "react";
import { apiErrorDetails } from "@/shared/front-api";
import { isAuthRedirect, useProtectedFrontFetch } from "@/shared/protected-fetch";
import { useAbortableEffect } from "@/shared/use-abortable-effect";

export type UnitSystem = "metric" | "imperial";

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
  return Math.round((ft * 12 + inches) * CM_PER_INCH * 10) / 10;
}

function lbsToKg(lbs: number) {
  return Math.round(lbs * KG_PER_LB * 10) / 10;
}

export function useProfileForm() {
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
      protectedFrontFetch<Profile | null>("/profile/api", { signal })
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
      await protectedFrontFetch("/profile/api", {
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

  return {
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
  };
}
