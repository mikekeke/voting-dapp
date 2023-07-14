import { CasperClient, Contracts } from "casper-js-sdk";
import { AsymmetricKey } from "casper-js-sdk/dist/lib/Keys";

export class Env {

  public casperClient: CasperClient;
  public contractClient: Contracts.Contract;

  public constructor(
    public nodeRpcUrl: string,
    public network: string,
    public adminKeys: AsymmetricKey
  ) {
    this.casperClient = new CasperClient(nodeRpcUrl);
    this.contractClient = new Contracts.Contract(this.casperClient);
  }

}

