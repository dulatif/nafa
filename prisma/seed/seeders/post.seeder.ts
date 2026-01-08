import { PrismaClient } from '@/generated/prisma/client';
import { createPostFactory } from '../factories/post.factory';

export const postSeeder = async (prisma: PrismaClient) => {
  console.log('Seeding posts...');

  const users = await prisma.user.findMany();

  if (users.length === 0) {
    console.log('No users found. Skipping post seeding.');
    return;
  }

  for (const user of users) {
    const postPromises = Array.from({ length: 3 }).map(() => {
      const postData = createPostFactory();
      // We manually connect inside the loop or use the factory connect logic
      // factory allows connect, but findMany returns users.

      // Let's just pass data and connect explicitly here since factory returns Input.
      // Actually factory return includes `author: ...` if we passed ID.
      // But let's check factory signature.
      // export const createPostFactory = (authorId?: number, ...

      return prisma.post.create({
        data: {
          title: postData.title,
          content: postData.content,
          published: postData.published,
          authorId: user.id,
        },
      });
    });

    await Promise.all(postPromises);
  }

  console.log('Posts seeded.');
};
