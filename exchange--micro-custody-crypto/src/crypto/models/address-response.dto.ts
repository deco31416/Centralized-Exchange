/**
 * DTO for address response
 */
export class AddressResponseDto {
  addressId: string;
  userId: string;
  blockchain: string;
  assetCode: string;
  address: string;
  derivationPath: string;
  isActive: boolean;
  createdAt: Date;
}
