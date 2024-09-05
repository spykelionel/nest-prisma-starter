import { PartialType } from "@nestjs/mapped-types";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";

export class CreateStaffProfileDto {
  @ApiProperty({
    example: "60d5ecb74e0411f99ad8a588",
    description: "The ID of the user associated with this staff profile",
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    example: "60d5ecb74e0411f99ad8a589",
    description: "The ID of the business associated with this staff profile",
  })
  @IsString()
  @IsNotEmpty()
  businessId: string;

  @ApiProperty({
    example: "60d5ecb74e0411f99ad8a590",
    description: "The ID of the role associated with this staff profile",
  })
  @IsString()
  @IsNotEmpty()
  roleId: string;

  @ApiProperty({
    example: "2023-06-15T00:00:00.000Z",
    description: "The start date of the staff profile",
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  startDate?: Date;

  @ApiProperty({
    example: "2024-06-15T00:00:00.000Z",
    description: "The end date of the staff profile",
    required: false,
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  endDate?: Date;

  @ApiProperty({
    example: true,
    description: "Whether the staff profile is active",
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateStaffProfileDto extends PartialType(CreateStaffProfileDto) {}
