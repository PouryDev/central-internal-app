import { useWindowDimensions } from 'react-native';

export const BREAKPOINTS = { tablet: 600, tabletLarge: 900 };

export function useResponsive() {
  const { width } = useWindowDimensions();
  const isTablet = width >= BREAKPOINTS.tablet;
  const isTabletLarge = width >= BREAKPOINTS.tabletLarge;
  const contentMaxWidth = isTabletLarge ? 900 : isTablet ? 700 : width;
  const numColumns = isTabletLarge ? 3 : isTablet ? 2 : 1;
  return { width, isTablet, isTabletLarge, contentMaxWidth, numColumns };
}
