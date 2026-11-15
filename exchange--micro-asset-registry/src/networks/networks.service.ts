import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Network } from './schemas/network.schema';
import { CreateNetworkDto, UpdateNetworkDto } from './dto/network.dto';

@Injectable()
export class NetworksService {
    constructor(
        @InjectModel(Network.name) private networkModel: Model<Network>,
    ) { }

    async create(createNetworkDto: CreateNetworkDto): Promise<Network> {
        const normalizedDto = {
            ...createNetworkDto,
            code: createNetworkDto.code.toUpperCase(),
        };

        try {
            const network = new this.networkModel(normalizedDto);
            return await network.save();
        } catch (error: any) {
            if (error.code === 11000) {
                throw new BadRequestException(`Network with code ${normalizedDto.code} already exists`);
            }
            throw error;
        }
    }

    async findAll(filters?: { kind?: string; enabled?: boolean }): Promise<Network[]> {
        const query: any = {};

        if (filters?.kind) {
            query.kind = filters.kind;
        }

        if (filters?.enabled !== undefined) {
            query.enabled = filters.enabled;
        }

        return this.networkModel.find(query).sort({ code: 1 }).exec();
    }

    async findOne(code: string): Promise<Network> {
        const network = await this.networkModel.findOne({ code: code.toUpperCase() }).exec();

        if (!network) {
            throw new NotFoundException(`Network with code ${code} not found`);
        }

        return network;
    }

    async update(code: string, updateNetworkDto: UpdateNetworkDto): Promise<Network> {
        const network = await this.networkModel
            .findOneAndUpdate(
                { code: code.toUpperCase() },
                { $set: updateNetworkDto },
                { new: true }
            )
            .exec();

        if (!network) {
            throw new NotFoundException(`Network with code ${code} not found`);
        }

        return network;
    }

    async enable(code: string): Promise<Network> {
        return this.update(code, { enabled: true });
    }

    async disable(code: string): Promise<Network> {
        return this.update(code, { enabled: false });
    }

    async delete(code: string): Promise<void> {
        const result = await this.networkModel.deleteOne({ code: code.toUpperCase() }).exec();

        if (result.deletedCount === 0) {
            throw new NotFoundException(`Network with code ${code} not found`);
        }
    }
}
