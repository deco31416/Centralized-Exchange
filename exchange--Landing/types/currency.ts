export interface Currency {
    _id: string;
    ticker: string;
    name: string;
    image: string;
    isFiat: boolean;
    featured: boolean;
    isStable: boolean;
    network: string;
    tokenContract: string;
    buy: boolean;
    sell: boolean;
    legacyTicker: string;
    price: number;
    enabled: boolean;
    isLocal: boolean;
    lastPriceUpdated: Date; // ISO date string
    __v: number;
}