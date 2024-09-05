import { Module } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { FileUploadService } from "src/core/file-upload.service";
import { ImageManipulationService } from "src/core/image-manipulation.service";
import { EmailService } from "../email/email.service";
import { UsersService } from "../user/user.service";
import { GuestController } from "./guest.controller";
import { GuestService } from "./guest.service";

@Module({
  providers: [
    GuestService,
    UsersService,
    EmailService,
    JwtService,
    FileUploadService,
    ImageManipulationService,
  ],
  imports: [],
  controllers: [GuestController],
})
export class GuestModule {}
