import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../middlewares/async_handler";
import { prisma } from "../config/db_config";
import { Group } from "@prisma/client";
import { getDecryptedId, getEncryptedLink } from "../helpers/utils";

export const getMyGroups = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const skip =
      req.query.skip != null ? parseInt(req.query.skip!.toString()) : 0;
    const take = 25;
    const userId = req.user!.id;

    const groups: Group[] = await prisma.$queryRaw`
      SELECT 
        g.id AS group_id,
        g.timestamp AS group_timestamp,
        (
          SELECT MAX(m.timestamp)
          FROM "Message" m
          WHERE m."groupId" = g.id
        ) AS last_message_timestamp
      FROM "Group" g
      INNER JOIN "GroupMember" gm ON g.id = gm."groupId"
      WHERE gm."userId" = ${userId}
      ORDER BY last_message_timestamp DESC
      OFFSET ${skip}
      LIMIT ${take}
    `;

    const groupIds = groups.map((group: any) => group.group_id);

    const detailedGroups = await prisma.group.findMany({
      where: {
        id: { in: groupIds },
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
        messages: {
          orderBy: {
            timestamp: "desc",
          },
          include: {
            sender: true,
            replyTo: {
              include: {
                sender: true,
              },
            },
          },
        },
      },
    });

    const sortedGroups = groupIds.map((id) =>
      detailedGroups.find((group) => group.id === id)
    );

    res.json({
      message: "Fetched Successfully!",
      data: sortedGroups,
    });
  }
);

export const getGroupByEncryptedId = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const encryptedData = req.query.encryptedData;
    if (!encryptedData) {
      return res.status(400).json({ message: "Encrypted Data is required!" });
    }

    const decryptedId = getDecryptedId(encryptedData.toString());
    const groupId = parseInt(decryptedId);

    if (!groupId) {
      return res.status(400).json({ message: "Group Not Found!" });
    }

    const group = await prisma.group.findUnique({
      where: {
        id: groupId,
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
        messages: {
          orderBy: {
            timestamp: "desc",
          },
          include: {
            sender: true,
            replyTo: {
              include: {
                sender: true,
              },
            },
          },
        },
      },
    });

    if (!group) {
      return res.status(404).json({ message: "Group not found!" });
    }

    return res.json({
      message: "Fetched Successfully!",
      data: group,
    });
  }
);

export const createGroup = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { members, name } = req.body;
    if (!members || members.length === 0) {
      return res.status(400).json({ message: "Members are required!" });
    }
    if (!name) {
      return res.status(400).json({ message: "Name is required!" });
    }
    const group = await prisma.group.create({
      data: {
        name: name,
        members: {
          createMany: {
            data: [
              ...members,
              {
                userId: req.user.id,
              },
            ],
          },
        },
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
        messages: {
          orderBy: {
            timestamp: "desc",
          },
          include: {
            sender: true,
          },
        },
      },
    });
    return res.json({ message: "Group created successfully!", data: group });
  }
);

export const getGroupMembers = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id);
    const members = await prisma.groupMember.findMany({
      where: {
        groupId: id,
      },
      include: {
        user: true,
      },
    });
    const ids = [req.user.id, ...members.map((member) => member.user.id)];
    const users = await prisma.user.findMany({
      where: {
        NOT: {
          id: {
            in: ids,
          },
        },
      },
    });
    return res.json({
      message: "Group Members fetched successfully!",
      data: users,
    });
  }
);

export const updateGroup = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { members, name } = req.body;
    const id = parseInt(req.params.id);
    const updateData: any = {};
    if (name !== undefined) {
      updateData.name = name;
    }

    if (members !== undefined) {
      await prisma.groupMember.deleteMany({ where: { groupId: id } });
      updateData.members = {
        createMany: {
          data: [...members],
        },
      };
    }

    const group = await prisma.group.update({
      where: { id },
      data: updateData,
    });

    return res.json({ message: "Group updated successfully!", data: group });
  }
);

export const getEncryptedGroupLink = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const groupId = req.params.id != null ? parseInt(req.params.id) : null;
    if (!groupId) {
      return res.status(400).json({ message: "Group Id is required!" });
    }
    const group = await prisma.group.findUnique({
      where: {
        id: groupId,
      },
    });
    if (!group) {
      return res.status(404).json({ message: "Group not found!" });
    }
    let link = group.link;
    if (!link) {
      link = getEncryptedLink(groupId, true);
      await prisma.group.update({
        where: {
          id: groupId,
        },
        data: {
          link: link,
        },
      });
    }
    return res.json({ message: "Link updated!", data: link });
  }
);
