"use client";

import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

const inputClass =
  "mt-1 block w-full min-h-11 rounded-md border border-line bg-surface px-3 py-2 text-foreground " +
  "aria-[invalid=true]:border-red-600 focus-visible:border-accent";

type Common = { label: string; name: string; error?: string; hint?: string; optionalLabel?: string };

function Label({ label, name, required, optionalLabel }: { label: string; name: string; required?: boolean; optionalLabel?: string }) {
  return (
    <label htmlFor={name} className="block font-semibold">
      {label}
      {!required && optionalLabel && <span className="ml-1 font-normal text-muted">({optionalLabel})</span>}
    </label>
  );
}

function Help({ name, error, hint }: { name: string; error?: string; hint?: string }) {
  return (
    <>
      {hint && (
        <p id={`${name}-hint`} className="mt-1 text-sm text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${name}-error`} className="mt-1 text-sm font-semibold text-red-700 dark:text-red-400">
          {error}
        </p>
      )}
    </>
  );
}

function describedBy(name: string, error?: string, hint?: string) {
  return [hint && `${name}-hint`, error && `${name}-error`].filter(Boolean).join(" ") || undefined;
}

export function Field({ label, name, error, hint, optionalLabel, ...props }: Common & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <Label label={label} name={name} required={props.required} optionalLabel={optionalLabel} />
      <input
        id={name}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(name, error, hint)}
        className={inputClass}
        {...props}
      />
      <Help name={name} error={error} hint={hint} />
    </div>
  );
}

export function TextArea({ label, name, error, hint, optionalLabel, ...props }: Common & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div>
      <Label label={label} name={name} required={props.required} optionalLabel={optionalLabel} />
      <textarea
        id={name}
        name={name}
        rows={3}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(name, error, hint)}
        className={inputClass}
        {...props}
      />
      <Help name={name} error={error} hint={hint} />
    </div>
  );
}

export function Select({
  label,
  name,
  error,
  hint,
  optionalLabel,
  options,
  ...props
}: Common & SelectHTMLAttributes<HTMLSelectElement> & { options: { value: string; label: string }[] }) {
  return (
    <div>
      <Label label={label} name={name} required={props.required} optionalLabel={optionalLabel} />
      {/* La key vuelve a montar el select cuando cambia el valor por defecto: tras un error, React 19 limpia el
          formulario y un select no recupera solo lo que se había elegido. */}
      <select
        key={String(props.defaultValue ?? "")}
        id={name}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(name, error, hint)}
        className={inputClass}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <Help name={name} error={error} hint={hint} />
    </div>
  );
}

export function Checkbox({ label, name, error, ...props }: { label: ReactNode; name: string; error?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <div className="flex items-start gap-3">
        <input
          id={name}
          name={name}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${name}-error` : undefined}
          className="mt-1 size-5 shrink-0 accent-[var(--accent)]"
          {...props}
        />
        <label htmlFor={name} className="text-[0.95rem]">
          {label}
        </label>
      </div>
      <Help name={name} error={error} />
    </div>
  );
}

export function SubmitButton({ children, pending, pendingLabel }: { children: ReactNode; pending: boolean; pendingLabel: string }) {
  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className="inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-5 font-semibold text-accent-contrast hover:opacity-90 disabled:opacity-60"
    >
      {pending ? pendingLabel : children}
    </button>
  );
}

export function Alert({ tone, children }: { tone: "error" | "success" | "info"; children: ReactNode }) {
  const styles = {
    error: "border-red-600 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100",
    success: "border-accent bg-accent-soft text-foreground",
    info: "border-line bg-surface text-foreground",
  }[tone];
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`rounded-md border-l-4 px-4 py-3 ${styles}`}>
      {children}
    </div>
  );
}
