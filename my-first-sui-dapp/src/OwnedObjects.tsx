import {useCurrentAccount, useSuiClientQuery} from "@mysten/dapp-kit";
import {Flex, Heading, Text} from "@radix-ui/themes";

export function OwnedObjects() {
  const account = useCurrentAccount();
  const {data, isPending, error} = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: account?.address as string,
      options: {showContent: true},
    },
    {
      enabled: !!account,
    },
  );
  console.log(data)

  if (!account) {
    return;
  }

  if (error) {
    return <Flex>Error: {error.message}</Flex>;
  }

  if (isPending || !data) {
    return <Flex>Loading...</Flex>;
  }

  return (
    <Flex direction="column" my="2">
      {data.data.length === 0 ? (
        <Text>No objects owned by the connected wallet</Text>
      ) : (
        <Heading size="4">Objects owned by the connected wallet</Heading>
      )}
      {data.data.map((object, i) => (
        <div style={{paddingTop: "20px"}} key={i}>
          <Flex>
            <Text>Object ID: {object.data?.objectId}</Text>
          </Flex>
          <Flex>
            <Text>Content: {JSON.stringify(object.data?.content?.fields)}</Text>
          </Flex>
        </div>
      ))}
    </Flex>
  );
}
