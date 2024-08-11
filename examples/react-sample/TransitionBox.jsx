/* eslint-disable react/prop-types */
import { useState } from "react";
import { Box, Flex, Text } from "@radix-ui/themes";

export function TransitionBox({ color }) {
  const [active, setActive] = useState(false);

  return (
    <Box
      is="vgesturable"
      vgesturable="true"
      as="button"
      onClick={() => {
        setActive((c) => !c);
      }}
      width="100%"
      height="100%"
      style={{ backgroundColor: color }}
      class={active ? "transition box clicked" : "transition box"}
    >
      <Flex width="100%" height="100%" align="center" justify="center">
        <Text
          weight="bold"
          style={{ color: "white" }}
          className={active ? "transition clicked-t" : "transition "}
        >
          {active ? "You've Just Clicked!!!" : "Click Me!"}
        </Text>
      </Flex>
    </Box>
  );
}
