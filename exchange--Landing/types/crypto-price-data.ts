export interface CryptoPriceData {
    _id: string;
    symbol: string;
    name: string;
    averagePrice: number;
    averageChange24h: number;
    averageVolume24h: number;
    prices: {
      cryptoCompare: number;
      coinGecko: number;
      coinMarketCap: number;
    };
    createdAt: string; // o Date si lo conviertes
    updatedAt: string; // o Date si lo conviertes
    __v: number;
    imgUrl: string; // URL de la imagen del activo
  }
  