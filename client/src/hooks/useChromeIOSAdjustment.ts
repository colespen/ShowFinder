import { useEffect } from "react";

/**
 * Detects Chrome browser on iOS using multiple detection methods for better reliability
 */
const detectChromeIOS = (): boolean => {
  const userAgent = navigator.userAgent;

  // 1. primary detection: Look for CriOS in user agent (most reliable)
  const hasCriOS = /CriOS/.test(userAgent);
  if (hasCriOS) {
    return true;
  }

  // 2. detection: iOS device with Chrome-specific indicators
  const isIOS = /iPad|iPhone|iPod/.test(userAgent);
  if (!isIOS) return false;

  // 3. check for Chrome-specific global objects
  const hasChrome = "chrome" in window && window.chrome !== null;

  // 4. detection: Safari-specific features absent
  const lacksSafariNotifications = !("webkitNotifications" in window);
  const lacksSafariPushManager = !("safari" in window);

  // alt: check for specific Chrome iOS behaviors
  const isNotSafari =
    !userAgent.includes("Safari") || userAgent.includes("CriOS");

  // Chrome iOS indicators: iOS + Chrome objects + lacks Safari features + not default Safari
  return (
    isIOS &&
    (hasChrome ||
      (lacksSafariNotifications && lacksSafariPushManager && isNotSafari))
  );
};

/**
 * Custom hook to adjust map height for Chrome iOS browser on iPhone 12 Mini
 * Uses multi-layered detection for better reliability
 * Addresses Chrome's bottom navigation bar overlap issue
 */
export const useChromeIOSAdjustment = (): void => {
  useEffect(() => {
    const isChromeIOS = detectChromeIOS();
    const isIPhone12Mini =
      window.innerWidth <= 375 && window.innerHeight <= 812;

    // Apply 20px adjustment if it's iPhone 12 Mini and Chrome iOS
    if (isIPhone12Mini && isChromeIOS) {
      document.documentElement.style.setProperty(
        "--chrome-ios-adjustment",
        "20px"
      );
    } else {
      document.documentElement.style.setProperty(
        "--chrome-ios-adjustment",
        "0px"
      );
    }
  }, []);
};
