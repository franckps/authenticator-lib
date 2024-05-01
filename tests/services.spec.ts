import { tokenExchangeService } from "../src/services";
import addr from "../src/server_addresses";

const json = jest.fn().mockReturnValue(
  Promise.resolve({
    token: "any_token",
  })
);
const spyFetch = jest
  .spyOn(global, "fetch")
  .mockImplementation((url: string | any, config: RequestInit | any) =>
    Promise.resolve({
      json,
    } as any)
  );

describe("Services", () => {
  describe("#tokenExchangeService", () => {
    test("Should call fetch correctly", async () => {
      await tokenExchangeService("any_code");
      expect(spyFetch).toHaveBeenCalledWith(addr.TOKEN_EXCHANGE, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: `{"code":"any_code"}`,
      });
      expect(json).toHaveBeenCalled();
    });
    test("Should fail case fetch fail", async () => {
      spyFetch.mockRejectedValueOnce(new Error("any_error"));
      try {
        await tokenExchangeService("any_code");
        expect(false).toBeTruthy();
      } catch (err: any) {
        expect(err.message).toEqual("any_error");
      }
    });
    test("Should return a result on success", async () => {
      const result = await tokenExchangeService("any_code");
      expect(result.token).toEqual("any_token");
    });
  });
});
