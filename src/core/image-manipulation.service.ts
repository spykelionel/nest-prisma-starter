import { Injectable } from "@nestjs/common";
import * as sharp from "sharp";

@Injectable()
export class ImageManipulationService {
  async compressImage(buffer: Buffer): Promise<Buffer> {
    try {
      return sharp(buffer)
        .resize({ width: 800 })
        .jpeg({ quality: 80 })
        .toBuffer();
    } catch (error) {
      console.log("ERROR", error);
    }
  }
}
