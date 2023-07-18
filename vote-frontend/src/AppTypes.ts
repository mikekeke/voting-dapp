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
  nae: number
}