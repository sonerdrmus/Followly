import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma, type User } from '@prisma/client';
import * as argon2 from 'argon2';

import { PrismaService } from '../database/prisma.service';
import { toPublicUser } from './users.presenter';
import type { PublicUser } from './users.types';

const argonOptions = {
  type: argon2.argon2id,
} as const;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: {
    email: string;
    password: string;
    displayName: string;
  }): Promise<PublicUser> {
    const passwordHash = await argon2.hash(input.password, argonOptions);
    try {
      const user = await this.prisma.user.create({
        data: {
          email: input.email,
          passwordHash,
          displayName: input.displayName,
        },
      });
      return toPublicUser(user);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException({
          message: 'An account with this email already exists.',
          code: 'EMAIL_TAKEN',
        });
      }
      throw error;
    }
  }

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async verifyPassword(passwordHash: string, password: string): Promise<boolean> {
    try {
      return await argon2.verify(passwordHash, password);
    } catch {
      return false;
    }
  }
}
