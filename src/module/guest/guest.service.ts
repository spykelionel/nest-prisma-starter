import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

import { readFileSync } from "fs";
import { unlink } from "fs/promises";
import { FileUploadService } from "src/core/file-upload.service";
import { GuestDto } from "./guest.dto";

@Injectable()
export class GuestService {
  constructor(
    private prisma: PrismaService,
    private fileUploadService: FileUploadService
  ) {}

  // Create a new guest
  async createGuest(createGuestDto: GuestDto): Promise<any> {
    const guestExists = await this.prisma.guest.findFirst({
      where: {
        email: createGuestDto.email,
      },
    });

    const businessExists = await this.prisma.business.findFirst({
      where: {
        id: createGuestDto.businessId as unknown as string,
      },
    });

    if (!businessExists) {
      return new NotFoundException(
        ` Business not found for guest ${createGuestDto.businessId}`
      );
    }

    if (guestExists) {
      throw new ConflictException("Guest with this email already exists");
    }

    try {
      const newGuest = await this.prisma.guest.create({
        data: {
          name: createGuestDto.name,
          email: createGuestDto.email,
          notes: createGuestDto.notes ?? undefined,
          business: {
            connect: { id: createGuestDto.businessId as unknown as string },
          },
        },
      });

      return newGuest;
    } catch (error) {
      console.log("Creating guest failed", error);
      throw new InternalServerErrorException("Something went wrong");
    }
  }

  // Get all guests
  async getAllGuests(): Promise<any> {
    try {
      return await this.prisma.guest.findMany();
    } catch (error) {
      console.log("Fetching all guests failed", error);
      throw new InternalServerErrorException("Something went wrong");
    }
  }

  // Get a guest by ID
  async getGuestById(id: string): Promise<any> {
    try {
      const guest = await this.prisma.guest.findUnique({
        where: { id },
      });

      if (!guest) {
        throw new NotFoundException(`Guest with ID ${id} not found`);
      }

      return guest;
    } catch (error) {
      console.log("Fetching guest by ID failed", error);
      throw new InternalServerErrorException("Something went wrong");
    }
  }

  // Update a guest by ID
  async updateGuest(
    id: string,
    updateGuestDto: Partial<GuestDto>
  ): Promise<any> {
    try {
      const guest = await this.prisma.guest.findUnique({
        where: { id },
      });

      if (!guest) {
        throw new NotFoundException(`Guest with ID ${id} not found`);
      }

      // Handle email conflict if updating the email
      if (updateGuestDto.email && updateGuestDto.email !== guest.email) {
        const emailConflict = await this.prisma.guest.findFirst({
          where: { email: updateGuestDto.email },
        });

        if (emailConflict) {
          throw new ConflictException(
            `Guest with email ${updateGuestDto.email} already exists`
          );
        }
      }

      const updatedGuest = await this.prisma.guest.update({
        where: { id },
        data: {
          //   ...updateGuestDto,
          name: updateGuestDto.name ?? guest.name,
          email: updateGuestDto.email ?? guest.email,
          notes: updateGuestDto.notes ?? guest.notes,
          business: updateGuestDto.businessId
            ? {
                connect: { id: updateGuestDto.businessId as unknown as string },
              }
            : undefined,
        },
      });

      return updatedGuest;
    } catch (error) {
      console.log("Updating guest failed", error);
      throw new InternalServerErrorException("Something went wrong");
    }
  }

  // Delete a guest by ID
  async deleteGuest(id: string): Promise<any> {
    try {
      const guest = await this.prisma.guest.findUnique({
        where: { id },
      });

      if (!guest) {
        throw new NotFoundException(`Guest with ID ${id} not found`);
      }

      await this.prisma.guest.delete({
        where: { id },
      });

      return { message: `Guest with ID ${id} deleted successfully` };
    } catch (error) {
      console.log("Deleting guest failed", error);
      throw new InternalServerErrorException("Something went wrong");
    }
  }

  async uploadGuestImage(id: string, image: Express.Multer.File) {
    if (!image) {
      return new HttpException(
        "Missing file field: image",
        HttpStatus.UNPROCESSABLE_ENTITY
      );
    }
    const buffer = readFileSync(image.path); // Read the file as buffer
    const guest = await this.prisma.guest.findFirst({ where: { id } });
    if (!guest) {
      throw new NotFoundException(`Guest with ID ${id} not found`);
    }
    let imageUrl = null;
    if (image) {
      imageUrl = await this.fileUploadService.uploadImage(buffer);
    }
    // if successfully upload, remove the image from the server..
    if (imageUrl !== null) {
      unlink(image.path)
        .then(() => {
          console.log("successfully unlinked the file");
        })
        .catch((err) => {
          console.log("ERROR unlinking file", err);
        });
    }

    return this.prisma.guest.update({
      where: { id },
      data: {
        image: imageUrl,
      },
    });
  }
}
