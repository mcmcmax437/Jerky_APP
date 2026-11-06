export function slotAssignments(shopIds: string[], restIds: string[]) {
  return [
    ...shopIds.map((id, index) => ({ id, sortOrder: index + 1 })),
    ...restIds.map((id, index) => ({ id, sortOrder: shopIds.length + index + 1 })),
  ];
}

export function moveShopItem<T extends { id: string }>(items: T[], fromId: string, toId: string) {
  if (fromId === toId) return items;
  const from = items.findIndex((item) => item.id === fromId);
  const to = items.findIndex((item) => item.id === toId);
  if (from < 0 || to < 0) return items;
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}
