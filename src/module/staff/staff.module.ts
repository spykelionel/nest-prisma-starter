import { Module } from "@nestjs/common";
import { StaffProfileController } from "./staff.controller";
import { StaffProfileService } from "./staff.service";

@Module({
  providers: [StaffProfileService],
  controllers: [StaffProfileController],
})
export class StaffProfileModule {}
