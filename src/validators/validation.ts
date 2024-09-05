import { applyDecorators, UsePipes } from "@nestjs/common";
import { CustomValidationPipe } from "./custom-validation.pipe";

export function ValidateRequest() {
  return applyDecorators(UsePipes(new CustomValidationPipe()));
}
