import { providers } from "ethers"

/**
 * Constants & Helpers
 */
 const localProvider = new providers.StaticJsonRpcProvider(
    'http://localhost:8545'
)
  
const ROPSTEN_CONTRACT_ADDRESS = '0x6b61a52b1EA15f4b8dB186126e980208E1E18864';
  
type StateType = {
    greeting: string
    inputValue: string
    isLoading: boolean
}

type ActionType =
    | {
        type: 'SET_GREETING'
        greeting: StateType['greeting']
      }
    | {
        type: 'SET_INPUT_VALUE'
        inputValue: StateType['inputValue']
      }
    | {
        type: 'SET_LOADING'
        isLoading: StateType['isLoading']
      }
  
const initialState: StateType = {
    greeting: '',
    inputValue: '',
    isLoading: false,
}
  
function reducer(state: StateType, action: ActionType): StateType {
    switch (action.type) {
        // Track the greeting from the blockchain
        case 'SET_GREETING':
        return {
            ...state,
            greeting: action.greeting,
        }
        case 'SET_INPUT_VALUE':
        return {
            ...state,
            inputValue: action.inputValue,
        }
        case 'SET_LOADING':
        return {
            ...state,
            isLoading: action.isLoading,
        }
        default:
        throw new Error()
    }
}

export {
    localProvider,
    ROPSTEN_CONTRACT_ADDRESS,
    initialState,
    reducer
}