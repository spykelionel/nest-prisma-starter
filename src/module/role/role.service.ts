import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateRoleDto, UpdateRoleDto } from "./dto/role.dto";

@Injectable()
export class RoleService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createRoleDto: CreateRoleDto, authUser: any) {
    // the user creating the role comes with a list of business accounts. check if the business id in createRoleDto.businessId is among the list of business accounts the user owns or belongs to.
    // if not, throw forbidden exception because you are not allowed to create a role for another business account
    /**
     * Normally, the logic below should be handled in the ownnership guard.
     * So, move this logic into the ownership guard.
     */
    if (
      createRoleDto.businessId &&
      !authUser.businesses.some(
        (business: any) => business.id === createRoleDto.businessId
      )
    ) {
      throw new ForbiddenException(
        "You are not the owner of this business account."
      );
    }

    // check if role already exists for the same business account before creating it
    const roleExists = await this.prisma.role.findFirst({
      where: { name: createRoleDto.name },
    });

    if (roleExists) {
      throw new ConflictException(
        `Role with name ${roleExists.name} already exists`
      );
    }
    const user = await this.prisma.user.findUnique({
      where: { id: authUser?.id },
    });
    if (!user) {
      throw new ForbiddenException("You are not allowed to create a role");
    }

    if (createRoleDto.businessId) {
      const businessExists = await this.prisma.business.findUnique({
        where: { id: createRoleDto.businessId },
      });
      if (!businessExists) {
        throw new NotFoundException("Business not found");
      }
    }

    return this.prisma.role.create({
      data: {
        name: createRoleDto.name,
        permissions: createRoleDto.permissions,
        user: { connect: { id: authUser?.id } },
        business: createRoleDto?.businessId && {
          connect: { id: createRoleDto.businessId },
        },
      },
    });
  }
  async findAll() {
    return this.prisma.role.findMany();
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
    });
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto, userId: string) {
    const roleExists = await this.prisma.role.findUnique({ where: { id } });
    if (!roleExists) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isAdmin) {
      throw new ForbiddenException("Only admins can update roles");
    }

    try {
      const role = await this.prisma.role.update({
        where: { id },
        data: updateRoleDto,
      });
      return role;
    } catch (error) {
      if (error.code === "P2025") {
        throw new NotFoundException(`Role with ID ${id} not found`);
      }
      throw error;
    }
  }

  async remove(id: string, userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isAdmin) {
      throw new ForbiddenException("Only admins can delete roles");
    }

    try {
      const role = await this.prisma.role.delete({
        where: { id },
      });
      return role;
    } catch (error) {
      if (error.code === "P2025") {
        throw new NotFoundException(`Role with ID ${id} not found`);
      }
      throw error;
    }
  }
}
