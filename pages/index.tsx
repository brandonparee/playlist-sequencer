import { Button } from '@chakra-ui/button';
import { Box, Heading, VStack, Text } from '@chakra-ui/layout';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { getProviders, signIn } from 'next-auth/react';

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const providers = await getProviders();
  return {
    props: { providers },
  };
}

export default function SignIn({
  providers,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  if (!providers) {
    return null;
  }

  const { spotify } = providers;

  return (
    <Box bgColor="green.400">
      <Box
        maxWidth="2xl"
        marginX="auto"
        textAlign="center"
        paddingY={{ base: 20, md: 16 }}
        paddingX={{ base: 6, md: 4, lg: 8 }}
      >
        <VStack spacing="4">
          <Heading
            fontSize={{ base: '4xl', md: '3xl' }}
            fontWeight={900}
            textColor="white"
          >
            Playlist Sequencer
          </Heading>
          <Text textColor="white">
            Have you ever shuffled a playlist and had a song come on that needs
            to be accompanied by another song, so you need to play those songs
            together then resume the playlist afterwards?
          </Text>
          <Text textColor="white">
            The Playlist Sequencer allows you to create a shuffled copy of a
            playlist with tracks that are linked to play one after another.
            Because some songs belong together.
          </Text>
          <Button onClick={() => signIn(spotify.id)}>
            Sign in with Spotify
          </Button>
        </VStack>
      </Box>
    </Box>
  );
}
