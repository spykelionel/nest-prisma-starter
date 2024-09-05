import { Module } from "@nestjs/common";
import { ReplyController } from "./reply.controller";
import { ReplyService } from "./reply.service";

@Module({
  providers: [ReplyService],
  controllers: [ReplyController],
  exports: [],
})
export class ReplyModule {}
