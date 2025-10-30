let coinData = {};

export const getCoinData = () => coinData;

export const setCoinData = (symbol, data) => {
  const key = symbol.toUpperCase();
  coinData[key] = { symbol: key, ...coinData[key], ...data };
};
