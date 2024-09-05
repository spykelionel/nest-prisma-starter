// src/users/dto/create-user.dto.ts
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { PartialType } from "@nestjs/mapped-types";
import { AccountType } from "@prisma/client";
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from "class-validator";

export class CreateUserDto {
  @ApiProperty({
    description: "First name of the user",
    example: "John",
    minLength: 2,
    maxLength: 50,
  })
  @IsNotEmpty()
  @IsString()
  @Length(2, 50)
  firstName: string;

  @ApiProperty({
    description: "Last name of the user",
    example: "Doe",
    minLength: 2,
    maxLength: 50,
  })
  @IsNotEmpty()
  @IsString()
  @Length(2, 50)
  lastName: string;

  @ApiProperty({
    description: "Email address of the user",
    example: "john.doe@example.com",
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description:
      "Password of the user. Must contain at least 1 uppercase letter, 1 lowercase letter, 1 number or special character",
    example: "P@ssw0rd123",
    minLength: 8,
    maxLength: 32,
  })
  @IsNotEmpty()
  @IsString()
  @Length(8, 32)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number or special character",
  })
  password: string;

  @ApiProperty({
    description: "Account type of the user",
    example: "USER",
    enum: AccountType,
  })
  @IsNotEmpty()
  @IsEnum(AccountType)
  accountType: AccountType;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}

export class LoginDto {
  email: string;
  password: string;
}

export class UserImageUpload {
  @ApiPropertyOptional({
    description: "image of the user",
    type: "string",
    format: "binary",
  })
  @IsNotEmpty()
  image: Express.Multer.File;
}
