import { Injectable } from '@nestjs/common';
import { CreateDomainDto } from './dto/create-domain.dto';
import { UpdateDomainDto } from './dto/update-domain.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CacheService } from 'src/cache/cache.service';

@Injectable()
export class DomainService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  create(createDomainDto: CreateDomainDto) {
    return this.prisma.domain.create({ data: createDomainDto });
  }

  findAll() {
    return `This action returns all domain`;
  }

  findAllByOrg(orgID: string) {
    return this.prisma.domain.findMany({
      where: { orgID },
    });
  }

  findOne(id: string) {
    return `This action returns a #${id} domain`;
  }

  update(id: string, updateDomainDto: UpdateDomainDto) {
    return this.prisma.domain.update({ where: { id }, data: updateDomainDto });
  }

  remove(id: string) {
    return this.prisma.domain.delete({ where: { id } });
  }
}
