// cache/dataStore.js
const coinData = {}; // shared in-memory cache

// ✅ getter (returns live object reference)
export const getCoinData = () => coinData;

// ✅ setter (adds or updates only this symbol)
export const setCoinData = (id, data) => {
  const key = `SYM_${id.toUpperCase()}`;
  coinData[key] = { ...coinData[key], ...data };
};
