import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { AccountType } from "@prisma/client";
import { diskStorage } from "multer";
import { extname } from "path";
import { ObjectIdValidationPipe } from "src/validators/object.validator.pipe";
import { ValidateRequest } from "src/validators/validation";
import { JwtAuthGuard } from "../auth/jwt/jwt-auth.guard";
import { Roles } from "../auth/role/roles.decorator";
import { RolesGuard } from "../auth/role/roles.guard";
import {
  CreateUserDto,
  LoginDto,
  UpdateUserDto,
  UserImageUpload,
} from "./dto/user.dto";
import { UsersService } from "./user.service";

@ApiTags("Users")
@ApiBearerAuth()
@Controller("users")
@ValidateRequest()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: "Create a new user" })
  @ApiResponse({
    status: 201,
    description: "The user has been created successfully.",
    type: CreateUserDto,
  })
  @ApiResponse({ status: 400, description: "Invalid input" })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Retrieve all users" })
  @ApiResponse({
    status: 200,
    description: "List of all users",
    type: [CreateUserDto],
  })
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  @Roles(AccountType.BUSINESS, AccountType.USER)
  @ApiOperation({ summary: "Retrieve a user by ID" })
  @ApiParam({ name: "id", description: "ID of the user to retrieve" })
  @ApiResponse({
    status: 200,
    description: "The user with the specified ID",
    type: CreateUserDto,
  })
  @ApiResponse({ status: 404, description: "User not found" })
  async findOne(@Param("id", ObjectIdValidationPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Get("profile")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Retrieve a user profile" })
  @ApiResponse({
    status: 200,
    description: "The authenticated user profile was successfully retrieved",
    type: CreateUserDto,
  })
  @ApiResponse({ status: 404, description: "User not found" })
  async getProfile(@Request() req) {
    return this.usersService.findOne(req.user.id);
  }
  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  // @Roles(AccountType.BUSINESS, AccountType.USER)
  @ApiOperation({ summary: "Update a user by ID" })
  @ApiParam({ name: "id", description: "ID of the user to update" })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: "The user has been updated successfully.",
    type: UpdateUserDto,
  })
  @ApiResponse({
    status: 403,
    description:
      "Forbidden. Only update your own profile or if you are an admin",
  })
  @ApiResponse({ status: 404, description: "User not found" })
  async update(
    @Param("id", ObjectIdValidationPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req
  ) {
    if (!req.user) {
      throw new UnauthorizedException(
        "You are not authorized to update this user"
      );
    }
    if (req.user.id !== id && !req.user.isAdmin) {
      throw new ForbiddenException("You can only update your own profile");
    }

    return this.usersService.update(req.user.id, updateUserDto);
  }

  @Patch("create/admin/:id")
  @UseGuards(JwtAuthGuard)
  // @Roles(AccountType.BUSINESS, AccountType.USER)
  @ApiOperation({ summary: "Update a user by ID" })
  @ApiBearerAuth()
  @ApiParam({ name: "id", description: "ID of the user to make admin" })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: "The user has been updated successfully.",
    type: UpdateUserDto,
  })
  @ApiResponse({
    status: 403,
    description:
      "Forbidden. Only update your own profile or if you are an admin",
  })
  @ApiResponse({ status: 404, description: "User not found" })
  async createAdminUser(@Param("id", ObjectIdValidationPipe) id: string) {
    // // Check if the user is updating their own profile or if they're an admin
    // if (req.user.id !== id && !req.user.isAdmin) {
    //   throw new ForbiddenException("You can only update your own profile");
    // }
    console.log("ID of user", id);
    return await this.usersService.createAdmin(id);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AccountType.BUSINESS)
  @ApiOperation({ summary: "Delete a user by ID" })
  @ApiParam({ name: "id", description: "ID of the user to delete" })
  @ApiResponse({
    status: 200,
    description: "The user has been deleted successfully.",
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden. Only admins can delete users",
  })
  @ApiResponse({ status: 404, description: "User not found" })
  async remove(
    @Param("id", ObjectIdValidationPipe) id: string,
    @Request() req
  ) {
    // Only allow admins to delete users
    if (!req.user.isAdmin) {
      throw new ForbiddenException("Only admins can delete users");
    }
    return this.usersService.remove(id);
  }

  @Post("verify-email")
  @ApiOperation({ summary: "Verify user email" })
  @ApiBody({
    description: "Token used to verify the email",
    type: String,
    examples: {
      example: { value: "verificationToken123", summary: "Example token" },
    },
  })
  @ApiResponse({
    status: 200,
    description: "Email has been verified successfully.",
  })
  @ApiResponse({ status: 400, description: "Invalid or expired token" })
  verifyEmail(@Body("token") token: string) {
    return this.usersService.verifyEmail(token);
  }

  @Post("request-password-reset")
  @ApiOperation({ summary: "Request a password reset" })
  @ApiBody({
    description: "Email address for the password reset request",
    type: String,
    examples: {
      example: { value: "user@example.com", summary: "Example email" },
    },
  })
  @ApiResponse({
    status: 200,
    description: "Password reset request has been sent.",
  })
  @ApiResponse({ status: 400, description: "Invalid email address" })
  requestPasswordReset(@Body("email") email: string) {
    return this.usersService.requestPasswordReset(email);
  }

  @Post("reset-password")
  @ApiOperation({ summary: "Reset user password" })
  @ApiBody({
    description: "Token and new password to reset the password",
  })
  @ApiResponse({
    status: 200,
    description: "Password has been reset successfully.",
  })
  @ApiResponse({ status: 400, description: "Invalid token or password" })
  resetPassword(
    @Body("token") token: string,
    @Body("newPassword") newPassword: string
  ) {
    return this.usersService.resetPassword(token, newPassword);
  }

  @Post("login")
  @ApiOperation({ summary: "Login a user" })
  @ApiBody({
    description: "The login credentials",
    type: LoginDto,
    examples: {
      example: {
        value: { email: "john.doe@example.com", password: "P@ssw0rd123" },
        summary: "Example login credentials",
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: "The user has been logged in successfully.",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized. Invalid email or password.",
  })
  async login(@Body() loginDto: LoginDto) {
    try {
      return await this.usersService.login(loginDto);
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  @Patch("upload-image/:id")
  @UseGuards(JwtAuthGuard)
  @ApiBody({ type: UserImageUpload })
  @UseInterceptors(
    FileInterceptor("image", {
      storage: diskStorage({
        destination: "./uploads/user",
        filename: (req, file, cb) => {
          const fileExtName = extname(file.originalname);
          cb(null, `${file.fieldname}-${Date.now()}${fileExtName}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
    })
  )
  @ApiOperation({ summary: "Upload user image" })
  @ApiConsumes("multipart/form-data")
  @ApiParam({ name: "id", description: "ID of the user to update" })
  @ApiResponse({
    status: 200,
    description: "The user has been successfully updated.",
  })
  @ApiResponse({ status: 404, description: "user not found" })
  uploadGuest(
    @Param("id", ObjectIdValidationPipe) id: string,
    @UploadedFile() image: Express.Multer.File
  ) {
    return this.usersService.uploadUserImage(id, image);
  }
}
