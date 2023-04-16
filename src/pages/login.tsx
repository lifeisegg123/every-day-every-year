import { Box, Button, Flex } from "@chakra-ui/react";
import { signIn } from "next-auth/react";
import Layout from "src/components/Layout";

const login = () => {
  return (
    <Layout>
      <Flex
        direction="column"
        position="fixed"
        left="50%"
        top="50%"
        transform="translate(-50%, -50%)"
        gap="4"
      >
        <Layout.Header description="로그인하기">매일 매년</Layout.Header>
        <Button bg="yellow.400" size="lg" onClick={() => signIn("kakao")}>
          카카오톡으로 로그인
        </Button>
      </Flex>
    </Layout>
  );
};

export default login;
