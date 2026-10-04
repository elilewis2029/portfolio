/** Renders text with every [TODO…] marker highlighted. */
export function HighlightTodo({ text }: { text: string }) {
  const parts = text.split(/(\[TODO[^\]]*\])/gi);
  return <>{parts.map((s, i) => (/^\[TODO/i.test(s) ? <mark key={i} className="todo">{s}</mark> : s))}</>;
}

export const TODO_RE = /\[TODO[^\]]*\]/gi;
export function countTodos(...values: (string | null | undefined)[]) {
  return values.reduce((n, v) => n + (v?.match(TODO_RE)?.length ?? 0), 0);
}
