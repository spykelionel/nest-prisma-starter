import { UseInterceptors } from "@nestjs/common";
import { FormatResponseInterceptor } from "./format-response.interceptor";

export function FormatResponse() {
  return UseInterceptors(FormatResponseInterceptor);
}
