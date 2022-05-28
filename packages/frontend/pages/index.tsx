import { Box, Button, Divider, Flex, Heading, Text, Select } from '@chakra-ui/react'
import { useEthers } from '@usedapp/core'
import { Contract } from 'ethers'
import React, { useEffect } from 'react'
import Layout from '../components/layout/Layout'
import axios from 'axios'
import { useAuth } from '../services/context/users'
import { Artist, NFTMetadata, Track } from '../services/textile/types'
import { TextileInstance } from '../services/textile/textile'
import abi from "../contracts/creative.abi.js"
import address from "../contracts/YourCollectible.address"
import { toast } from 'react-toastify'
import ConnectWallet from "../components/common/auth/ConnectWallet";
import SignIn from "../components/common/auth/SignIn";
import SignUp from "../components/common/auth/SignUp";

function HomeIndex(): JSX.Element {
  const { library } = useEthers();
  const { user } = useAuth();

  const [submitDisabled, setSubmitDisabled] = React.useState(true);
  const [trackSelectIsEnabled, setTrackSelectIsEnabled] = React.useState<boolean>(true);
  const [artistSelectIsDisabled, setArtistSelectIsDisabled] = React.useState<boolean>(true);
  // const [preview, setPreview] = React.useState("");

  const [artists, setArtists] = React.useState<Artist[]>();
  const [artist, setArtist] = React.useState<Artist>();
  const [tracks, setTracks] = React.useState<Track[]>();
  const [track, setTrack] = React.useState<Track>();

  useEffect(() => {
    user ? getArtists() : undefined;
  }, [user]);

  // create a preview as a side effect, whenever selected file is changed
  // useEffect(() => {
    // setPreview(track.image);
  // }, [track]);

  const getArtists = async () => {
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
        q: 'Ariana Grande'
      }
    };
    await axios.request(options).then((response) => {
      setArtists(response.data.results);
      setArtistSelectIsDisabled(true);
      if (response.data.results.length === 1) {
        getCatalog();
      }
    }).catch(function (error) {
      console.error(error);
    });
  };

  const getCatalog = async () => {
    const options = {
      method: 'GET',
      url: 'https://stoplight.io/mocks/songstats/api/12173793/artists/catalog',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Encoding': 'gzip, deflate, br',
        Prefer: 'code=200',
        apikey: 'af059dd1-1f0f-4acc-99d2-c27dd26a60d2'
      },
      params: {
          songstats_artist_id: artist.songstats_artist_id,
      }
    };
    await axios.request(options).then((response) => {
      setTracks(response.data);
      setTrackSelectIsEnabled(false);
    }).catch(function (error) {
      console.error(error);
    });
  };

  const getTrack = async () => {
    const options = {
      method: 'GET',
      url: 'https://stoplight.io/mocks/songstats/api/12173793/tracks/stats',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Encoding': 'gzip, deflate, br',
        Prefer: 'code=200',
        apikey: 'af059dd1-1f0f-4acc-99d2-c27dd26a60d2'
      },
      params: {
        songstats_track_id: track.songstats_track_id,
        source: "spotify"
      }
    };
    await axios.request(options).then((response) => {
      setTrack(response.data);
      setSubmitDisabled(true);
    }).catch(function (error) {
      console.error(error);
    });
  };

  const handleMint = async () => {
    setSubmitDisabled(false);
    // setSpin(true);

    const textileInstance = await TextileInstance.getInstance();

    const contract = new Contract(address, abi, library.getSigner());

    // CONTRACT INTERACTION 

    // contract....

  }

  const handleArtist = async (e) => {
    e.preventDefault();
    const i = parseInt(e.target.value);
    setArtist(artists[i]);
    getCatalog();
  }

  const handleTrack = async (e) => {
    e.preventDefault();
    const i = parseInt(e.target.value);
    setTrack(tracks[i]);
    getTrack();
  }

  return (
    
        <Layout>
          <Heading as="h1" mb="8">
            Creative
          </Heading>
          <Text mt="8" fontSize="xl">
            This page only works on the Kovan Testnet, Mumbai Testnet or on a Local Chain.
          </Text>
          {user ? (
          <Box maxWidth="container.sm" p="8" mt="8" bg="gray.900">
            <Text fontSize="xl" color={'white'}>Contract Address: {address}</Text>
            <Divider my="8" borderColor="gray.400" />
            <Box>
              <Text>Pick Your Stage Name To Fetch All Tracks</Text>
              <Select isDisabled={artistSelectIsDisabled} onChange={handleArtist}>
                {artists && console.log(artists)}
                {artists && artists.map((el, i) => {
                    return (
                      <option key={i} value={i}>{el.name}</option>
                    )
                  })
                }
              </Select>
              <Text>Pick A Track To Request An Advance</Text>
              <Select isDisabled={trackSelectIsEnabled} onChange={handleTrack}>
                {tracks && tracks.map((el, i) => (
                  <option value={i}>
                    <Text fontSize="lg" color={'white'}>Image: {el && <img src={el?.avatar} />}</Text>
                    <Text fontSize="lg" color={'white'}>Artists: {el && <span>{el?.artists}</span>}</Text>
                    <Text fontSize="lg" color={'white'}>Track: {el && <span>{el?.title}</span>}</Text>
                  </option>
                ))}
              </Select>
            </Box>
            <Divider my="8" borderColor="gray.400" />
            <Box>
              <Button
                mt="2"
                colorScheme="teal"
                onClick={handleMint}
                isDisabled={submitDisabled}
              >
                Initiate Advance Stream
              </Button>
            </Box>
            <Divider my="8" borderColor="gray.400" />
            <Button
                mt="2"
                colorScheme="teal"
                isDisabled={true}
              >
                Withdraw Funds
              </Button>
          </Box>
          ) : (
            <Flex>
              {library ? (
                <Flex>
                  <SignIn />
                  <SignUp />
                </Flex>
              ) : (
                <ConnectWallet />
              )}
            </Flex>
          )}
        </Layout>
  )
}

export default HomeIndex
