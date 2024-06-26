import { tokenExchangeService, userByTokenService } from "../src/services";
import addr from "../src/server_addresses";

const json = jest.fn();
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
      json.mockReturnValueOnce(
        Promise.resolve({
          token: "any_token",
        })
      );

      const result = await tokenExchangeService("any_code");
      expect(result.token).toEqual("any_token");
    });
  });

  describe("#userByTokenService", () => {
    test("Should call fetch correctly", async () => {
      await userByTokenService("any_token");
      expect(spyFetch).toHaveBeenCalledWith(addr.USER_INFO, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          Authorization: "any_token",
        },
        body: "{}",
      });
      expect(json).toHaveBeenCalled();
    });
    test("Should fail case fetch fail", async () => {
      spyFetch.mockRejectedValueOnce(new Error("any_error"));
      try {
        await userByTokenService("any_token");
        expect(false).toBeTruthy();
      } catch (err: any) {
        expect(err.message).toEqual("any_error");
      }
    });
    test("Should return null case fetch return a http error status", async () => {
      spyFetch.mockReturnValueOnce(
        Promise.resolve({
          json,
          status: 400,
        } as any)
      );

      const result = await userByTokenService("any_token");
      expect(result).toBeNull();
    });
    test("Should return a result on success", async () => {
      json.mockReturnValueOnce(
        Promise.resolve({
          username: "any_username",
        })
      );

      const result = await userByTokenService("any_token");
      expect(result.username).toEqual("any_username");
    });
  });
});
