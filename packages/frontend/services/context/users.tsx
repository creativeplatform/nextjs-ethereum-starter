import { createContext, useContext, useState } from "react"
import { TextileInstance } from "../textile/textile"
import { UserModel, DecryptedMessage } from "../textile/types"
import { useEthers } from "@usedapp/core"

type AuthContext = {
    isLoggedIn?: boolean,
    user?: UserModel,
    role?: string,
    textileInstance?: TextileInstance,
    account?: string,
    inbox?: DecryptedMessage[],
    signUp?: (newUser: UserModel) => Promise<void>,
    logIn?: () => Promise<void>,
    logOut?: () => Promise<void>
};
  
const AuthContext = createContext<AuthContext | undefined>(undefined);

const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [user, setUser] = useState<UserModel>();
    const [role, setRole] = useState<string>();
    const [inbox, setInbox] = useState<DecryptedMessage[]>();

    const { account, deactivate, library } = useEthers();

    const signUp = async (newUser: UserModel) => {
        const instance = await TextileInstance.getInstance();
    
        const user = await instance.uploadUserData(newUser);

        setUser(user);
        setRole(user?.role);

        setInbox(await instance.getInbox()); 

        setIsLoggedIn(true);
    }

    const logIn = async () => {

        const instance = await TextileInstance.getInstance();

        const user: UserModel = await instance.setCurrentUser();

        setUser(user);
        setRole(user?.role);

        setInbox(await instance.getInbox()); 

        setIsLoggedIn(true);
    }

    const logOut = async () => {
        setUser(undefined)
        setRole(undefined);
        setInbox(undefined);
        deactivate();
        setIsLoggedIn(false);
    }

    return (
        <AuthContext.Provider
            value={{
                isLoggedIn,
                user,
                role,
                account,
                inbox,
                signUp,
                logIn,
                logOut
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
      throw new Error('useAuth must be used within a AuthProvider');
    }
    return context;
};

export { AuthProvider, useAuth };