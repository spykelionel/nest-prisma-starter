import { MiddlewareConsumer, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { ThrottlerModule, ThrottlerModuleOptions } from "@nestjs/throttler";
import { SecureHeadersMiddleware } from "./common/secure-headers.middleware";
import { FileUploadService } from "./core/file-upload.service";
import { ImageManipulationService } from "./core/image-manipulation.service";
import { AuthModule } from "./module/auth/auth.module";

import { CategoryModule } from "./module/category/category.module";
import { EmailModule } from "./module/email/email.module";
import { EmailService } from "./module/email/email.service";

import { GuestModule } from "./module/guest/guest.module";

import { ReplyModule } from "./module/reply/reply.module";

import { ReviewModule } from "./module/review/review.module";
import { RoleModule } from "./module/role/role.module";

import { SettingsModule } from "./module/settings/settings.module";
import { UsersController } from "./module/user/user.controller";
import { UserModule } from "./module/user/user.module";
import { UsersService } from "./module/user/user.service";
import { PrismaModule } from "./prisma/prisma.module";
import { LoggerMiddleware } from "./util/logger.service";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: "15m" },
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): ThrottlerModuleOptions => ({
        throttlers: [
          {
            ttl: config.get<number>("THROTTLE_TTL"),
            limit: config.get<number>("THROTTLE_LIMIT"),
          },
        ],
      }),
    }),
    UserModule,
    AuthModule,
    RoleModule,

    EmailModule,

    GuestModule,
    PrismaModule,
    CategoryModule,
    EmailModule,
  SettingsModule,
    ReviewModule,
    ReplyModule,

  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    EmailService,
    ImageManipulationService,
    FileUploadService,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware, SecureHeadersMiddleware).forRoutes("*");
  }
}
