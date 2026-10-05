/** Renders text with every [TODO…] marker highlighted. */
export function HighlightTodo({ text }: { text: string }) {
  const parts = text.split(/(\[TODO[^\]]*\])/gi);
  return <>{parts.map((s, i) => (/^\[TODO/i.test(s) ? <mark key={i} className="todo">{s}</mark> : s))}</>;
}

export const TODO_RE = /\[TODO[^\]]*\]/gi;
export function countTodos(...values: (string | null | undefined)[]) {
  return values.reduce((n, v) => n + (v?.match(TODO_RE)?.length ?? 0), 0);
}

/**
 * Profile placeholder: owner sees the highlighted [TODO…]; visitors see `fallback` (default: nothing).
 * For filled values it renders the value itself (or `children` when you need custom markup).
 */
export function Field({ value, owner, fallback = null, children }: { value: string | null | undefined; owner: boolean; fallback?: React.ReactNode; children?: React.ReactNode }) {
  if (!value?.trim()) return <>{fallback}</>;
  if (/^\s*\[TODO/i.test(value)) return owner ? <mark className="todo">{value.trim()}</mark> : <>{fallback}</>;
  return <>{children ?? value}</>;
}
