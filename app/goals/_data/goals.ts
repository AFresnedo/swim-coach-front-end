export type DeactivationReason = "reached" | "abandoned" | "other";

export type Goal = {
  id: number;
  user_id: number;
  text: string;
  is_active: boolean;
  deactivation_reason: DeactivationReason | null;
  created_at: string;
};
