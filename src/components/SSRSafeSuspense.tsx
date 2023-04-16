import { Suspense, SuspenseProps, useEffect, useState } from "react";

const SSRSafeSuspense = (props: SuspenseProps) => {
  const [state, setState] = useState(false);
  useEffect(() => {
    setState(true);
  }, []);

  if (!state) {
    return <>{props.fallback}</>;
  }
  return <Suspense {...props} />;
};

export default SSRSafeSuspense;
