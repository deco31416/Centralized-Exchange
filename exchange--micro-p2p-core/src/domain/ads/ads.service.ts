import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { P2PAd, P2PAdDocument } from './schemas/p2p-ad.schema';
import { CreateAdDto } from './dto/create-ad.dto';
import { UpdateAdDto } from './dto/update-ad.dto';
import { QueryAdsDto } from './dto/query-ads.dto';
import { AdStatus } from '../../shared/enums/p2p.enums';

@Injectable()
export class AdsService {
  private readonly logger = new Logger(AdsService.name);

  constructor(
    @InjectModel(P2PAd.name) private readonly adModel: Model<P2PAdDocument>,
  ) {}

  async create(userId: string, dto: CreateAdDto): Promise<P2PAd> {
    const adId = uuidv4();

    // hold-on-order: el Ad NO crea hold en custody — el escrow se crea en cada Order individualmente.
    // Esto elimina el double-escrow (P2P-DOUBLE-ESCROW-001).
    const ad = await this.adModel.create({
      adId,
      userId,
      side: dto.side,
      assetCode: dto.assetCode,
      fiatCode: dto.fiatCode,
      priceType: dto.priceType,
      fixedPrice: dto.fixedPrice,
      marketMarginPercent: dto.marketMarginPercent,
      minFiatAmount: dto.minFiatAmount,
      maxFiatAmount: dto.maxFiatAmount,
      totalCryptoAmount: dto.availableCryptoAmount,
      availableCryptoAmount: dto.availableCryptoAmount,
      reservedCryptoAmount: 0,
      releasedCryptoAmount: 0,
      paymentMethodIds: dto.paymentMethodIds,
      terms: dto.terms,
      acceptedPaymentRails: dto.acceptedPaymentRails ?? ['EXTERNAL_FIAT_PAYMENT'],
      status: AdStatus.ACTIVE,
    });

    this.logger.log(`[Ads] created | adId=${adId} | userId=${userId} | status=ACTIVE | policy=hold-on-order | amount=${dto.availableCryptoAmount}`);
    return ad;
  }

  async findMany(query: QueryAdsDto) {
    const filter: Record<string, any> = {};
    if (query.side) filter.side = query.side;
    if (query.assetCode) filter.assetCode = query.assetCode;
    if (query.fiatCode) filter.fiatCode = query.fiatCode;
    if (query.status) filter.status = query.status;
    else filter.status = AdStatus.ACTIVE;

    const page = Number(query.page) || 1;
    const limit = Math.min(Number(query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.adModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      this.adModel.countDocuments(filter),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findById(adId: string): Promise<P2PAd> {
    const ad = await this.adModel.findOne({ adId }).lean();
    if (!ad) throw new NotFoundException(`Ad ${adId} not found`);
    return ad;
  }

  async update(userId: string, adId: string, dto: UpdateAdDto): Promise<P2PAd> {
    const ad = await this.adModel.findOne({ adId });
    if (!ad) throw new NotFoundException(`Ad ${adId} not found`);
    if (ad.userId !== userId) throw new ForbiddenException('Not your ad');
    if (ad.status === AdStatus.COMPLETED) throw new BadRequestException('Cannot update completed ad');

    Object.assign(ad, dto);
    await ad.save();
    this.logger.log(`[Ads] updated | adId=${adId} | userId=${userId}`);
    return ad.toObject();
  }

  async pause(userId: string, adId: string): Promise<P2PAd> {
    const ad = await this.adModel.findOne({ adId });
    if (!ad) throw new NotFoundException(`Ad ${adId} not found`);
    if (ad.userId !== userId) throw new ForbiddenException('Not your ad');
    ad.status = AdStatus.PAUSED;
    await ad.save();
    return ad.toObject();
  }

  async resume(userId: string, adId: string): Promise<P2PAd> {
    const ad = await this.adModel.findOne({ adId });
    if (!ad) throw new NotFoundException(`Ad ${adId} not found`);
    if (ad.userId !== userId) throw new ForbiddenException('Not your ad');
    ad.status = AdStatus.ACTIVE;
    await ad.save();
    return ad.toObject();
  }

  async findByUser(userId: string) {
    return this.adModel.find({ userId }).sort({ createdAt: -1 }).lean();
  }

}

