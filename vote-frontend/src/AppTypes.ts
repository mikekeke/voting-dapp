export type ICurrentKey = {
  pubKey?: string
}

export interface IProposals {
  proposals: IProposal[]
}

export interface IProposal {
  id: number,
  statement: string,
  yea: number,
  nay: number
}

export interface IDeployedGovernor {
  package_key: string,
  package_hash: string,
}