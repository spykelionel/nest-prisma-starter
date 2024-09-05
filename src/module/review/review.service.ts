import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateReviewDto } from "./dto/create-review.dto";
import { UpdateReviewDto } from "./dto/update-review.dto";

@Injectable()
export class ReviewService {
  constructor(private prisma: PrismaService) {}

  async create(createReviewDto: CreateReviewDto, user: any) {
    // Check if either userId or guestId is present
    // check if business exists
    console.log("USER: ", user);
    const business = await this.prisma.business.findFirst({
      where: { id: createReviewDto.businessId as unknown as string },
    });
    if (!business) {
      return new NotFoundException("Business not found.");
    }

    const guest = await this.prisma.guest.findFirst({
      where: { id: createReviewDto.guestId as unknown as string },
    });
    if (!guest) {
      return new NotFoundException("No Guest with such ID found.");
    }

    if (!user && !createReviewDto.guestId) {
      return new BadRequestException(
        "Either userId or guestId must be provided."
      );
    }

    // Ensure that if both userId and guestId are provided, only one is used
    if (user && createReviewDto.guestId) {
      return new BadRequestException(
        "You cannot provide both userId and guestId."
      );
    }

    const data: any = {
      rating: createReviewDto.rating,
      food: createReviewDto.food,
      staff: createReviewDto.staff,
      ambience: createReviewDto.ambience,
      comment: createReviewDto.comment,
      business: {
        connect: { id: createReviewDto.businessId as unknown as string },
      },
    };

    // Connect to user or guest based on provided IDs
    if (user) {
      data.user = {
        connect: { id: user.id as unknown as string },
      };
    } else if (createReviewDto.guestId) {
      data.guest = {
        connect: { id: createReviewDto.guestId as unknown as string },
      };
    }

    try {
      const newReview = await this.prisma.review.create({
        data,
        include: { business: true },
      });
      return newReview;
    } catch (error) {
      console.log("Creating review failed", error);
      throw new InternalServerErrorException("Something went wrong");
    }
  }

  async createGuestReview(createReviewDto: CreateReviewDto) {
    const business = await this.prisma.business.findFirst({
      where: { id: createReviewDto.businessId as unknown as string },
    });
    if (!business) {
      return new NotFoundException("Business not found.");
    }

    const guest = await this.prisma.guest.findFirst({
      where: { id: createReviewDto.guestId as unknown as string },
    });
    if (!guest) {
      return new NotFoundException("No Guest with such ID found.");
    }

    if (!createReviewDto.guestId) {
      return new BadRequestException(
        "Either userId or guestId must be provided."
      );
    }

    try {
      const newReview = await this.prisma.review.create({
        data: {
          rating: createReviewDto.rating,
          food: createReviewDto.food ?? undefined,
          staff: createReviewDto.staff ?? undefined,
          ambience: createReviewDto.ambience ?? undefined,
          comment: createReviewDto.comment,
          business: {
            connect: { id: createReviewDto.businessId as unknown as string },
          },
          guest: {
            connect: { id: createReviewDto.guestId as unknown as string },
          },
        },
        include: { business: true },
      });
      return newReview;
    } catch (error) {
      console.log("Creating review failed", error);
      throw new InternalServerErrorException("Something went wrong");
    }
  }

  async findAll() {
    return this.prisma.review.findMany({
      include: {
        user: true,
        guest: true,
        replies: true,
        _count: true,
        business: true,
      },
    });
  }

  async findOne(id: string) {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: {
        user: true,
        guest: true,
        replies: true,
        business: true,
      },
    });
    if (!review) {
      return new NotFoundException(`Review with ID ${id} not found`);
    }
    return review;
  }

  async update(id: string, updateReviewDto: UpdateReviewDto, user) {
    const review = await this.prisma.review.findUnique({ where: { id } });

    if (!review) {
      return new NotFoundException(`Review with ID ${id} not found`);
    }

    if (review.userId !== user.id && review.guestId !== user.id) {
      return new ForbiddenException("You can only update your own reviews");
    }

    const updatedReview = await this.prisma.review.update({
      where: { id },
      data: {
        rating: updateReviewDto.rating,
        food: updateReviewDto.food,
        staff: updateReviewDto.staff,
        ambience: updateReviewDto.ambience,
        comment: updateReviewDto.comment,
      },
    });
    return updatedReview;
  }

  async remove(id: string) {
    const review = await this.prisma.review.findUnique({ where: { id } });

    if (!review) {
      return new NotFoundException(`Review with ID ${id} not found`);
    }

    return this.prisma.review.delete({ where: { id } });
  }
}
