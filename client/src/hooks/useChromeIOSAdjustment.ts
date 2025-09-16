import { useEffect } from "react";

/**
 * Custom hook to adjust map height for Chrome iOS browser on iPhone 12 Mini
 * Addresses Chrome's bottom navigation bar overlap issue
 */
export const useChromeIOSAdjustment = (): void => {
  useEffect(() => {
    const userAgent = navigator.userAgent;
    const isChromeIOS = /CriOS/.test(userAgent);
    const isIPhone12Mini =
      window.innerWidth <= 375 && window.innerHeight <= 812;

    // apply 10px adjustment if it's iPhone 12 Mini and Chrome iOS
    if (isIPhone12Mini && isChromeIOS) {
      document.documentElement.style.setProperty(
        "--chrome-ios-adjustment",
        "10px"
      );
    } else {
      document.documentElement.style.setProperty(
        "--chrome-ios-adjustment",
        "0px"
      );
    }
  }, []);
};
