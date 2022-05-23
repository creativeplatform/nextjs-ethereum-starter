import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Container,
  Flex,
  Image,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  SimpleGrid,
  Text,
} from '@chakra-ui/react'
import { useEthers, useNotifications, shortenAddress } from '@usedapp/core'
import blockies from 'blockies-ts'
import NextLink from 'next/link'
import React, { useEffect, useState } from 'react'
import Balance from '../Balance'
import ConnectWallet from '../ConnectWallet'
import Head, { MetaProps } from './Head'
import { EmbedSDK, channels, OnSubscribeModal } from "@epnsproject/frontend-sdk-staging";
import transakSDK from '@transak/transak-sdk';

// Extends `window` to add `ethereum`.
declare global {
  interface Window {
    ethereum: any
  }
}

/**
 * Constants & Helpers
 */

// EPNS's API base url
const BASE_URL = "https://backend-kovan.epns.io/apis";
// const BASE_URL = "https://backend-prod.epns.io/apis"; // prod

// You have to provide your "channel" address here
const CHANNEL_ADDRESS = "0x1Fde40a4046Eda0cA0539Dd6c77ABF8933B94260"; // sample

// Title text for the various transaction notifications.
const TRANSACTION_TITLES = {
  transactionStarted: 'Local Transaction Started',
  transactionSucceed: 'Local Transaction Completed',
}

// Takes a long hash string and truncates it.
function truncateHash(hash: string, length = 38): string {
  return hash.replace(hash.substring(6, length), '...')
}

/**
 * Prop Types
 */
interface LayoutProps {
  children: React.ReactNode
  customMeta?: MetaProps
}

/**
 * Component
 */
const Layout = ({ children, customMeta }: LayoutProps): JSX.Element => {
  const { account, deactivate, active, chainId, library } = useEthers();
  const { notifications } = useNotifications();


  const [isSubscribed, setSubscribeStatus] = useState(false);
  const [channel, setChannel] = useState();
  const [showModal, setShowModal] = useState(false);

  let blockieImageSrc
  if (typeof window !== 'undefined') {
    blockieImageSrc = blockies.create({ seed: account }).toDataURL()
  }

  useEffect(() => {
    if (account) { // 'your connected wallet address'
      EmbedSDK.init({
        headerText: 'Hello Creative', // optional
        targetID: 'sdk-trigger-id', // mandatory
        appName: 'Creative Test', // mandatory
        user: account, // mandatory
        viewOptions: {
            type: 'sidebar', // optional [default: 'sidebar', 'modal']
            showUnreadIndicator: true, // optional
            unreadIndicatorColor: '#cc1919',
            unreadIndicatorPosition: 'bottom-right',
        },
        theme: 'light',
        onOpen: () => {
          // console.log('-> client dApp onOpen callback');
        },
        onClose: () => {
          // console.log('-> client dApp onClose callback');
        }
      });
    }

    return () => {
      EmbedSDK.cleanup();
    };
  }, []);

  const onClickHandler = () => {


    if (!isSubscribed) {
      channels.optIn(
        library.getSigner(account),
        CHANNEL_ADDRESS,
        chainId,
        account,
        {
          onSuccess: () => {
            // console.log("channel opted in");
            setShowModal(true);
            setSubscribeStatus(true);
          }
        }
      );
    } else {
      channels.optOut(
        library.getSigner(account),
        CHANNEL_ADDRESS,
        chainId,
        account,
        {
          onSuccess: () => {
            // console.log("channel opted out");
            setSubscribeStatus(false);
          }
        }
      );
    }
  };

  useEffect(() => {
    if (!account) return;

    // on page load, fetch channel details
    channels.getChannelByAddress(CHANNEL_ADDRESS, BASE_URL).then((channelData) => {
      setChannel(channelData);
    });
    // fetch if user is subscribed to channel
    channels.isUserSubscribed(account, CHANNEL_ADDRESS).then((status) => {
      setSubscribeStatus(status);
    });
  }, [account]);

  function loadInit() {
    const transak = new transakSDK({
      apiKey: '07d4475a-4b8c-49d6-ba88-61075d649c6f',  // Your API Key
      environment: 'STAGING', // STAGING/PRODUCTION
      hostURL: window.location.href,
      widgetHeight: '625px',
      widgetWidth: '500px',
      // Examples of some of the customization parameters you can pass
      defaultCryptoCurrency: 'MATIC', // Example 'ETH'
      walletAddress: account, // Your customer's wallet address
      //themeColor: '[COLOR_HEX]', // App theme color
      fiatCurrency: 'USD', // If you want to limit fiat selection eg 'USD'
      //email: '', // Your customer's email address
      redirectURL: 'localhost:3000'
    });

    transak.init();

    // To get all the events
    transak.on(transak.ALL_EVENTS, (/*data*/) => {
      // console.log(data)
    });

    // This will trigger when the user marks payment is made.
    transak.on(transak.EVENTS.TRANSAK_ORDER_SUCCESSFUL, (/*orderData*/) => {
      // console.log(orderData);
      transak.close();
    });
    return () => {
      transak.cleanup();
    }
  }


  return (
    <>
      <Head customMeta={customMeta} />
      <header>
        <Container maxWidth="container.xl">
          <SimpleGrid
            columns={[1, 1, 1, 2]}
            alignItems="center"
            justifyContent="space-between"
            py="8"
          >
            <Flex py={[4, null, null, 0]}>
              <NextLink href="/" passHref>
                <Link px="4" py="1">
                  Home
                </Link>
              </NextLink>
              <NextLink href="/graph-example" passHref>
                <Link px="4" py="1">
                  Graph Example
                </Link>
              </NextLink>
              <NextLink href="/signature-example" passHref>
                <Link px="4" py="1">
                  Signature Example
                </Link>
              </NextLink>
            </Flex>
            {account ? (
              <Flex
                order={[-1, null, null, 2]}
                alignItems={'center'}
                justifyContent={['flex-start', null, null, 'flex-end']}
              >
                <Balance />
                <Image ml="4" src={blockieImageSrc} alt="blockie" />
                <Menu placement="bottom-end">
                  <MenuButton as={Button} ml="4">
                    {truncateHash(account)}
                  </MenuButton>
                  <MenuList>
                    <MenuItem onClick={loadInit}>Add Funds</MenuItem>
                    <MenuItem onClick={deactivate}>Disconnect</MenuItem>
                  </MenuList>
                </Menu>
              </Flex>
            ) : (
              <ConnectWallet />
            )}
          </SimpleGrid>
          {showModal && <OnSubscribeModal onClose={() => setShowModal(false)} /> }
            {active ? (
              channel ? (
                <div style={{
                  display:'flex',
                  alignItems:'center',
                  flexDirection: 'column',
                  margin: 5
                }}>
                  <p><b>Channel Address:</b>{shortenAddress(CHANNEL_ADDRESS)}</p>
                  {
                    isSubscribed ? (
                      <Button onClick={onClickHandler}>OPT-OUT</Button>
                    ) : (
                      <Button onClick={onClickHandler}>OPT-IN</Button>
                    )
                  }
                </div>
              ) : (
                <div>No Channel Details</div>
              )
            ): null}
        </Container>
      </header>
      <main>
        <Container maxWidth="container.xl">
          {children}
          {notifications.map((notification) => {
            if (notification.type === 'walletConnected') {
              return null
            }
            return (
              <Alert
                key={notification.id}
                status="success"
                position="fixed"
                bottom="8"
                right="8"
                width="400px"
              >
                <AlertIcon />
                <Box>
                  <AlertTitle>
                    {TRANSACTION_TITLES[notification.type]}
                  </AlertTitle>
                  <AlertDescription overflow="hidden">
                    Transaction Hash:{' '}
                    {truncateHash(notification.transaction.hash, 61)}
                  </AlertDescription>
                </Box>
              </Alert>
            )
          })}
        </Container>
      </main>
      <footer>
        <Container mt="8" py="8" maxWidth="container.xl">
          <Text>
            Built by{' '}
            <Link href="https://twitter.com/creativecrtv">Creative Platform</Link>
          </Text>
        </Container>
      </footer>
    </>
  )
}

export default Layout
