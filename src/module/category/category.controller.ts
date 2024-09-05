import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
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
import { CategoryService } from "./category.service";
import { CreateCategoryDto, UpdateCategoryDto } from "./dto/category.dto";

@ApiTags("Categories")
@ApiBearerAuth()
@Controller("category")
@ValidateRequest()
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Create a new category" })
  @ApiResponse({
    status: 201,
    description: "The category has been successfully created.",
  })
  @ApiResponse({ status: 403, description: "Forbidden." })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all categories" })
  @ApiResponse({
    status: 200,
    description: "Successfully retrieved all categories.",
  })
  findAll() {
    return this.categoryService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a single category by ID" })
  @ApiResponse({
    status: 200,
    description: "Successfully retrieved the category.",
  })
  @ApiResponse({ status: 404, description: "Category not found." })
  findOne(@Param("id", ObjectIdValidationPipe) id: string) {
    return this.categoryService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Update an existing category" })
  @ApiResponse({
    status: 200,
    description: "The category has been successfully updated.",
  })
  @ApiResponse({ status: 403, description: "Forbidden." })
  update(
    @Param("id", ObjectIdValidationPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto
  ) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Delete a category" })
  @ApiResponse({
    status: 200,
    description: "The category has been successfully deleted.",
  })
  @ApiResponse({ status: 403, description: "Forbidden." })
  remove(@Param("id", ObjectIdValidationPipe) id: string) {
    return this.categoryService.remove(id);
  }
}
