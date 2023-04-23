import express, { Request, Response } from "express";
import { z } from "zod";
import { User } from "../models/User";
import { verifyToken } from "../middlewares/verifyToken";

const router = express.Router();

router.delete("/", verifyToken, async (req: Request, res: Response) => {
  if (!res.locals.user) return res.status(403).json("User not found.");
  console.log(req.body.user);
  if (req.body.user !== res.locals.user)
    return res.status(405).json("User not found.");

  const user = await User.deleteOne({ _id: req.body.user });
  // console.log("loggedInUser in login", loggedInUser)
  if (!user) return res.sendStatus(500);


  // console.log(sessionToken)
  res.json(`${user} account has benne deleted`);
  // res.json(tokens)
});

export default router;
