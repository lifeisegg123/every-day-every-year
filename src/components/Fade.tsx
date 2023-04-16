import {
  Fade as ChakraFade,
  FadeProps as ChakraFadeProps,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

interface FadeProps extends ChakraFadeProps {
  delayMs?: number;
}

const Fade = ({ delayMs, ...props }: FadeProps) => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    setTimeout(() => setShow(true), delayMs);
  }, [delayMs]);

  return <ChakraFade in={show || props.in} {...props}></ChakraFade>;
};

export default Fade;
