import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import mongoose from "mongoose";
import { FormatResponse } from "src/decorators/formatResponse";
import { ObjectIdValidationPipe } from "src/validators/object.validator.pipe";
import { ValidateRequest } from "src/validators/validation";
import { JwtAuthGuard } from "../auth/jwt/jwt-auth.guard";
import { ReplyDTO, UpdateReplyDTO } from "./dto/reply.dto";
import { ReplyService } from "./reply.service";

@ApiTags("reviews/replies") // Tag for grouping the endpoints in Swagger
@Controller("reviews/replies")
@FormatResponse()
@ValidateRequest()
export class ReplyController {
  constructor(private readonly replyService: ReplyService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth() // Indicates that this endpoint requires JWT authentication
  @ApiOperation({ summary: "Create a reply" })
  @ApiBody({
    description: "The details of the reply to be created",
    type: ReplyDTO,
    examples: {
      example1: {
        summary: "Create a simple reply 1",
        value: {
          reviewId: "64c22b9f9a7b7c0f8c4e90e6",
          content: "This is a reply to the review.",
        },
      },
      example2: {
        summary: "Create a simple reply 2",
        value: {
          reviewId: "64c22b9f9a7b7c0f8c4e90e6",
          content: "This is a reply to the review.",
          parentReplyId: "64c22b9f9a7b7c0f8c4e90e7",
        },
      },
      example3: {
        summary: "Create a simple reply 3",
        value: {
          reviewId: "64c22b9f9a7b7c0f8c4e90e6",
          content: "This is a reply to the review.",
          parentReplyId: null,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: "Reply successfully created.",
    schema: {
      example: {
        id: "64d22b9f9a7b7c0f8c4e91a1",
        content: "This is a reply to the review.",
        reviewId: "64c22b9f9a7b7c0f8c4e90e6",
        parentReplyId: "64c22b9f9a7b7c0f8c4e90e7",
        userId: "64d22b9f9a7b7c0f8c4e90a0",
        createdAt: "2024-08-29T12:34:56.789Z",
        updatedAt: "2024-08-29T12:34:56.789Z",
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized. JWT token is missing or invalid.",
  })
  @ApiResponse({
    status: 500,
    description: "Internal server error.",
  })
  async postReply(@Request() req, @Body() replyDto: ReplyDTO) {
    return await this.replyService.createReply(req.user, replyDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all replies" })
  @ApiResponse({
    status: 200,
    description: "List of replies retrieved successfully.",
    schema: {
      example: [
        {
          id: "64d22b9f9a7b7c0f8c4e91a1",
          content: "This is a reply to the review.",
          reviewId: "64c22b9f9a7b7c0f8c4e90e6",
          parentReplyId: null,
          userId: "64d22b9f9a7b7c0f8c4e90a0",
          createdAt: "2024-08-29T12:34:56.789Z",
          updatedAt: "2024-08-29T12:34:56.789Z",
        },
        {
          id: "64d22b9f9a7b7c0f8c4e91a2",
          content: "This is another reply to the review.",
          reviewId: "64c22b9f9a7b7c0f8c4e90e6",
          parentReplyId: "64d22b9f9a7b7c0f8c4e91a1",
          userId: "64d22b9f9a7b7c0f8c4e90a1",
          createdAt: "2024-08-29T12:45:56.789Z",
          updatedAt: "2024-08-29T12:45:56.789Z",
        },
      ],
    },
  })
  @ApiResponse({
    status: 500,
    description: "Internal server error.",
  })
  async getReplies() {
    return await this.replyService.findRelies();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a reply by ID" })
  @ApiParam({
    name: "id",
    description: "The ID of the reply to retrieve",
    example: "64d22b9f9a7b7c0f8c4e91a1",
  })
  @ApiResponse({
    status: 200,
    description: "Reply retrieved successfully.",
    schema: {
      example: {
        id: "64d22b9f9a7b7c0f8c4e91a1",
        content: "This is a reply to the review.",
        reviewId: "64c22b9f9a7b7c0f8c4e90e6",
        parentReplyId: null,
        userId: "64d22b9f9a7b7c0f8c4e90a0",
        createdAt: "2024-08-29T12:34:56.789Z",
        updatedAt: "2024-08-29T12:34:56.789Z",
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "Reply not found.",
  })
  @ApiResponse({
    status: 500,
    description: "Internal server error.",
  })
  async getReplyById(
    @Param("id", ObjectIdValidationPipe) id: mongoose.Types.ObjectId
  ) {
    return await this.replyService.findReplyById(id);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete a reply by ID" })
  @ApiParam({
    name: "id",
    description: "The ID of the reply to delete",
    example: "64d22b9f9a7b7c0f8c4e91a1",
  })
  @ApiResponse({
    status: 200,
    description: "Reply successfully deleted.",
    schema: {
      example: {
        message: "Reply successfully deleted",
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "Reply not found.",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized. JWT token is missing or invalid.",
  })
  @ApiResponse({
    status: 500,
    description: "Internal server error.",
  })
  async deleteReply(
    @Param("id", ObjectIdValidationPipe) id: mongoose.Types.ObjectId
  ) {
    return await this.replyService.deleteReply(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update a reply by ID" })
  @ApiParam({
    name: "id",
    description: "The ID of the reply to update",
    example: "64d22b9f9a7b7c0f8c4e91a1",
  })
  @ApiBody({
    description: "The new content of the reply",
    type: UpdateReplyDTO,
    examples: {
      example1: {
        summary: "Update the content of a reply",
        value: {
          content: "Updated reply content.",
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: "Reply successfully updated.",
    schema: {
      example: {
        id: "64d22b9f9a7b7c0f8c4e91a1",
        content: "Updated reply content.",
        reviewId: "64c22b9f9a7b7c0f8c4e90e6",
        parentReplyId: null,
        userId: "64d22b9f9a7b7c0f8c4e90a0",
        createdAt: "2024-08-29T12:34:56.789Z",
        updatedAt: "2024-08-29T12:40:56.789Z",
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "Reply not found.",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized. JWT token is missing or invalid.",
  })
  @ApiResponse({
    status: 500,
    description: "Internal server error.",
  })
  async updateReply(
    @Param("id", ObjectIdValidationPipe) id: string,
    @Body() updateReplyDto: UpdateReplyDTO
  ) {
    return await this.replyService.updateReply(id, updateReplyDto);
  }
}
