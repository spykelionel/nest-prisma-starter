// src/auth/auth.service.ts

import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as argon2 from "argon2";
import { authenticator } from "otplib";
import { UsersService } from "../user/user.service";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await argon2.verify(user.password, password))) {
      if (!user.emailVerified) {
        throw new UnauthorizedException("Please verify your email first");
      }
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async generateTwoFactorSecret(userId: string) {
    const user = await this.usersService.findOne(userId);
    const secret = authenticator.generateSecret();
    await this.usersService.setTwoFactorSecret(userId, secret);
    const otpauthUrl = authenticator.keyuri(
      user.email,
      this.configService.get("APP_NAME"),
      secret
    );
    return { secret, otpauthUrl };
  }

  async verifyTwoFactorToken(userId: string, token: string) {
    const user = await this.usersService.findOne(userId);
    return authenticator.verify({
      token,
      secret: user.twoFactorSecret,
    });
  }

  async enableTwoFactor(userId: string) {
    const response = await this.usersService.enableTwoFactor(userId);
    return {
      message: `Two-factor authentication enabled for your account: ${response.firstName}`,
    };
  }
}
