export function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export function todayKey() {
  return dateKey(new Date());
}

export function dateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function addDays(dateKeyStr, delta) {
  const [y, m, d] = dateKeyStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + delta);
  return dateKey(dt);
}

export function formatDisplayDate(dateKeyStr) {
  const [y, m, d] = dateKeyStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  const today = todayKey();
  const yesterday = addDays(today, -1);
  const tomorrow = addDays(today, 1);
  if (dateKeyStr === today) return 'Today';
  if (dateKeyStr === yesterday) return 'Yesterday';
  if (dateKeyStr === tomorrow) return 'Tomorrow';
  return dt.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

export function round1(n) {
  return Math.round(n * 10) / 10;
}

export function scaleMacros(per100, qty) {
  const factor = qty / 100;
  return {
    calories: per100.calories * factor,
    protein: per100.protein * factor,
    carbs: per100.carbs * factor,
    fat: per100.fat * factor,
  };
}

export function sumMacros(list) {
  const total = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  for (const item of list) {
    const m = scaleMacros(item.per100, item.qty);
    total.calories += m.calories;
    total.protein += m.protein;
    total.carbs += m.carbs;
    total.fat += m.fat;
  }
  return total;
}

export function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}
