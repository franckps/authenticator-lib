import { NextFunction, Request, Response } from "express";
import { tokenExchangeService, userByTokenService } from "./services";
import { jsScriptGenerator } from "./utils";
import cookieParser from "cookie-parser";

type IMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

export class Middlewares {
  public static callbackMiddleware(): IMiddleware {
    return async (req: Request, res: Response, next: NextFunction) => {
      const code = req.query.code;
      if (!code) throw new Error("Code value is not present");
      const tokenData = await tokenExchangeService(code as any);
      res.cookie("authorization", tokenData.token);
      res.send(
        `<script>window.parent.postMessage('{"type":"logon","success":true}', '*');</script>`
      );
    };
  }

  public static logoutCallbackMiddleware(): IMiddleware {
    return async (req: Request, res: Response, next: NextFunction) => {
      res.cookie("authorization", null, { expires: new Date() });
      res.send(
        `<script>window.parent.postMessage('{"type":"logout","success":true}', '*');</script>`
      );
    };
  }

  public static protectedPathMiddleware(
    protectedPath: string,
    error_url: string
  ): IMiddleware {
    return async (req: Request, res: Response, next: NextFunction) => {
      if (req.path.match(protectedPath)) {
        const authorization = req.cookies.authorization;
        try {
          const isValidToken = await userByTokenService(authorization);
          if (isValidToken) next();
          else res.redirect(error_url);
        } catch (err) {
          res.redirect(error_url);
        }
      } else return next();
    };
  }

  public static authorizationHeaderMiddleware(): IMiddleware {
    return async (req: Request, res: Response, next: NextFunction) => {
      if (!!req.cookies.authorization)
        req.headers.authorization = req.cookies.authorization;
      next();
    };
  }

  public static javascriptSdkMiddleware(): IMiddleware {
    return async (req: Request, res: Response, next: NextFunction) => {
      res.type("text/javascript");
      res.send(jsScriptGenerator());
    };
  }

  public static tokenVehicleMiddleware(): IMiddleware {
    return async (req: Request, res: Response, next: NextFunction) => {
      cookieParser()(req, res, next);
    };
  }
}
