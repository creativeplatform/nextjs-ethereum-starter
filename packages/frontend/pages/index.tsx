import { Box, Button, Divider, Heading, Input, Text, Flex, Avatar } from '@chakra-ui/react'
import { CUIAutoComplete } from 'chakra-ui-autocomplete'
import { ChainId, useEthers, useSendTransaction } from '@usedapp/core'
import { ethers, providers, utils } from 'ethers'
import React, { useReducer } from 'react'
import { YourContract as LOCAL_CONTRACT_ADDRESS } from '../artifacts/contracts/contractAddress'
import YourContract from '../artifacts/contracts/YourContract.sol/YourContract.json'
import Layout from '../components/layout/Layout'
import { YourContract as YourContractType } from '../types/typechain'
import axios from 'axios';

/**
 * Constants & Helpers
 */

const localProvider = new providers.StaticJsonRpcProvider(
  'http://localhost:8545'
)

const ROPSTEN_CONTRACT_ADDRESS = '0x6b61a52b1EA15f4b8dB186126e980208E1E18864'

export interface Item {
  avatar: string;
  name: string;
}
/**
 * Prop Types
 */
type Artist = {
  results: [
    {
      songstats_artist_id: string;
      avatar: string;
      name: string;
      site_url: string;
    }
  ]
}

type GetUsersResponse = {
  data: Artist[];
};

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

/**
 * Component
 */

 const artists = {
  results: [
    {
      songstats_artist_id: "7aot8uey",
      avatar: "https://i.scdn.co/image/ab6761610000e5ebcdce7620dc940db079bf4952",
      name: "Ariana Grande",
      site_url: "https://songstats.com/artist/7aot8uey/ariana-grande",
    }
  ]
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

async function getArtists() {

    // 👇️ const data: GetUsersResponse
    const options = {
      method: 'GET',
      url: 'https://stoplight.io/mocks/songstats/api/12173793/artists/search',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Encoding': 'gzip, deflate, br',
        Prefer: 'code=200',
        apikey: 'af059dd1-1f0f-4acc-99d2-c27dd26a60d2'
      },
      params: {
        q: "string"
      }
    };
    
    await axios.request(options).then(function (response) {
      console.log(response.data);
    }).catch(function (error) {
      console.error(error);
    });
}

console.log(getArtists());

function HomeIndex(): JSX.Element {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { account, chainId, library } = useEthers()

  const [pickerItems, setPickerItems] = React.useState(artists);
  const [selectedItems, setSelectedItems] = React.useState([]);

  const handleCreateItem = (item) => {
    setPickerItems ((curr) => [...curr, item]);
    setSelectedItems((curr) => [...curr, item]);
  };

  const handleSelectedItemsChange = (selectedItems?: Item[]) => {
    if (selectedItems) {
      setSelectedItems(selectedItems);
    }
  };

  const customRender = (selected) => {
    return (
      <Flex flexDir="row" alignItems="center">
        <Avatar mr={2} size="sm" name={selected.label} />
        <Text color={"black"}>{selected.label}</Text>
      </Flex>
    )
  }

  const customCreateItemRender = (value) => {
    return (
      <Text>
        <Box as='span'>Create</Box>{' '}
        <Box as='span' bg='red.300' fontWeight='bold'>
          "{value}"
        </Box>
      </Text>
    )
  }

  const isLocalChain =
    chainId === ChainId.Localhost || chainId === ChainId.Hardhat

  const CONTRACT_ADDRESS =
    chainId === ChainId.Ropsten
      ? ROPSTEN_CONTRACT_ADDRESS
      : LOCAL_CONTRACT_ADDRESS

  // Use the localProvider as the signer to send ETH to our wallet
  const { sendTransaction } = useSendTransaction({
    signer: localProvider.getSigner(),
  })

  // call the smart contract, read the current greeting value
  async function fetchContractGreeting() {
    if (library) {
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        YourContract.abi,
        library
      ) as YourContractType
      try {
        const data = await contract.greeting()
        dispatch({ type: 'SET_GREETING', greeting: data })
      } catch (err) {
        // eslint-disable-next-line no-console
        console.log('Error: ', err)
      }
    }
  }

  // call the smart contract, send an update
  async function setContractGreeting() {
    if (!state.inputValue) return
    if (library) {
      dispatch({
        type: 'SET_LOADING',
        isLoading: true,
      })
      const signer = library.getSigner()
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        YourContract.abi,
        signer
      ) as YourContractType
      const transaction = await contract.setGreeting(state.inputValue)
      await transaction.wait()
      fetchContractGreeting()
      dispatch({
        type: 'SET_LOADING',
        isLoading: false,
      })
    }
  }

  function sendFunds(): void {
    sendTransaction({
      to: account,
      value: utils.parseEther('0.1'),
    })
  }

  return (
    <Layout>
      <Heading as="h1" mb="8">
        Creative
      </Heading>
      <CUIAutoComplete
            tagStyleProps={{
              rounded: 'full'
            }}
            label="Choose preferred artist"
            placeholder="Type an Artist"
            onCreateItem={handleCreateItem}
            items={pickerItems}
            itemRenderer={customRender}
            createItemRenderer={customCreateItemRender}
            selectedItems={selectedItems}
            onSelectedItemsChange={(changes) =>
              handleSelectedItemsChange(changes.selectedItems)
            }
          />
      <Text mt="8" fontSize="xl">
        This page only works on the Mumbai Testnet or on a Local Chain.
      </Text>
      <Box maxWidth="container.sm" p="8" mt="8" bg="gray.900">
        <Text fontSize="xl">Contract Address: {CONTRACT_ADDRESS}</Text>
        <Divider my="8" borderColor="gray.400" />
        <Box>
          <Text fontSize="lg">Image: {state.greeting}</Text>
          <Text fontSize="lg">Track: </Text>
          <Button mt="2" colorScheme="teal" onClick={fetchContractGreeting}>
            Fetch Track
          </Button>
        </Box>
        <Divider my="8" borderColor="gray.400" />
        <Box>
          <Button
            mt="2"
            colorScheme="teal"
            isLoading={state.isLoading}
            onClick={setContractGreeting}
          >
            Mint NFT
          </Button>
        </Box>
        <Divider my="8" borderColor="gray.400" />
        <Text mb="4">This button only works on a Local Chain.</Text>
        <Button
          colorScheme="teal"
          onClick={sendFunds}
          isDisabled={!isLocalChain}
        >
          Send Funds From Local Hardhat Chain
        </Button>
      </Box>
    </Layout>
  )
}

export default HomeIndex
