"use client";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({ open, title, description, confirmLabel = "Delete", onCancel, onConfirm }: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-lg border border-line bg-paper p-5 shadow-soft">
        <h2 className="text-lg font-semibold text-ink">{title}</h2>
        <p className="mt-2 text-sm text-zinc-600">{description}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button className="rounded-md border border-line px-4 py-2 text-sm" onClick={onCancel}>
            Cancel
          </button>
          <button className="rounded-md bg-wine px-4 py-2 text-sm font-medium text-white" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
