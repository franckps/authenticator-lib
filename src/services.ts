import { TokenModel } from "./models/tokenModel";
import { UserModel } from "./models/userModel";
import addr from "./server_addresses";

export const tokenExchangeService = async function (
  code: string
): Promise<TokenModel> {
  const data = await fetch(addr.TOKEN_EXCHANGE, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: `{"code":"${code}"}`,
  });
  return data.json();
};

export const userByTokenService = async function (
  token: string
): Promise<UserModel> {
  const data = await fetch(addr.USER_INFO, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: "{}",
  });
  return data.json();
};
