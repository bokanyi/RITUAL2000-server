import express, { Request, Response } from "express";
import { z } from "zod";
import { User } from "../models/User";
import { verifyToken } from "../middlewares/verifyToken";

const router = express.Router();

router.delete("/:id", verifyToken, async (req: Request, res: Response) => {
  if (!res.locals.user) return res.status(403).json("User not found.");
  console.log(req.params.id);
  const id = req.params.id
  if (id !== res.locals.user)
    return res.status(405).json("User not found.");

  const user = await User.deleteOne({ _id: id });
  // console.log("loggedInUser in login", loggedInUser)
  if (!user) return res.sendStatus(500);


  // console.log(sessionToken)
  return res.status(200).json(`Your account has benne deleted.`);
  // res.json(tokens)
});

export default router;
