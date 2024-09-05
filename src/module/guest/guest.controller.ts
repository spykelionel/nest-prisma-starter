import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
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
import { diskStorage } from "multer";
import { extname } from "path";
import { FormatResponse } from "src/decorators/formatResponse";
import { ObjectIdValidationPipe } from "src/validators/object.validator.pipe";
import { ValidateRequest } from "src/validators/validation";
import { JwtAuthGuard } from "../auth/jwt/jwt-auth.guard";
import { GuestDto, GuestImageUpload } from "./guest.dto";
import { GuestService } from "./guest.service";

@ApiTags("Guests")
@ApiBearerAuth()
@Controller("")
@ValidateRequest()
@FormatResponse()
export class GuestController {
  constructor(private guestService: GuestService) {}

  @Post()
  async createGuest(@Body() createGuestDto: GuestDto): Promise<any> {
    return await this.guestService.createGuest(createGuestDto);
  }

  @Get()
  async getAllGuests() {
    return this.guestService.getAllGuests();
  }

  @Get(":id")
  async getGuestById(@Param("id") id: string) {
    return this.guestService.getGuestById(id);
  }

  @Put(":id")
  async updateGuest(
    @Param("id") id: string,
    @Body() guestDto: Partial<GuestDto>
  ) {
    return this.guestService.updateGuest(id, guestDto);
  }

  @Delete(":id")
  async deleteGuest(@Param("id") id: string) {
    return this.guestService.deleteGuest(id);
  }

  @Patch("upload-image/:id")
  @UseGuards(JwtAuthGuard)
  @ApiBody({ type: GuestImageUpload })
  @UseInterceptors(
    FileInterceptor("image", {
      storage: diskStorage({
        destination: "./uploads/guest",
        filename: (req, file, cb) => {
          const fileExtName = extname(file.originalname);
          cb(null, `${file.fieldname}-${Date.now()}${fileExtName}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
    })
  )
  @ApiOperation({ summary: "Upload guest image" })
  @ApiConsumes("multipart/form-data")
  @ApiParam({ name: "id", description: "ID of the guest to update" })
  @ApiResponse({
    status: 200,
    description: "The guest has been successfully updated.",
  })
  @ApiResponse({ status: 404, description: "guest not found" })
  uploadGuest(
    @Param("id", ObjectIdValidationPipe) id: string,
    @UploadedFile() image: Express.Multer.File
  ) {
    return this.guestService.uploadGuestImage(id, image);
  }
}
