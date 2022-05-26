export interface RoyaltyAdvance {
    artistId: string;
    artistName: string;
    royaltiesPaid: number;
    source: Array<string>;
    numPlays: number;
    datePaid: Date;
}

export interface UserModel {
    _id?: string;
    publicKey?: string;
    name?: string;
    username?: string;
    email?: string;
    role?: string;
}

export interface DecryptedMessage {
    _id?: string;
    body?: string;
    from?: string;
    sent?: number;
    readAt?: number;
}

export interface NFTMetadata {
    _id?: string;
    _mod?: number;
    tokenID?: string; // NFT tokenID
    cid: string; // IPFS CID
    path: string; // Bucket path
    tokenMetadataURL?: string;
    tokenMetadataPath?: string;
    name: string; // meme Name
    txHash?: string; // blockchain tx hash
    date: string; // created date
    ownerWalletAddress?: string; // account address
    user?: string; // public key
    description?: string;
    attributes?: {
        [k: string]: string | number;
    };
}

export interface TokenMetadata {
    name?: string;
    decimals?: number;
    description?: string;
    image?: string;
    properties?: {
        [k: string]: unknown;
    };
    localization?: {
        uri: string;
        default: string;
        locales: unknown[];
        [k: string]: unknown;
    };
    [k: string]: unknown;
}

export interface UserData {
    _id?: string;
    user_id: number;
}