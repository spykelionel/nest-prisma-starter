import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { validate, ValidationError } from "class-validator";
import mongoose from "mongoose";

@Injectable()
export class CustomValidationPipe implements PipeTransform {
  async transform(value: any, { metatype, type }: ArgumentMetadata) {
    // If metatype is not provided or if it's a primitive type, skip validation
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    switch (type) {
      case "body":
        return await this.validateBody(value, metatype);
      case "param":
        return await this.validateParam(value, metatype);
      case "query":
        return await this.validateQuery(value, metatype);
      default:
        return value;
    }
  }

  // Validate request body
  private async validateBody(value: any, metatype: any) {
    const object = plainToInstance(metatype, value);
    const errors = await validate(object);
    if (errors.length > 0) {
      throw new BadRequestException(this.formatErrors(errors));
    }
    return value;
  }

  // Validate request parameters
  private async validateParam(value: any, metatype: any) {
    if (!(value instanceof mongoose.Types.ObjectId)) {
      throw new BadRequestException(`Invalid Id: ${value}`);
    }

    const object = plainToInstance(metatype, { id: value });
    const errors = await validate(object as unknown as any);
    if (errors.length > 0) {
      throw new BadRequestException(this.formatErrors(errors));
    }

    return value;
  }

  // Validate query parameters
  private async validateQuery(value: any, metatype: any) {
    const object = plainToInstance(metatype, value);
    const errors = await validate(object);
    if (errors.length > 0) {
      throw new BadRequestException(this.formatErrors(errors));
    }
    return value;
  }

  // Check if a type is eligible for validation (e.g., is it a class?)
  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  // Formats validation errors into a string message
  private formatErrors(errors: ValidationError[]): string {
    return errors
      .map((err) => {
        return (
          `${err.property} has wrong value '${err.value}', ` +
          `${Object.values(err.constraints).join(", ")}`
        );
      })
      .join("; ");
  }

  // Check if the provided value is a valid MongoDB ObjectId
  private isValidObjectId(value: string): boolean {
    return /^[a-f\d]{24}$/i.test(value);
  }
}
