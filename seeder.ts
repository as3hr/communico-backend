import { PrismaClient } from "@prisma/client";
const { faker } = require("@faker-js/faker");

const prisma = new PrismaClient();

async function main() {
  await prisma.message.deleteMany();
  await prisma.chatParticipant.deleteMany();
  await prisma.groupMember.deleteMany();
  await prisma.chat.deleteMany();
  await prisma.group.deleteMany();
  await prisma.user.deleteMany();

  const users = await Promise.all([
    prisma.user.create({
      data: {
        username: "you",
        me: true,
      },
    }),
    ...Array.from({ length: 20 }).map(() =>
      prisma.user.create({
        data: {
          username: faker.internet.username(),
          me: false,
        },
      })
    ),
  ]);

  const groups = await Promise.all([
    prisma.group.create({ data: { name: "Work Team" } }),
    prisma.group.create({ data: { name: "Friends" } }),
    prisma.group.create({ data: { name: "Family" } }),
    prisma.group.create({ data: { name: "Study Group" } }),
    prisma.group.create({ data: { name: "Gaming Community" } }),
  ]);

  const groupMembers = await Promise.all(
    groups
      .map((group) => {
        const groupUserCount = Math.max(
          3,
          faker.number.int({ min: 3, max: 8 })
        );

        const selectedUsers = users
          .filter((u) => u.username !== "you")
          .sort(() => 0.5 - Math.random())
          .slice(0, groupUserCount);

        return selectedUsers.map((user) =>
          prisma.groupMember.create({
            data: {
              groupId: group.id,
              userId: user.id,
            },
          })
        );
      })
      .flat()
  );

  const chats = await Promise.all(
    Array.from({ length: 10 }).map(() => {
      const chatUsers = users
        .filter((u) => u.username !== "you")
        .sort(() => 0.5 - Math.random())
        .slice(0, 2);

      return prisma.chat.create({
        data: {
          participants: {
            createMany: {
              data: chatUsers.map((user) => ({
                userId: user.id,
              })),
            },
          },
        },
        include: {
          participants: true,
        },
      });
    })
  );

  await Promise.all(
    groups.flatMap((group) => {
      const groupMembersForGroup = groupMembers.filter(
        (gm) => gm.groupId === group.id
      );

      return Array.from({ length: faker.number.int({ min: 5, max: 20 }) })
        .map(() => {
          const sender = users.find((u) =>
            groupMembersForGroup.some((gm) => gm.userId === u.id)
          );

          if (!sender) {
            console.warn(`No sender found for group ${group.name}`);
            return null;
          }

          return prisma.message.create({
            data: {
              text: faker.lorem.sentence(),
              userId: sender.id,
              groupId: group.id,
            },
          });
        })
        .filter(Boolean);
    })
  );

  await Promise.all(
    chats
      .map((chat) => {
        if (!chat.participants || chat.participants.length === 0) {
          console.warn(`Chat ${chat.id} has no participants`);
          return [];
        }

        return Array.from({
          length: faker.number.int({ min: 5, max: 20 }),
        }).map(() => {
          const sender = chat.participants[0].userId;

          return prisma.message.create({
            data: {
              text: faker.lorem.sentence(),
              userId: sender,
              chatId: chat.id,
            },
          });
        });
      })
      .flat()
  );

  console.log("Seeding completed successfully!");
  console.log(`
    Created:
    - ${users.length} Users
    - ${groups.length} Groups
    - ${chats.length} Chats
    - ${groupMembers.length} Group Members
  `);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export default main;
