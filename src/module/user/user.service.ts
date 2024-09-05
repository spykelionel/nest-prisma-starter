// src/users/users.service.ts

import {
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as argon2 from "argon2";
import { hash, verify } from "argon2";
import { readFileSync } from "fs";
import { unlink } from "fs/promises";
import { FileUploadService } from "src/core/file-upload.service";
import { PrismaService } from "src/prisma/prisma.service";
import { v4 as uuidv4 } from "uuid";
import { EmailService } from "../email/email.service";
import { CreateUserDto, UpdateUserDto } from "./dto/user.dto";

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private jwt: JwtService,
    private config: ConfigService,
    private fileUploadService: FileUploadService
  ) {}

  private readonly logger = new Logger(UsersService.name);

  async create(createUserDto: CreateUserDto) {
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: createUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException("Email already in use");
      }

      const hashedPassword = await argon2.hash(createUserDto.password, {
        type: argon2.argon2id,
        memoryCost: 2 ** 16,
        timeCost: 3,
        parallelism: 1,
      });

      const verificationToken = uuidv4();

      const newUser = await this.prisma.user.create({
        data: {
          ...createUserDto,
          password: hashedPassword,
          verificationToken,
        },
      });

      // await this.emailService.sendVerificationEmail(
      //   newUser.email,
      //   verificationToken
      // );

      const login = await this.login({
        email: newUser.email,
        password: createUserDto.password,
      });
      let user = { ...newUser, ...login };

      const { password, verificationToken: _, ...result } = user;
      return result;
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  async createAdmin(id: string) {
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        throw new NotFoundException(
          "You can't perform this action. Contact admininstrator.."
        );
      }

      const adminUser = await this.prisma.user.update({
        where: { id: existingUser.id },
        data: {
          isAdmin: true,
          accountType: "ADMIN",
        },
      });

      return {
        message: "User is now an admin",
        adminUser,
        statusCode: 201,
      };
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  async login(loginData: { email: string; password: string }) {
    let user: any;
    try {
      user = await this.prisma.user.findUnique({
        where: { email: loginData.email },
        include: {
          businesses: true,
          reservations: true,
          notifications: true,
          reviews: true,
          replies: true,
          roles: true,
        },
      });
    } catch (error) {
      throw new UnauthorizedException(
        "Could not process your data. Please try again"
      );
    }

    // if (user?.isAdmin === true) {
    //   throw new ForbiddenException("You are not allowed to login here");
    // }

    if (user) {
      const password = await verify(user?.password, loginData.password);

      if (password) {
        const tokens = await this.generateTokens(user);
        await this.updateRefreshToken(user?.id, tokens.refresh_token);

        return {
          ...tokens,
          userName: user?.name,
          userId: user?.id,
          user: { ...user, password: undefined },
        };
      } else {
        throw new ForbiddenException("Incorrect Password");
      }
    } else {
      throw new ForbiddenException("Can not peform action at this time");
    }
  }

  async generateTokens(user: any): Promise<any> {
    delete user.password;
    // delete user.isAdmin; I need this for RBAC
    delete user.updatedAt;
    delete user.refreshToken;
    delete user.reservations;
    delete user.notifications;
    delete user.reviews;
    delete user.replies;
    delete user.roles;
    delete user.avatar;
    delete user.emailVerified;
    delete user.notes;
    delete user.lastLogin;
    delete user.createdAt;
    delete user.updatedAt;
    delete user.resetPasswordExpires;
    delete user.twoFactorSecret;
    delete user.verificationToken;
    delete user.resetPasswordToken;
    const signToken = await this.jwt.signAsync(user, {
      expiresIn: "24h",
      secret: this.config.get("JWT_SECRET"),
    });
    const refreshToken = await this.jwt.signAsync(user, {
      expiresIn: "2days",
      secret: this.config.get("JWT_RefreshSecret"),
    });
    return {
      access_token: signToken,
      refresh_token: refreshToken,
    };
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const refreshTokenHash = await hash(refreshToken);

    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        verificationToken: refreshTokenHash,
      },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        isAdmin: true,
        accountType: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        businesses: true,
        reservations: true,
        notifications: true,
        reviews: true,
        replies: true,
        roles: true,
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        isAdmin: true,
        accountType: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        twoFactorSecret: true,
        businesses: true,
        reservations: true,
        notifications: true,
        reviews: true,
        replies: true,
        roles: true,
      },
    });

    if (!user) {
      throw new NotFoundException("Can not peform action at this time");
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const existingUser = await this.prisma.user.findUnique({ where: { id } });

    if (!existingUser) {
      throw new NotFoundException("Can not peform action at this time");
    }
    delete existingUser.isAdmin;

    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const emailTaken = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (emailTaken) {
        throw new ConflictException("Email already in use");
      }
    }

    if (updateUserDto.password) {
      updateUserDto.password = await argon2.hash(updateUserDto.password, {
        type: argon2.argon2id,
        memoryCost: 2 ** 16,
        timeCost: 3,
        parallelism: 1,
      });
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        isAdmin: true,
        accountType: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  async remove(id: string) {
    const existingUser = await this.prisma.user.findUnique({ where: { id } });

    if (!existingUser) {
      throw new NotFoundException("Can not peform action at this time");
    }

    await this.prisma.user.delete({ where: { id } });
    return { message: "User deleted successfully" };
  }

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({
      where: { verificationToken: token },
    });

    if (!user) {
      throw new NotFoundException("Invalid verification token");
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, verificationToken: null },
    });

    return { message: "Email verified successfully" };
  }

  async requestPasswordReset(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new NotFoundException("Can not peform action at this time");
    }

    const resetToken = uuidv4();
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour from now

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires,
      },
    });

    await this.emailService.sendPasswordResetEmail(user.email, resetToken);

    return { message: "Password reset email sent" };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new NotFoundException("Invalid or expired reset token");
    }

    const hashedPassword = await argon2.hash(newPassword, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
      parallelism: 1,
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    return { message: "Password reset successfully" };
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException("Can not peform action at this time");
    }

    return user;
  }

  async setTwoFactorSecret(userId: string, secret: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret },
    });
  }

  async enableTwoFactor(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: true },
    });
  }

  async uploadUserImage(id: string, image: Express.Multer.File) {
    if (!image) {
      return new HttpException(
        "Missing file field: image",
        HttpStatus.UNPROCESSABLE_ENTITY
      );
    }
    const buffer = readFileSync(image.path); // Read the file as buffer
    const user = await this.prisma.user.findFirst({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    let imageUrl = null;
    if (image) {
      imageUrl = await this.fileUploadService.uploadImage(buffer);
    }
    // if successfully upload, remove the image from the server..
    if (imageUrl !== null) {
      unlink(image.path)
        .then(() => {
          console.log("successfully unlinked the file");
        })
        .catch((err) => {
          console.log("ERROR unlinking file", err);
        });
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        avatar: imageUrl,
      },
    });
  }
}
