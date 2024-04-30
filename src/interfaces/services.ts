import { TokenModel } from "../models/tokenModel";

export interface ITokenExchangeService {
  exchange(code: string): Promise<TokenModel>;
}
