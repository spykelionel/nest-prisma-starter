import { PartialType } from "@nestjs/mapped-types";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsObject, IsOptional, IsString } from "class-validator";

// DTO for creating a Role entry
export class CreateRoleDto {
  @ApiProperty({
    example: "Manager",
    description: "The name of the role",
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: {
      reservations: ["create", "read", "update", "delete"],
      floorPlans: ["create", "read", "update", "delete"],
      guests: ["create", "read", "update", "delete"],
      settings: ["create", "read", "update", "delete"],
    },
    description: "The permissions associated with the role",
  })
  @IsObject()
  @IsNotEmpty()
  permissions: {
    reservations?: string[];
    floorPlans?: string[];
    guests?: string[];
    settings?: string[];
  };

  @ApiProperty({
    example: "611c7c8f4c32de6c88a1b4c2",
    description: "The ID of the associated business",
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  businessId: string;
}

// DTO for updating a Role entry
export class UpdateRoleDto extends PartialType(CreateRoleDto) {}
