import {
    DecryptedMessage,
    NFTMetadata,
    TokenMetadata,
    UserModel,
} from "./types";
import {
    Where,
    WriteTransaction,
    Buckets,
    PrivateKey,
    KeyInfo,
    Client,
    ThreadID,
    GetThreadResponse,
    Users,
    UserMessage,
    MailboxEvent,
    Query,
    UserAuth,
    DBInfo,
    PublicKey,
} from "@textile/hub";
import { CoreAPI } from "@textile/eth-storage";
import { BigNumber } from "ethers";

export class TextileInstance {

    private readonly ipfsGateway = "https://dweb.link";
    private names = {
        t: "UserNFTThread",
        n: "UserNFTList",
        u: "UserData",
        c: "Collections",
        p: "Pools"
    };

    private keyInfo: KeyInfo;
    private bucketInfo: {
        bucket?: Buckets;
        bucketKey?: string;
    };

    private static identity: PrivateKey;
    
    private client: Client;
    private userClient: Users;

    private user: UserModel;

    private threadID: ThreadID;
    private mailboxId: string;

    private static singletonInstance: TextileInstance;

    private async init() {
        console.log({ identity: TextileInstance.identity })
        await this.initializeClients();
        await this.initializeMailbox();
        await this.initializeBuckets();
        await this.initializeCollection();
    }

    private async initializeClients() {
        this.keyInfo = {
            key: process.env.NEXT_PUBLIC_TEXTILE_API_KEY
        };

        this.client = await Client.withKeyInfo(this.keyInfo);
        this.userClient = await Users.withKeyInfo(this.keyInfo);
        await this.userClient.getToken(TextileInstance.identity);
    }

    private async initializeMailbox() {
        this.mailboxId = await this.userClient.setupMailbox();
    }

    private async initializeBuckets() {
        if (!this.keyInfo) {
            throw new Error("No bucket client or root key or tokenID");
        }

        let buckets = await Buckets.withKeyInfo(this.keyInfo);

        await buckets.getToken(TextileInstance.identity);

        const buck = await buckets.getOrCreate("creativebucket");

        if (!buck.root) {
            throw new Error("Failed to get or create bucket");
        }

        this.bucketInfo = {
            bucket: buckets,
            bucketKey: buck.root.key,
        };
    }

    private async initializeCollection(): Promise<void> {
        await this.client.getToken(TextileInstance.identity);

        // this.names.t = `${TextileInstance.identity.public.toString()}_UserThread`;

        const threadList: Array<GetThreadResponse> =
        await this.client.listThreads();

        const thread = threadList.find((obj) => obj.name === this.names.t);
        
        if (!thread) {
            this.threadID = await this.client.newDB(
                ThreadID.fromRandom(),
            );
            console.log({ threadID: this.threadID });
            await this.client.newCollection(this.threadID, {
                name: this.names.u
            });
            await this.client.newCollection(this.threadID, {
                name: this.names.n,
            });
            await this.client.newCollection(this.threadID, {
                name: this.names.c,
            });
            await this.client.newCollection(this.threadID, {
                name: this.names.p,
            });
        } else {
            this.threadID = ThreadID.fromString(thread.id);

            console.log({ threadID: this.threadID });
        }
    }

    public static async setPrivateKey(privateKey: PrivateKey) {
        TextileInstance.identity = privateKey;
    }
    
    public static async getInstance(
    ): Promise<TextileInstance> {
        if (!TextileInstance.singletonInstance) {
            TextileInstance.singletonInstance = new TextileInstance();
            await TextileInstance.singletonInstance.init();
        }
        return TextileInstance.singletonInstance;
    }

    public static async signUp(privateKey: PrivateKey) {
        const keyInfo: KeyInfo = {
            key: process.env.NEXT_PUBLIC_TEXTILE_API_KEY
        };

        const userClient = await Users.withKeyInfo(keyInfo);

        await userClient.setToken(privateKey.toString());
    }

    public async uploadUserData(newUser: UserModel): Promise<UserModel> {
        if (!this.bucketInfo.bucket || !this.bucketInfo.bucketKey ) {
            throw new Error("No bucket client or root key or tokenID");
        }

        // const buf = Buffer.from(JSON.stringify(newUser, null, 2));

        // await this.bucketInfo.bucket.pushPath(
        //     this.bucketInfo.bucketKey,
        //     `users/${new Date().getTime()}_${newUser.username}`,
        //     buf
        // );

        console.log({
            msg: "begin user upload"
        })

        const user = {
            ...newUser,
            publicKey: TextileInstance.identity.public.toString()
        };
        
        await this.client.create(this.threadID, this.names.u, [user]);

        console.log({ user })

        return user;
    }

    public async setCurrentUser(): Promise<UserModel> {
        if (!this.client) {
            throw new Error("No client");
        }

        const query: Query = new Where("publicKey").eq(TextileInstance.identity.public.toString());

        const users = await this.client.find<UserModel>(
            this.threadID,
            this.names.u,
            query
        );

        this.user = users[0];

        return this.user;
    }

    public async getUser(username?: string): Promise<UserModel> {
        if (!this.client) {
            throw new Error("No client");
        }

        const query: Query = new Where("username").eq(username);

        return await this.client.find<UserModel>(
            this.threadID,
            this.names.u,
            query
        )[0];
    }

    public async getBrands(): Promise<UserModel[]> {
        if (!this.client) {
            throw new Error("No client");
        }

        const query = new Where("role").eq("brand");

        return await this.client.find<UserModel>(
            this.threadID,
            this.names.u,
            query
        );
    }

    public async getPros(): Promise<UserModel[]> {
        if (!this.client) {
            throw new Error("No client");
        }

        const query = new Where("role").eq("pro");

        return await this.client.find<UserModel>(
            this.threadID,
            this.names.u,
            query
        );
    }

    public async getInbox(): Promise<DecryptedMessage[]> {
        if (!this.userClient) return;

        const messages = await this.userClient.listInboxMessages()

        const inbox: DecryptedMessage[] = []
        for (const message of messages) {
            inbox.push(await this.messageDecoder(message));
        }

        return inbox;
    }

    public async getMailboxListener(): Promise<any> {
        if (!this.userClient) return;

        return this.userClient.watchInbox(this.mailboxId, this.handleNewMessage);
    }

    public async sendMessage(newMessage: string, address: string): Promise<UserMessage> {
        if (!this.userClient) return;
        if (newMessage === '' || !this.userClient) return;

        const encoded = new TextEncoder().encode(newMessage)

        return await this.userClient.sendMessage(
            TextileInstance.identity, 
            PublicKey.fromString(address), 
            encoded
        );
    }

    public async sendUserInvite(address: string): Promise<UserMessage> {
        if (!this.userClient) return;
        
        const dbInfo: DBInfo = await this.client.getDBInfo(this.threadID);

        const message  = `
            You have been invite to join a new user group!
            \n\n
            <**>
            <Button 
                onClick={() => {
                    const textileInstance = await TextileInstance.getInstance();
                    await textileInstance.acceptUserInvite(${JSON.stringify(dbInfo)})
                }}  
            >
                Accept Invite
            </Button>
        `;

        return await this.sendMessage(message, address);
    }

    public async acceptUserInvite(info: string): Promise<ThreadID> {
        if (!this.userClient) return;

        const dbInfo = JSON.parse(info);

        return await this.client.joinFromInfo(dbInfo);
    }

    public async deleteMessage(id: string): Promise<void> {
        if (!this.userClient) return;

        return await this.userClient.deleteInboxMessage(id);
      }

    private async messageDecoder(
        encryptedMessage: UserMessage
    ): Promise<DecryptedMessage> {
        const bytes = await TextileInstance.identity.decrypt(encryptedMessage.body);

        const body = new TextDecoder().decode(bytes);
        const { 
            from, 
            readAt, 
            createdAt, 
            id
        } = encryptedMessage;
        
        return {
            _id: id,
            body, 
            from, 
            readAt, 
            sent: createdAt, 
        };
    }

    private async handleNewMessage(
        reply?: MailboxEvent, 
        err?: Error
    ): Promise<DecryptedMessage> {
        if (err) return;
        if (!this.client) return;
        if (!reply || !reply.message) return;

        return await this.messageDecoder(reply.message);
    }

    public async uploadNFT(
        file: File,
        name: string = "",
        description: string = "",
        attributes: string = '{"": any; }'
    ): Promise<NFTMetadata> {
        if (!this.bucketInfo.bucket || !this.bucketInfo.bucketKey) {
            throw new Error("No bucket client or root key");
        }

        const now = new Date().getTime();
        const fileName = `${file.name}`;
        const uploadName = `${now}_${fileName}`;
        const location = `nfts/${uploadName}`;
        const buf = await file.arrayBuffer();
        const raw = await this.bucketInfo.bucket.pushPath(
            this.bucketInfo.bucketKey,
            location,
            buf
        );
        console.log("uploadnft func ");
        console.log(raw);
        return {
            cid: raw.path.cid.toString(),
            name: name != "" ? name : uploadName,
            description: description,
            path: location,
            date: now.toString(),
            attributes: { attributes },
        };
    }

    public async deleteNFTFromBucket(nft: NFTMetadata) {
        if (!this.bucketInfo.bucket || !this.bucketInfo.bucketKey) {
            throw new Error("No bucket client or root key");
        }

        await this.bucketInfo.bucket.removePath(
            this.bucketInfo.bucketKey,
            nft.path
        );

        if (nft.tokenMetadataPath) {
            await this.bucketInfo.bucket.removePath(
                this.bucketInfo.bucketKey,
                nft.tokenMetadataPath
            );
        }
    }

    public async uploadTokenMetadata(
        storage: CoreAPI<BigNumber>,
        nft: NFTMetadata
    ) {
        if (!this.bucketInfo.bucket || !this.bucketInfo.bucketKey || !nft.cid) {
            throw new Error("No bucket client or root key or tokenID");
        }

        const tokenMeta: TokenMetadata = {
            name: nft.name,
            description: nft.description,
            image: `${this.ipfsGateway}/ipfs/${nft.cid}`,
        };

        const uploadName = `${nft.name}.json`;
        const location = `tokenmetadata/${uploadName}`;

        const buf = Buffer.from(JSON.stringify(tokenMeta, null, 2));
        const raw = await this.bucketInfo.bucket.pushPath(
            this.bucketInfo.bucketKey,
            location,
            buf
        );

        nft.tokenMetadataPath = location;
        nft.tokenMetadataURL = `/ipfs/${raw.path.cid.toString()}`;
        console.log("uploadnftmetadata func ");
        this.uploadnftmetadata(storage, tokenMeta);
        console.log(raw);
        return {
          tokenMetadataPath: location,
          tokenMetadataURL: `/ipfs/${raw.path.cid.toString()}`
        }
    }

    private async uploadnftmetadata(
        storage: CoreAPI<BigNumber>,
        tokenMeta: TokenMetadata
    ) {
        const blob = new Blob([JSON.stringify(tokenMeta)], {
            type: "application/json",
        });
        const file = new File([blob], "metadata.json", {
            type: "application/json",
            lastModified: new Date().getTime(),
        });
        const { id, cid } = await storage.store(file);
        console.log(JSON.stringify(tokenMeta));
        console.log("textile cid", cid);
    }

    public async addNFTToUserCollection(nft: NFTMetadata) {
        if (!this.client) {
            throw new Error("No client");
        }
        console.log("adding nft to user collection...");
        await this.client.create(this.threadID, this.names.n, [nft]);
    }

    public async getAllUserNFTs(): Promise<Array<NFTMetadata>> {
        if (!this.client) {
            throw new Error("No client");
        }

        // TODO: Implement a pagination logic to query only limited data.
        const memeList = await this.client.find<NFTMetadata>(
            this.threadID,
            this.names.n,
            {}
        );
        console.log("All user memes:", memeList);
        return memeList;
    }
}