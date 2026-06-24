// Looks up packaged-food nutrition by barcode via the Open Food Facts API.
// Returns null if the barcode isn't in their database; throws on network failure.

function round1(v) {
  return typeof v === 'number' && Number.isFinite(v) ? Math.round(v * 10) / 10 : 0;
}

function toFoodResult(p) {
  const n = p.nutriments || {};
  const kcal = n['energy-kcal_100g'] ?? (n['energy_100g'] ? n['energy_100g'] / 4.184 : 0);
  return {
    code: p.code || '',
    name: p.product_name || '',
    brand: (p.brands || '').split(',')[0].trim(),
    unit: 'g',
    per100: {
      calories: round1(kcal),
      protein: round1(n['proteins_100g']),
      carbs: round1(n['carbohydrates_100g']),
      fat: round1(n['fat_100g']),
      sugar: round1(n['sugars_100g']),
      fiber: round1(n['fiber_100g']),
      satFat: round1(n['saturated-fat_100g']),
    },
  };
}

export async function lookupBarcode(code) {
  const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json?fields=product_name,brands,nutriments`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Lookup failed (${res.status})`);
  const data = await res.json();
  if (data.status !== 1 || !data.product) return null;
  return toFoodResult(data.product);
}

// Live text search against Open Food Facts — used instead of a bulk data
// import since the full export is multiple GB and won't fit in localStorage.
export async function searchFoodProducts(query) {
  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=20&fields=code,product_name,brands,nutriments`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Search failed (${res.status})`);
  const data = await res.json();
  const products = data.products || [];
  return products.filter((p) => p.product_name).map(toFoodResult);
}
