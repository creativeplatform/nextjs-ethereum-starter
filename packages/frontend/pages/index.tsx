import { Box, Button, Divider, Heading, Text, Select } from '@chakra-ui/react'
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



function HomeIndex(): JSX.Element {
  const { library } = useEthers();
  const { user } = useAuth();

  const [submitEnabled, setSubmitEnabled] = React.useState(false);
  // const [preview, setPreview] = React.useState("");

  const [artists, setArtists] = React.useState<Artist[]>();
  const [artist, setArtist] = React.useState<Artist>();
  const [tracks, setTracks] = React.useState<Track[]>();
  const [track, setTrack] = React.useState<Track>();
  const [trackSelectIsEnabled, setTrackSelectIsEnabled] = React.useState<boolean>(true);

  useEffect(() => {
    getArtists();
  }, []);

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
        name: user.username
      }
    };
    await axios.request(options).then((response) => {
      setArtists(response.data);
      if (response.data.length === 1) {
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
        songstats_artist_id: artist.songstats_artist_id
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
      setSubmitEnabled(true);
    }).catch(function (error) {
      console.error(error);
    });
  };

  const handleMint = async () => {
    setSubmitEnabled(false);
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
          { 
            artists ? (
              <Select onChange={handleArtist}>
                {
                  artists?.map((el, i) => {
                    return (
                      <option key={i} value={i}>el.name</option>
                    )
                  })
                }
              </Select>
            )
            : (
              // <Spinner />
              undefined
            )  
          }
          <Text mt="8" fontSize="xl">
            This page only works on the Kovan Testnet, Mumbai Testnet or on a Local Chain.
          </Text>
          <Box maxWidth="container.sm" p="8" mt="8" bg="gray.900">
            <Text fontSize="xl" color={'white'}>Contract Address: {address}</Text>
            <Divider my="8" borderColor="gray.400" />
            <Box>
              <Select isDisabled={trackSelectIsEnabled} onChange={handleTrack}>
                {tracks.map((el, i) => (
                  <option value={i}>
                    <Text fontSize="lg" color={'white'}>Image: {el && <img src={el?.avatar} />}</Text>
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
                isDisabled={submitEnabled}
              >
                Initiate Advance Stream
              </Button>
            </Box>
            <Divider my="8" borderColor="gray.400" />
            <Text mb="4" color={'white'}>This button only works on a Local Chain.</Text>
          </Box>
        </Layout>
  )
}

export default HomeIndex
