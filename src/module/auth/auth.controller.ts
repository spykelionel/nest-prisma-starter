// src/auth/auth.controller.ts

import { Body, Controller, Post, Request, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./jwt/jwt-auth.guard";
import { LocalAuthGuard } from "./Local/local-auth.guard";

@ApiTags("Authentication")
@ApiBearerAuth()
@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post("login")
  @ApiOperation({ summary: "Login and return a JWT token" })
  @ApiBody({
    description: "Login credentials",
    type: Object,
  })
  @ApiResponse({
    status: 200,
    description: "Returns the JWT token",
    schema: {
      example: {
        accessToken: "your-jwt-token",
      },
    },
  })
  @ApiResponse({ status: 401, description: "Invalid credentials" })
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post("two-factor/generate")
  @ApiOperation({ summary: "Generate a new two-factor authentication secret" })
  @ApiResponse({
    status: 200,
    description: "Returns the two-factor authentication secret",
    schema: {
      example: {
        secret: "your-two-factor-secret",
      },
    },
  })
  @ApiResponse({ status: 401, description: "Unauthorized, invalid JWT token" })
  async generateTwoFactorSecret(@Request() req) {
    return this.authService.generateTwoFactorSecret(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post("two-factor/verify")
  @ApiOperation({ summary: "Verify the two-factor authentication token" })
  @ApiBody({
    description: "Two-factor authentication token",
    type: Object,
  })
  @ApiResponse({
    status: 200,
    description: "Returns success message if token is valid",
    schema: {
      example: {
        message: "Two-factor authentication token verified successfully",
      },
    },
  })
  @ApiResponse({ status: 400, description: "Invalid token" })
  @ApiResponse({ status: 401, description: "Unauthorized, invalid JWT token" })
  async verifyTwoFactorToken(@Request() req, @Body("token") token: string) {
    return this.authService.verifyTwoFactorToken(req.user.id, token);
  }

  @UseGuards(JwtAuthGuard)
  @Post("two-factor/enable")
  @ApiOperation({ summary: "Enable two-factor authentication for the user" })
  @ApiResponse({
    status: 200,
    description:
      "Returns success message if two-factor authentication is enabled",
    schema: {
      example: {
        message: "Two-factor authentication enabled successfully",
      },
    },
  })
  @ApiResponse({ status: 401, description: "Unauthorized, invalid JWT token" })
  async enableTwoFactor(@Request() req) {
    return this.authService.enableTwoFactor(req.user.id);
  }
}
