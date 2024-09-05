import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import mongoose, { Types } from "mongoose";
import { PrismaService } from "src/prisma/prisma.service";
import { ReplyDTO, UpdateReplyDTO } from "./dto/reply.dto";

@Injectable()
export class ReplyService {
  constructor(private prisma: PrismaService) {}

  async createReply(user: any, replyDto: ReplyDTO): Promise<any> {
    const reviewId = replyDto.reviewId;
    const content = replyDto.content;
    if (
      !((reviewId as any) instanceof Types.ObjectId) ||
      (replyDto.parentReplyId &&
        !((replyDto.parentReplyId as any) instanceof Types.ObjectId))
    ) {
      return new BadRequestException("Invalid Id");
    }

    try {
      return await this.prisma.reply.create({
        data: {
          content,
          review: { connect: { id: reviewId as unknown as string } },
          parentReply: replyDto.parentReplyId
            ? { connect: { id: replyDto.parentReplyId as unknown as string } }
            : undefined,
          user: {
            connect: { id: user.id },
          },
        },
        include: {
          user: true,
          parentReply: true,
          review: true,
          subReplies: true,
        },
      });
      //   return reply;
    } catch (error) {
      console.log("Create Reply", error);
      return new InternalServerErrorException({
        message: "Something went wrong!",
      });
    }
  }

  async findRelies() {
    try {
      const replies = await this.prisma.reply.findMany({
        where: { deleted: false },
        include: {
          user: true,
          parentReply: true,
          review: true,
          subReplies: true,
        },
      });

      return replies;
    } catch (error) {
      console.error("Error in findRelies:", error);
      throw new InternalServerErrorException("Failed to fetch replies");
    }
  }

  async findReplyById(replyId: mongoose.Types.ObjectId) {
    const reply = await this.prisma.reply.findFirst({
      where: { id: replyId as unknown as string, deleted: false },
      include: {
        user: true,
        parentReply: true,
        review: true,
        subReplies: true,
      },
    });
    if (!reply) {
      return new NotFoundException(`Reply with ID ${replyId} not found`);
    }
    return reply;
  }

  async updateReply(
    replyId: string,
    updateReplyDto: UpdateReplyDTO
  ): Promise<any> {
    try {
      const existingReply = await this.prisma.reply.findUnique({
        where: { id: replyId },
      });
      if (!existingReply) {
        return new NotFoundException(`Reply with ID ${replyId} not found`);
      }
      const updatedReply = await this.prisma.reply.update({
        where: { id: replyId },
        data: {
          review: updateReplyDto.reviewId
            ? {
                connect: {
                  id:
                    (updateReplyDto.reviewId as unknown as string) ??
                    existingReply.id,
                },
              }
            : undefined,
          content: updateReplyDto.content,
          originalContent: existingReply.content,
          edited: true,
        },
        include: {
          user: true,
          parentReply: true,
          review: true,
          subReplies: true,
        },
      });
      delete updatedReply.deleted;
      delete updatedReply.originalContent;
      return updatedReply;
    } catch (error) {
      console.log("Update reply error", error);
      return new InternalServerErrorException({
        message: "Something went wrong while updating the reply!",
      });
    }
  }

  async deleteReply(replyId: mongoose.Types.ObjectId): Promise<any> {
    try {
      const existingReply = await this.prisma.reply.findUnique({
        where: { id: replyId as unknown as string },
      });
      if (!existingReply) {
        return new NotFoundException(`Reply with ID ${replyId} not found`);
      }
      const deletedReply = await this.prisma.reply.update({
        where: { id: replyId as unknown as string },
        data: {
          deleted: true,
        },
        include: {
          user: true,
          parentReply: true,
          review: true,
          subReplies: true,
        },
      });
      delete deletedReply.deleted;
      delete deletedReply.originalContent;
      return deletedReply;
    } catch (error) {
      console.log("Delete Reply", error);
      return new InternalServerErrorException({
        message: "Something went wrong while Deleting the reply!",
      });
    }
  }
}
