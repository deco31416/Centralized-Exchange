import { DECOPAYRequest } from '../interfaces/decopay-request.interface';

export const DECOPAY_REQUESTS_MOCK: DECOPAYRequest[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    payerUserId: '22222222-2222-2222-2222-222222222222',
    collectorUserId: '33333333-3333-3333-3333-333333333333',
    amount: 150,
    currency: 'USD',
    concept: 'DECOPAY pending payment',
    status: 'PENDING',
    createdAt: '2026-04-07T10:00:00.000Z',
    paidAt: null,
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    payerUserId: '55555555-5555-5555-5555-555555555555',
    collectorUserId: '66666666-6666-6666-6666-666666666666',
    amount: 89.99,
    currency: 'USD',
    concept: 'DECOPAY paid request',
    status: 'PAID',
    createdAt: '2026-04-06T15:30:00.000Z',
    paidAt: '2026-04-06T15:45:00.000Z',
  },
];
