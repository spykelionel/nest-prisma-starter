import { PartialType } from "@nestjs/mapped-types";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsMongoId, IsOptional, IsString } from "class-validator";

export class ReplyDTO {
  @ApiProperty({
    description: "The ID of the review to which the reply is associated",
    example: "64c22b9f9a7b7c0f8c4e90e6",
    type: String,
  })
  @IsMongoId()
  reviewId: string;

  @ApiPropertyOptional({
    description:
      "The ID of the parent reply, if this reply is a response to another reply",
    example: "64c22b9f9a7b7c0f8c4e90e7",
    type: String,
  })
  @IsOptional()
  @IsMongoId()
  parentReplyId?: string;

  @ApiProperty({
    description: "The content of the reply",
    example: "Thank you for your feedback!",
    type: String,
  })
  @IsString()
  content: string;
}

export class UpdateReplyDTO extends PartialType(ReplyDTO) {}
