import { useState, useEffect } from "react";
import { Grid } from "@radix-ui/themes";
import { TransitionBox } from "./TransitionBox";
import { VGesture } from "@dvgs/vgesture";
import { ClickGesturePlugin } from "@dvgs/vgesture/plugins";

function App() {
  const [gesture] = useState(new VGesture({ enableHelper: true }));

  useEffect(() => {
    async function setup() {
      await gesture.initialize();
      gesture.register(new ClickGesturePlugin());
      await gesture.startDetection();
    }

    if (!gesture.initialized) {
      setup();
    }

    return () => {
      gesture.endDetection();
    };
  }, []);

  return (
    <>
      <Grid
        width="100vw"
        height="100vh"
        rows="repeat(2, 1fr)"
        columns="repeat(2,1fr)"
        gap="0"
      >
        <TransitionBox color="var(--mint-10)" />
        <TransitionBox color="var(--purple-10)" />
        <TransitionBox color="var(--crimson-10)" />
        <TransitionBox color="var(--lime-10)" />
      </Grid>
    </>
  );
}

export default App;
