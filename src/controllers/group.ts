import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../middlewares/async_handler";
import { prisma } from "../config/db_config";

export const getMyGroups = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const groups = await prisma.group.findMany({
      include: {
        members: {
          where: {
            userId: req.user.id,
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
        members: members,
      },
    });
    return res.json({ message: "Group created successfully!", data: group });
  }
);
