import { Injectable } from "@nestjs/common";
// import { PrismaService } from '../prisma/prisma.service';
// import { CreateStaffProfileDto, UpdateStaffProfileDto } from './dto/staff.dto';
import { PrismaService } from "src/prisma/prisma.service";
import { CreateStaffProfileDto, UpdateStaffProfileDto } from "./dto/staff.dto";

@Injectable()
export class StaffProfileService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateStaffProfileDto) {
    return await this.prisma.staffProfile.create({ data });
  }

  async findAll(businessId: string) {
    return await this.prisma.staffProfile.findMany();
  }

  async findOne(id: string) {
    return await this.prisma.staffProfile.findUnique({ where: { id } });
  }

  async update(id: string, data: UpdateStaffProfileDto) {
    return await this.prisma.staffProfile.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return await this.prisma.staffProfile.delete({ where: { id } });
  }
}
