import { TokenModel } from "./models/tokenModel";

export const tokenExchangeService = function (
  code: string
): Promise<TokenModel> {
  return Promise.resolve({ token: null } as any);
};
