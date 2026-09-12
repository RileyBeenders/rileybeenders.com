"use client";

export function SaveBar({
  saving,
  message,
  error,
  onSave
}: {
  saving: boolean;
  message: string | null;
  error: boolean;
  onSave: () => void;
}) {
  return (
    <div className="studio-savebar">
      <button type="button" className="studio-save-btn" onClick={onSave} disabled={saving}>
        {saving ? "Saving…" : "Save changes"}
      </button>
      {message && <span className={error ? "studio-save-status is-error" : "studio-save-status"}>{message}</span>}
    </div>
  );
}
