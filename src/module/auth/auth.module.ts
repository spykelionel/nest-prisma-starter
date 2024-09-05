// src/auth/auth.module.ts

import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { FileUploadService } from "src/core/file-upload.service";
import { ImageManipulationService } from "src/core/image-manipulation.service";
import { EmailService } from "../email/email.service";
import { SharedModule } from "../shared/ShareModule.module";
import { UserModule } from "../user/user.module";
import { UsersService } from "../user/user.service";
import { AuthController } from "./auth.controller"; // Import the AuthController
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./jwt/jwt.strategy";
import { LocalStrategy } from "./Local/local.strategy";

@Module({
  imports: [
    UserModule,
    PassportModule,
    SharedModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get("JWT_SECRET"),
        signOptions: { expiresIn: "60m" },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    UsersService,
    EmailService,
    FileUploadService,
    ImageManipulationService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
