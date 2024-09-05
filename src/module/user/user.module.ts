import { Module } from "@nestjs/common";
import { FileUploadService } from "src/core/file-upload.service";
import { ImageManipulationService } from "src/core/image-manipulation.service";
import { EmailService } from "../email/email.service";
import { SharedModule } from "../shared/ShareModule.module";
import { UsersController } from "./user.controller";
import { UsersService } from "./user.service";

@Module({
  imports: [SharedModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    EmailService,
    FileUploadService,
    ImageManipulationService,
  ],
  exports: [UsersService],
})
export class UserModule {}
