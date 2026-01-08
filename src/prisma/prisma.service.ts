import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@/generated/prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL! });
    super({ adapter });
  }
}

