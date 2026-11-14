// The array order is also the saved board order, including in older backups.
export function moveKeep(keeps, id, targetId) {
  const from = keeps.findIndex(keep => keep.id === id)
  const to = keeps.findIndex(keep => keep.id === targetId)
  if (from < 0 || to < 0 || from === to) return keeps
  const reordered = [...keeps]
  const [keep] = reordered.splice(from, 1)
  reordered.splice(to, 0, keep)
  return reordered
}
