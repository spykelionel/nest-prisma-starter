import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
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
import { AccountType } from "@prisma/client";
import { ObjectIdValidationPipe } from "src/validators/object.validator.pipe";
import { ValidateRequest } from "src/validators/validation";
import { JwtAuthGuard } from "../auth/jwt/jwt-auth.guard";
import { Roles } from "../auth/role/roles.decorator";
import { RolesGuard } from "../auth/role/roles.guard";
import { CreateRoleDto, UpdateRoleDto } from "./dto/role.dto";
import { RoleService } from "./role.service";

// TODO: Add ownership guard here
@ApiTags("Roles")
@Controller("")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ValidateRequest()
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(AccountType.BUSINESS, AccountType.ADMIN)
  @ApiOperation({ summary: "Create a new Role" })
  @ApiResponse({
    status: 201,
    description: "The Role has been successfully created.",
    type: CreateRoleDto,
  })
  @ApiResponse({ status: 400, description: "Invalid input" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiBody({ type: CreateRoleDto })
  async create(@Req() req, @Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: "Retrieve all Roles" })
  @ApiResponse({
    status: 200,
    description: "List of all Roles",
    type: [CreateRoleDto],
  })
  async findAll() {
    return this.roleService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Retrieve a Role by ID" })
  @ApiParam({ name: "id", description: "ID of the Role to retrieve" })
  @ApiResponse({
    status: 200,
    description: "The Role with the specified ID",
    type: CreateRoleDto,
  })
  @ApiResponse({ status: 404, description: "Role not found" })
  async findOne(@Param("id", ObjectIdValidationPipe) id: string) {
    return this.roleService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(RolesGuard)
  @Roles(AccountType.BUSINESS, AccountType.ADMIN)
  @ApiOperation({ summary: "Update a Role by ID" })
  @ApiParam({ name: "id", description: "ID of the Role to update" })
  @ApiResponse({
    status: 200,
    description: "The Role has been successfully updated.",
    type: UpdateRoleDto,
  })
  @ApiResponse({ status: 404, description: "Role not found" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiBody({ type: UpdateRoleDto })
  async update(
    @Request() req,
    @Param("id", ObjectIdValidationPipe) id: string,
    @Body() updateRoleDto: UpdateRoleDto
  ) {
    return this.roleService.update(id, updateRoleDto, req.user.id);
  }

  @Delete(":id")
  @UseGuards(RolesGuard)
  @Roles(AccountType.BUSINESS, AccountType.ADMIN)
  @ApiOperation({ summary: "Delete a Role by ID" })
  @ApiParam({ name: "id", description: "ID of the Role to delete" })
  @ApiResponse({
    status: 200,
    description: "The Role has been successfully deleted.",
  })
  @ApiResponse({ status: 404, description: "Role not found" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async remove(
    @Request() req,
    @Param("id", ObjectIdValidationPipe) id: string
  ) {
    return this.roleService.remove(id, req.user.id);
  }
}
