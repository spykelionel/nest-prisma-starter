import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { ObjectIdValidationPipe } from "src/validators/object.validator.pipe";
import { ValidateRequest } from "src/validators/validation";
import { JwtAuthGuard } from "../auth/jwt/jwt-auth.guard";
import { CreateReviewDto } from "./dto/create-review.dto";
import { UpdateReviewDto } from "./dto/update-review.dto";
import { ReviewService } from "./review.service";

@ApiTags("Review")
@ApiBearerAuth()
@Controller("review")
@ValidateRequest()
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: "Create a new review" })
  @ApiResponse({
    status: 201,
    description: "The review has been successfully created.",
  })
  @ApiResponse({ status: 403, description: "Forbidden." })
  create(@Body() createReviewDto: CreateReviewDto, @Req() req) {
    return this.reviewService.create(createReviewDto, req.user);
  }

  // Example route for guests
  @Post("guest")
  @ApiOperation({ summary: "Create a new review (guest)" })
  @ApiResponse({
    status: 201,
    description: "The review has been successfully created by a guest.",
  })
  @ApiResponse({ status: 400, description: "Bad Request." })
  createGuestReview(@Body() createReviewDto: CreateReviewDto) {
    // Handle guest review creation here
    return this.reviewService.createGuestReview(createReviewDto);
  }

  @Get()
  @ApiOperation({ summary: "Retrieve all reviews" })
  @ApiResponse({ status: 200, description: "List of all reviews." })
  findAll() {
    return this.reviewService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Retrieve a review by ID" })
  @ApiResponse({
    status: 200,
    description: "The review with the specified ID.",
  })
  @ApiResponse({ status: 404, description: "Review not found." })
  findOne(@Param("id", ObjectIdValidationPipe) id: string) {
    return this.reviewService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  @ApiOperation({ summary: "Update an existing review" })
  @ApiResponse({
    status: 200,
    description: "The review has been successfully updated.",
  })
  @ApiResponse({ status: 404, description: "Review not found." })
  update(
    @Param("id", ObjectIdValidationPipe) id: string,
    @Body() updateReviewDto: UpdateReviewDto,
    @Req() req
  ) {
    return this.reviewService.update(id, updateReviewDto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  @ApiOperation({ summary: "Delete a review by ID" })
  @ApiResponse({
    status: 200,
    description: "The review has been successfully deleted.",
  })
  @ApiResponse({ status: 404, description: "Review not found." })
  remove(@Param("id", ObjectIdValidationPipe) id: string) {
    return this.reviewService.remove(id);
  }
}
