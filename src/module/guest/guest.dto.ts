import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";
import mongoose from "mongoose";
import { IsObjectId } from "src/validators/schema.validator.pipe";

export class GuestDto {
  @ApiProperty({ description: "Name of the guest", example: "John Doe" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: "Email of the guest",
    example: "guest@example.com",
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: "Id of the business the guest belongs to",
    example: "66d2c0548dc61b7b8867b728",
  })
  @IsNotEmpty()
  @IsObjectId()
  businessId: mongoose.Types.ObjectId;

  @ApiPropertyOptional({
    description: "Additional notes for the guest",
    example: "Vegetarian",
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class GuestImageUpload {
  @ApiPropertyOptional({
    description: "image of the guest",
    type: "string",
    format: "binary",
  })
  @IsNotEmpty()
  image: Express.Multer.File;
}
