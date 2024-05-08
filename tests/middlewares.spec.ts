import { Middlewares as sut } from "../src/middlewares";
import * as servicesMock from "../src/services";

describe("Middlewares", () => {
  describe("#callbackMiddleware", () => {
    const resp: {
      cookie: (name: string, body: any) => void;
      send: (content: string) => void;
    } = {
      cookie(name: string, body: any) {},
      send(returnContent: string) {},
    };
    const next = jest.fn();

    test("Should fail case code be null", async () => {
      try {
        await sut.callbackMiddleware()(
          { query: { code: undefined } } as any,
          resp as any,
          next
        );
        expect(false).toBeTruthy();
      } catch (err: any) {
        expect(err.message).toEqual("Code value is not present");
      }
    });
    test("Should call token exchange with correct value", async () => {
      const spyExchange = jest
        .spyOn(servicesMock, "tokenExchangeService")
        .mockImplementation(() =>
          Promise.resolve({ token: "any_token" } as any)
        );
      await sut.callbackMiddleware()(
        { query: { code: "any_code" } } as any,
        resp as any,
        next
      );
      expect(spyExchange).toHaveBeenCalledWith("any_code");
    });
    test("Should fail case token exchange proccess fail", async () => {
      const spyExchange = jest.spyOn(servicesMock, "tokenExchangeService");
      spyExchange.mockRejectedValueOnce(new Error("any_error"));
      try {
        await sut.callbackMiddleware()(
          { query: { code: "any_code" } } as any,
          resp as any,
          next
        );
        expect(false).toBeTruthy();
      } catch (err: any) {
        expect(err.message).toEqual("any_error");
      }
    });
    test("Should set authorization as cookie on success", async () => {
      jest
        .spyOn(servicesMock, "tokenExchangeService")
        .mockReturnValue(Promise.resolve({ token: "any_token" } as any));
      const spyCookie = jest.spyOn(resp, "cookie");
      await sut.callbackMiddleware()(
        { query: { code: "any_code" } } as any,
        resp as any,
        next
      );
      expect(spyCookie).toHaveBeenCalledWith("authorization", "any_token");
    });
    test("Should return correct content on success", async () => {
      jest
        .spyOn(servicesMock, "tokenExchangeService")
        .mockReturnValue(Promise.resolve({ token: "any_token" } as any));
      const spySend = jest.spyOn(resp, "send");
      await sut.callbackMiddleware()(
        { query: { code: "any_code" } } as any,
        resp as any,
        next
      );
      expect(spySend).toHaveBeenCalledWith(
        `<script>window.parent.postMessage('{"type":"logon","success":true}');</script>`
      );
    });
  });

  describe("#logoutCallbackMiddleware", () => {
    const resp: {
      cookie: (name: string, body: any) => void;
      send: (content: string) => void;
    } = {
      cookie(name: string, body: any) {},
      send(returnContent: string) {},
    };
    const next = jest.fn();

    test("Should remove authorization from cookiee", async () => {
      const spyCookie = jest.spyOn(resp, "cookie");
      await sut.logoutCallbackMiddleware()({} as any, resp as any, next);
      expect(spyCookie).toHaveBeenCalledWith("authorization", null, {
        expires: expect.any(Date),
      });
    });

    test("Should return correct content", async () => {
      jest
        .spyOn(servicesMock, "tokenExchangeService")
        .mockReturnValue(Promise.resolve({ token: "any_token" } as any));
      const spySend = jest.spyOn(resp, "send");
      await sut.logoutCallbackMiddleware()({} as any, resp as any, next);
      expect(spySend).toHaveBeenCalledWith(
        `<script>window.parent.postMessage('{"type":"logout","success":true}');</script>`
      );
    });
  });

  describe("#protectedPathMiddleware", () => {
    const redirect = jest.fn();
    const resp: {
      cookie: (name: string, body: any) => void;
      send: (content: string) => void;
      redirect: (content: string) => void;
    } = {
      cookie(name: string, body: any) {},
      send(returnContent: string) {},
      redirect,
    };
    const next = jest.fn();
    test("Should test access token to protected path", async () => {
      const spytokenTest = jest
        .spyOn(servicesMock, "userByTokenService")
        .mockImplementation(() =>
          Promise.resolve({
            userId: "any_userId",
            username: "any_username",
          } as any)
        );
      await sut.protectedPathMiddleware("any_path", "any_errorUrl")(
        {
          cookies: { authorization: "any_token" },
          path: { match: (_: string) => true },
        } as any,
        resp as any,
        next
      );
      expect(spytokenTest).toHaveBeenCalledWith("any_token");
    });
    test("Should redirect to correct path on token error", async () => {
      jest.spyOn(servicesMock, "userByTokenService").mockImplementation(() => {
        throw new Error("any_error");
      });
      await sut.protectedPathMiddleware("any_path", "any_errorUrl")(
        {
          cookies: { authorization: "any_token" },
          path: { match: (_: string) => true },
        } as any,
        resp as any,
        next
      );
      expect(redirect).toHaveBeenCalledWith("any_errorUrl");
    });
    test("Should redirect to correct path on token false", async () => {
      jest
        .spyOn(servicesMock, "userByTokenService")
        .mockImplementation(() => Promise.resolve(null as any));
      await sut.protectedPathMiddleware("any_path", "any_errorUrl")(
        {
          cookies: { authorization: "any_token" },
          path: { match: (_: string) => true },
        } as any,
        resp as any,
        next
      );
      expect(redirect).toHaveBeenCalledWith("any_errorUrl");
    });
    test("Should call next on success", async () => {
      jest.spyOn(servicesMock, "userByTokenService").mockImplementation(() =>
        Promise.resolve({
          userId: "any_userId",
          username: "any_username",
        } as any)
      );
      await sut.protectedPathMiddleware("any_path", "any_errorUrl")(
        {
          cookies: { authorization: "any_token" },
          path: { match: (_: string) => true },
        } as any,
        resp as any,
        next
      );
      expect(next).toHaveBeenCalled();
    });
    test("Should call next case path doesnt match with protected", async () => {
      await sut.protectedPathMiddleware("any_path", "any_errorUrl")(
        {
          cookies: { authorization: "any_token" },
          path: { match: (_: string) => false },
        } as any,
        resp as any,
        next
      );
      expect(next).toHaveBeenCalled();
    });
  });
});
