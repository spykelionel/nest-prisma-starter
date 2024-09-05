import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { S3 } from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import { ImageManipulationService } from "./image-manipulation.service";

@Injectable()
export class FileUploadService {
  private s3: S3;

  constructor(
    private readonly configService: ConfigService,
    private readonly imageManipulationService: ImageManipulationService
  ) {
    this.s3 = new S3({
      endpoint: this.configService.get("DO_SPACES_ENDPOINT"),
      accessKeyId: this.configService.get("DO_SPACES_KEY"),
      secretAccessKey: this.configService.get("DO_SPACES_SECRET"),
      region: this.configService.get("DO_SPACES_REGION"),
    });
  }

  async uploadImage(file: any): Promise<string> {
    if (!file) {
      throw new BadRequestException("No file provided");
    }

    const compressedImage = await this.imageManipulationService.compressImage(
      file.buffer
    );

    const uploadResult = await this.s3
      .upload({
        Bucket: this.configService.get("DO_SPACES_BUCKET"),
        Key: `${uuidv4()}.jpg`,
        Body: compressedImage,
        ACL: "public-read",
        ContentType: "image/jpeg",
      })
      .promise();

    return uploadResult.Location;
  }

  async deleteFileFromDigitalOcean(fileName: string, uploadPath: string) {
    const params = {
      Bucket: `${this.configService.get("DO_SPACES_BUCKET")}/${uploadPath}`,
      Key: fileName,
    };

    this.s3.deleteObject(params, function (err, data) {
      if (err) {
        console.error("Error deleting file:", err);
      } else {
        console.log("File deleted successfully:", data);
      }
    });
  }
}
