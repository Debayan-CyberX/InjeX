export type DiffPart = { text: string; kind: "same" | "added" | "removed" };

/** Character diff for short prompts; bounded memory for the 20k-character editor. */
export function diffText(source: string, target: string): DiffPart[] {
  const a = Array.from(source),
    b = Array.from(target);
  let prefix = 0;
  while (prefix < a.length && prefix < b.length && a[prefix] === b[prefix])
    prefix++;
  let suffix = 0;
  while (
    suffix < a.length - prefix &&
    suffix < b.length - prefix &&
    a[a.length - suffix - 1] === b[b.length - suffix - 1]
  )
    suffix++;
  const left = a.slice(prefix, a.length - suffix),
    right = b.slice(prefix, b.length - suffix);
  const result: DiffPart[] = [];
  const append = (kind: DiffPart["kind"], text: string) => {
    if (!text) return;
    const last = result[result.length - 1];
    if (last?.kind === kind) last.text += text;
    else result.push({ kind, text });
  };
  append("same", a.slice(0, prefix).join(""));
  if (left.length * right.length > 1_500_000) {
    append("removed", left.join(""));
    append("added", right.join(""));
  } else {
    const rows = Array.from(
      { length: left.length + 1 },
      () => new Uint16Array(right.length + 1),
    );
    for (let i = left.length - 1; i >= 0; i--)
      for (let j = right.length - 1; j >= 0; j--)
        rows[i][j] =
          left[i] === right[j]
            ? rows[i + 1][j + 1] + 1
            : Math.max(rows[i + 1][j], rows[i][j + 1]);
    let i = 0,
      j = 0;
    while (i < left.length || j < right.length) {
      if (i < left.length && j < right.length && left[i] === right[j]) {
        append("same", left[i]);
        i++;
        j++;
      } else if (
        j < right.length &&
        (i === left.length || rows[i][j + 1] >= rows[i + 1][j])
      )
        append("added", right[j++]);
      else append("removed", left[i++]);
    }
  }
  append("same", suffix ? a.slice(a.length - suffix).join("") : "");
  return result;
}
