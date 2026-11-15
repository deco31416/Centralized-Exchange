import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FiatSource =
    | 'EXCHANGERATE_API'
    | 'FRANKFURTER'
    | 'EXCHANGERATE_HOST'
    | 'FLOATRATES'
    | 'FAWAZ_CURRENCY';

@Schema({ timestamps: true, collection: 'fiat_pair_configurations' })
export class FiatPairConfiguration extends Document {
    @Prop({ required: true, uppercase: true })
    baseCurrency: string; // USD

    @Prop({ required: true, uppercase: true })
    quoteCurrency: string; // COP

    @Prop({ required: true, uppercase: true })
    pairCode: string; // USD_COP

    @Prop({ type: [String], default: ['EXCHANGERATE_API', 'FRANKFURTER', 'FLOATRATES', 'FAWAZ_CURRENCY'] })
    sources: FiatSource[];

    @Prop({ enum: ['AVERAGE', 'MAX', 'MIN', 'MEDIAN'], default: 'AVERAGE' })
    aggregationStrategy: 'AVERAGE' | 'MAX' | 'MIN' | 'MEDIAN';

    @Prop({ default: true })
    enabled: boolean;

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;
}

export const FiatPairConfigurationSchema = SchemaFactory.createForClass(FiatPairConfiguration);

FiatPairConfigurationSchema.index({ baseCurrency: 1, quoteCurrency: 1 }, { unique: true });
FiatPairConfigurationSchema.index({ pairCode: 1 }, { unique: true });
FiatPairConfigurationSchema.index({ enabled: 1 });
