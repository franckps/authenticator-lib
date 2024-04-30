import sut from "../src/middlewares";
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
      const spyExchange = jest.spyOn(servicesMock, "tokenExchangeService");
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
});
