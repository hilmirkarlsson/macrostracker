// Looks up packaged-food nutrition by barcode via the Open Food Facts API.
// Returns null if the barcode isn't in their database; throws on network failure.

function round1(v) {
  return typeof v === 'number' && Number.isFinite(v) ? Math.round(v * 10) / 10 : 0;
}

export async function lookupBarcode(code) {
  const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json?fields=product_name,brands,nutriments`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Lookup failed (${res.status})`);
  const data = await res.json();
  if (data.status !== 1 || !data.product) return null;

  const p = data.product;
  const n = p.nutriments || {};
  const kcal = n['energy-kcal_100g'] ?? (n['energy_100g'] ? n['energy_100g'] / 4.184 : 0);

  return {
    name: p.product_name || '',
    brand: (p.brands || '').split(',')[0].trim(),
    unit: 'g',
    per100: {
      calories: round1(kcal),
      protein: round1(n['proteins_100g']),
      carbs: round1(n['carbohydrates_100g']),
      fat: round1(n['fat_100g']),
    },
  };
}
