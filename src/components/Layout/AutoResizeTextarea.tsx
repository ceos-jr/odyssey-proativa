import { forwardRef, Textarea, type TextareaProps } from "@chakra-ui/react";
import ResizeTextarea from "react-textarea-autosize";
import React from "react";

const AutoResizeTextarea = forwardRef<TextareaProps, "div">((props, ref) => {
  return (
    <Textarea
      minH="unset"
      overflow="hidden"
      w="100%"
      resize="none"
      ref={ref}
      minRows={1}
      bgColor="white"
      as={ResizeTextarea}
      {...props}
    />
  );
});
export default AutoResizeTextarea;
