import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { AccountType } from "@prisma/client";
import { ObjectIdValidationPipe } from "src/validators/object.validator.pipe";
import { ValidateRequest } from "src/validators/validation";
import { JwtAuthGuard } from "../auth/jwt/jwt-auth.guard";
import { Roles } from "../auth/role/roles.decorator";
import { CreateStaffProfileDto, UpdateStaffProfileDto } from "./dto/staff.dto";
import { StaffProfileService } from "./staff.service";

@ApiTags("Staff Profiles")
@Controller("")
@ApiBearerAuth()
@ValidateRequest()
@UseGuards(JwtAuthGuard)
export class StaffProfileController {
  constructor(private readonly staffService: StaffProfileService) {}

  @Post()
  @Roles(AccountType.ADMIN)
  @ApiOperation({ summary: "Create a new staff profile" })
  @ApiResponse({
    status: 201,
    description: "The staff profile has been successfully created.",
  })
  createStaff(@Body() createStaffProfileDto: CreateStaffProfileDto) {
    return this.staffService.create(createStaffProfileDto);
  }

  @Get()
  //   @Roles(AccountType.ADMIN, AccountType.MANAGER)
  @ApiOperation({ summary: "Get all staff profiles" })
  @ApiResponse({ status: 200, description: "Return all staff profiles." })
  findAllStaff(@Query("businessId") businessId?: string) {
    return this.staffService.findAll(businessId);
  }

  @Get(":id")
  //   @Roles(AccountType.ADMIN, )
  @ApiOperation({ summary: "Get a staff profile by id" })
  @ApiResponse({ status: 200, description: "Return the staff profile." })
  findOneStaff(@Param("id", ObjectIdValidationPipe) id: string) {
    return this.staffService.findOne(id);
  }

  @Patch(":id")
  //   @Roles(AccountType.ADMIN)
  @ApiOperation({ summary: "Update a staff profile" })
  @ApiResponse({
    status: 200,
    description: "The staff profile has been successfully updated.",
  })
  updateStaff(
    @Param("id", ObjectIdValidationPipe) id: string,
    @Body() updateStaffProfileDto: UpdateStaffProfileDto
  ) {
    return this.staffService.update(id, updateStaffProfileDto);
  }

  @Delete(":id")
  @Roles(AccountType.ADMIN)
  @ApiOperation({ summary: "Delete a staff profile" })
  @ApiResponse({
    status: 200,
    description: "The staff profile has been successfully deleted.",
  })
  removeStaff(@Param("id", ObjectIdValidationPipe) id: string) {
    return this.staffService.remove(id);
  }
}
