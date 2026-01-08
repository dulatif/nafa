import { faker } from '@faker-js/faker';
import { Prisma } from '@/generated/prisma/client';
import * as bcrypt from 'bcrypt';

export const createUserFactory = async (
  overrides?: Partial<Prisma.UserCreateInput>,
): Promise<Prisma.UserCreateInput> => {
  const password = await bcrypt.hash('password123', 10);

  return {
    email: faker.internet.email(),
    name: faker.person.fullName(),
    password,
    ...overrides,
  };
};
