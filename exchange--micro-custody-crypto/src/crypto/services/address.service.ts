import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { createHash } from 'crypto';
import { HDNodeWallet, keccak256 } from 'ethers';
import { derivePath as derivePathEd25519 } from 'ed25519-hd-key';
import * as StellarSdk from 'stellar-sdk';
import * as bitcoin from 'bitcoinjs-lib';
import * as BIP32 from 'bip32';
import { UserAddress, SupportedBlockchain } from '../models/user-address.schema';
import bs58check = require('bs58check');

/**
 * Service for generating and managing cryptocurrency addresses
 * Implements HD wallet (BIP32/BIP44) for deterministic address generation
 */
@Injectable()
export class AddressService {
  private readonly logger = new Logger(AddressService.name);

  constructor(
    @InjectModel(UserAddress.name)
    private readonly addressModel: Model<UserAddress>,
  ) {}

  /**
   * Generate a unique address for a user on a specific blockchain
   */
  async generateAddressForUser(params: {
    userId: string;
    blockchain: SupportedBlockchain;
    assetCode: string;
  }): Promise<UserAddress> {
    const { userId, blockchain, assetCode } = params;

    // Check if address already exists for this specific asset
    const existing = await this.addressModel.findOne({
      userId,
      blockchain,
      assetCode,
    });

    if (existing) {
      this.logger.log(
        `Address already exists for user ${userId} on ${blockchain} for ${assetCode}: ${existing.address}`,
      );
      return existing;
    }

    // For EVM-compatible chains (Ethereum, BSC, Tron), reuse the same address for all assets
    // For Bitcoin, each asset needs its own address
    let address: string;
    let derivationPath: string;
    let addressIndex: number;

    if (blockchain === 'ethereum' || blockchain === 'bsc' || blockchain === 'tron') {
      // Check if user already has ANY address on this blockchain
      const existingBlockchainAddress = await this.addressModel.findOne({
        userId,
        blockchain,
      });

      if (existingBlockchainAddress) {
        // Reuse the same address for this new asset
        address = existingBlockchainAddress.address;
        derivationPath = existingBlockchainAddress.derivationPath;
        addressIndex = existingBlockchainAddress.addressIndex;

        this.logger.log(
          `♻️  Reusing ${blockchain} address for user ${userId} (${assetCode}): ${address}`,
        );
      } else {
        // Generate first address for this blockchain
        addressIndex = 0;
        const derived = await this.deriveAddress({
          blockchain,
          accountIndex: this.getUserAccountIndex(userId),
          addressIndex,
        });
        address = derived.address;
        derivationPath = derived.path;

        this.logger.log(
          `✅ Generated new ${blockchain} address for user ${userId}: ${address}`,
        );
      }
    } else {
      // Bitcoin: each asset gets its own unique address (current behavior)
      addressIndex = await this.getNextAddressIndex(userId, blockchain);
      const derived = await this.deriveAddress({
        blockchain,
        accountIndex: this.getUserAccountIndex(userId),
        addressIndex,
      });
      address = derived.address;
      derivationPath = derived.path;

      this.logger.log(
        `✅ Generated ${blockchain} address for user ${userId}: ${address}`,
      );
    }

    // Save address to database
    const userAddress = new this.addressModel({
      userId,
      blockchain,
      assetCode,
      address,
      derivationPath,
      addressIndex,
      isActive: true,
      isWatched: true,
      totalDepositsReceived: 0,
    });

    await userAddress.save();

    return userAddress;
  }

  /**
   * Get all addresses for a user
   */
  async getUserAddresses(userId: string): Promise<UserAddress[]> {
    return this.addressModel.find({ userId, isActive: true });
  }

  /**
   * Get address by blockchain and asset
   */
  async getUserAddress(
    userId: string,
    blockchain: SupportedBlockchain,
    assetCode: string,
  ): Promise<UserAddress | null> {
    return this.addressModel.findOne({
      userId,
      blockchain,
      assetCode,
      isActive: true,
    });
  }

  /**
   * Derive an address from the master seed using BIP44
   */
  private async deriveAddress(params: {
    blockchain: SupportedBlockchain;
    accountIndex: number;
    addressIndex: number;
  }): Promise<{ address: string; path: string }> {
    const { blockchain, accountIndex, addressIndex } = params;

    // Get master seed from environment
    const masterSeed = process.env.HD_WALLET_SEED;
    if (!masterSeed) {
      throw new Error('HD_WALLET_SEED not configured');
    }

    const coinType = this.getCoinType(blockchain);
    // Build BIP44 path. Note: Stellar (ed25519) requires hardened segments only.
    const path =
      blockchain === 'stellar'
        ? `m/44'/${coinType}'/${accountIndex}'/0'/${addressIndex}'`
        : `m/44'/${coinType}'/${accountIndex}'/0/${addressIndex}`;

    if (blockchain === 'bitcoin') {
      return this.deriveBitcoinAddress(masterSeed, path);
    } else if (blockchain === 'tron') {
      return this.deriveTronAddress(masterSeed, path);
    } else if (blockchain === 'stellar') {
      return this.deriveStellarAddress(masterSeed, path);
    } else {
      // For EVM chains (BSC, Ethereum)
      return this.deriveEVMAddress(masterSeed, path);
    }
  }

  /**
   * Derive Bitcoin address
   */
  private deriveBitcoinAddress(
    masterSeed: string,
    path: string,
  ): { address: string; path: string } {
    const network =
      process.env.BTC_NETWORK === 'mainnet'
        ? bitcoin.networks.bitcoin
        : bitcoin.networks.testnet;

    // Create HD node from seed
    const seed = Buffer.from(masterSeed, 'hex');
    const root = BIP32.BIP32Factory(require('tiny-secp256k1')).fromSeed(seed, network);
    const child = root.derivePath(path);

    // Generate address
    const { address } = bitcoin.payments.p2wpkh({
      pubkey: child.publicKey,
      network,
    });

    if (!address) {
      throw new Error('Failed to generate Bitcoin address');
    }

    return { address, path };
  }

  /**
   * Derive EVM address (BSC, Ethereum)
   */
  private deriveEVMAddress(
    masterSeed: string,
    path: string,
  ): { address: string; path: string } {
    const hdNode = HDNodeWallet.fromSeed('0x' + masterSeed);
    const derived = hdNode.derivePath(path);
    const address = derived.address;

    return { address, path };
  }

  /**
   * Derive Tron address from HD seed
   * Tron uses the same ECDSA secp256k1 as Ethereum, but with different address encoding
   */
  private deriveTronAddress(
    masterSeed: string,
    path: string,
  ): { address: string; path: string } {
    // Derive key using same method as EVM
    const hdNode = HDNodeWallet.fromSeed('0x' + masterSeed);
    const derived = hdNode.derivePath(path);
    
    // Get public key from derived wallet
    const publicKey = derived.publicKey.slice(2); // Remove '0x' prefix
    
    // Convert to Tron address format
    const address = this.publicKeyToTronAddress(publicKey);

    return { address, path };
  }

  /**
   * Convert public key to Tron base58check address
   * Tron uses the same ECDSA (secp256k1) and Keccak-256 as Ethereum,
   * but with different address encoding (Base58Check with 0x41 prefix)
   */
  private publicKeyToTronAddress(publicKeyHex: string): string {
    // Hash public key with Keccak-256 (same as Ethereum)
    const pubKeyBuffer = Buffer.from(publicKeyHex, 'hex');
    const hash = keccak256(pubKeyBuffer);
    
    // Take last 20 bytes (160 bits) - this is the Ethereum-style address
    const addressBytes = Buffer.from(hash.slice(-40), 'hex'); // Last 20 bytes
    
    // Add Tron mainnet prefix (0x41) - this makes it a Tron address
    const addressWithPrefix = Buffer.concat([Buffer.from([0x41]), addressBytes]);
    
    // Encode using Base58Check (includes checksum)
    const base58Address = bs58check.default.encode(addressWithPrefix);
    
    return base58Address;
  }

  /**
   * Derive Stellar address from HD seed
   * Stellar uses Ed25519 for cryptography
   * For now, we derive using secp256k1 and hash to create a deterministic seed for Ed25519
   * 
   * Note: In production with stellar-sdk, use:
   * const StellarSdk = require('stellar-sdk');
   * const keypair = StellarSdk.Keypair.fromRawEd25519Seed(seed);
   */
  private deriveStellarAddress(
    masterSeed: string,
    path: string,
  ): { address: string; path: string } {
    // Stellar uses SLIP-0010 (ed25519) derivation, not secp256k1
    // Path format: m/44'/148'/account'/0/index per BIP44 coin type 148
    // masterSeed is hex string; convert to buffer
    // ed25519-hd-key expects the seed as a hex string
    const { key } = derivePathEd25519(path, masterSeed);

    // key is 32-byte ed25519 private key seed
    const keypair = StellarSdk.Keypair.fromRawEd25519Seed(key);
    const publicKey = keypair.publicKey(); // StrKey G... address

    return { address: publicKey, path };
  }

  /**
   * Get BIP44 coin type for each blockchain
   */
  private getCoinType(blockchain: SupportedBlockchain): number {
    const coinTypes: Record<SupportedBlockchain, number> = {
      bitcoin: 0,
      ethereum: 60,
      bsc: 60, // BSC uses same as Ethereum
      stellar: 148,
      tron: 195, // TRON coin type
    };
    return coinTypes[blockchain];
  }

  /**
   * Convert userId to a numeric account index
   */
  private getUserAccountIndex(userId: string): number {
    const hash = createHash('sha256').update(userId).digest('hex');
    return parseInt(hash.substring(0, 8), 16) % 2147483648; // Max BIP32 index
  }

  /**
   * Get the next available address index for a user
   */
  private async getNextAddressIndex(
    userId: string,
    blockchain: SupportedBlockchain,
  ): Promise<number> {
    const lastAddress = await this.addressModel
      .findOne({ userId, blockchain })
      .sort({ addressIndex: -1 });

    return lastAddress ? lastAddress.addressIndex + 1 : 0;
  }

  /**
   * Mark address as having received first deposit
   */
  async markFirstDeposit(addressId: string): Promise<void> {
    await this.addressModel.findByIdAndUpdate(addressId, {
      firstDepositAt: new Date(),
    });
  }

  /**
   * Update deposit stats for an address
   */
  async updateDepositStats(addressId: string, amount: number): Promise<void> {
    await this.addressModel.findByIdAndUpdate(addressId, {
      lastDepositAt: new Date(),
      $inc: { totalDepositsReceived: amount },
    });
  }
}
