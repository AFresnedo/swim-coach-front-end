import type { ReactNode } from "react";
import { labelClass } from "@/shared/form-styles";

export default function Field({
  htmlFor,
  label,
  error,
  children,
}: {
  htmlFor: string;
  label: string;
  error?: string | null;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className={labelClass}>
        {label}
      </label>
      {children}
      {error && (
        <p id={`${htmlFor}-error`} className="text-red-600 text-xs dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
