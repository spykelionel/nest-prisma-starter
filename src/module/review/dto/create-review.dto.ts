import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";
import { Types } from "mongoose";

export class CreateReviewDto {
  @ApiProperty({
    description: "Business ID",
    example: "64c22b9f9a7b7c0f8c4e90e6",
    required: true,
  })
  @IsMongoId()
  businessId: Types.ObjectId;

  @ApiPropertyOptional({
    description: "Guest ID who made the review (optional)",
    example: "64c22b9f9a7b7c0f8c4e90e7",
  })
  @IsOptional()
  @IsMongoId()
  guestId?: Types.ObjectId;

  @ApiProperty({
    description: "Rating for the review, from 0 to 5",
    example: 4.5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  rating?: number;

  @ApiProperty({
    description: "Food rating, optional",
    example: 5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  food?: number;

  @ApiProperty({
    description: "Staff rating, optional",
    example: 4,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  staff?: number;

  @ApiProperty({
    description: "Ambience rating, optional",
    example: 5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  ambience?: number;

  @ApiProperty({
    description: "Optional comment for the review",
    example: "Updated comment",
    required: false,
  })
  @IsOptional()
  @IsString()
  comment?: string;
}
