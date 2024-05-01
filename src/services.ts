import { TokenModel } from "./models/tokenModel";
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
