export interface NFTRecord {
  id: number;
  userId: number;
  tokenId: number;
  contractAddress: string;
  txHash: string;
  metadataUri: string;
  imageUri: string;
  chainId: number;
  studyRoomName: string;
  seatNumber: string;
  reservationDate: string;
  mintedAt: string;
}

export interface UserWallet {
  id?: number;
  userId?: number;
  walletAddress: string;
  createdAt?: string;
}
