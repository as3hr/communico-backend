import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../middlewares/async_handler";
import { prisma } from "../config/db_config";

export const getMyGroups = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const groups = await prisma.group.findMany({
      skip: req.query.skip != null ? parseInt(req.query.skip!.toString()) : 4,
      take: 25,
      where: {
        members: {
          some: {
            userId: req.user!.id,
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
    res.json({
      message: "Fetched SuccessFully!",
      data: groups,
    });
  }
);

export const createGroup = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { members, name } = req.body;
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
