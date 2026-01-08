import { faker } from '@faker-js/faker';
import { Prisma } from '@/generated/prisma/client';

export const createPostFactory = (
  authorId?: number,
  overrides?: Partial<Prisma.PostCreateInput>,
): Prisma.PostCreateInput => {
  return {
    title: faker.lorem.sentence(),
    content: faker.lorem.paragraphs(),
    published: faker.datatype.boolean(),
    author: authorId ? { connect: { id: authorId } } : undefined,
    ...overrides,
  };
};
