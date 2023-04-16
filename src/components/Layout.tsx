import { Box, Heading, Text } from "@chakra-ui/react";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
  header?: ReactNode;
}

const Layout = ({ children, header }: LayoutProps) => {
  return (
    <Box maxW="2xl" w="full" mx="auto" p="4">
      {header}
      <main>{children}</main>
    </Box>
  );
};

interface HeaderProps {
  children: ReactNode;
  description?: string;
  rightNode?: ReactNode;
}

const Header = ({ children, description, rightNode }: HeaderProps) => {
  return (
    <Box
      as="header"
      marginBottom="4"
      display="flex"
      justifyContent="space-between"
    >
      <Box>
        <Heading as="h1" color="gray.300">
          {children}
        </Heading>
        {description && (
          <Text color="whiteAlpha.700" fontSize="md" marginTop="1">
            {description}
          </Text>
        )}
      </Box>
      {rightNode && <Box>{rightNode}</Box>}
    </Box>
  );
};

Layout.Header = Header;

export default Layout;
