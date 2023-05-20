import { useEffect, useState } from "react";

/**
 * custom hook to determine inner width from global window variable
 */
export default function useWindowInnerWidth() {
  const { innerWidth } = getWindowSize();
  const [windowSize, setWindowSize] = useState({ innerWidth });
  // get and set window with resolution
  useEffect(() => {
    function handleWindowResize() {
      const { innerWidth } = getWindowSize();
      setWindowSize({ innerWidth });
    }
    window.addEventListener("resize", handleWindowResize);

    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, []);

  function getWindowSize() {
    const { innerWidth } = window;
    return { innerWidth };
  }
  return windowSize.innerWidth;
}
