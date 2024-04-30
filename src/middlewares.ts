import { NextFunction, Request, Response } from "express";
import { tokenExchangeService } from "./services";

export default class Middlewares {
  public static callbackMiddleware(): (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void> {
    return async (req: Request, res: Response, next: NextFunction) => {
      const code = req.query.code;
      if (!code) throw new Error("Code value is not present");
      const tokenData = await tokenExchangeService(code as any);
      res.cookie("authorization", tokenData.token);
      res.send(
        `<script>window.parent.postMessage('{"type":"logon","success":true}');</script>`
      );
    };
  }
}
