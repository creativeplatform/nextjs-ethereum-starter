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

export interface PlatformStats {
    data: {
        streams_total: number;
    };
}

export interface Artist {
    songstats_artist_id: string;
    avatar: string;
    name: string;
    site_url: string;
    stats: PlatformStats[];
}

export interface ArtistsResponse {
    results: Artist[];
}

export interface Track {
    songstats_track_id: number;
    avatar?: string;
    title?: string;
    artists?: any[]; 
}

export interface TrackStats {
    date: string;
    popularity_current: number;
    streams_total: number;
}

export interface Item {
    label: string;
    value: string;
}

export interface RoyaltyAdvance {
    artistId: string;
    artistName: string;
    royaltiesPaid: number;
    source: string[];
    numPlays: number;
    datePaid: Date;
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