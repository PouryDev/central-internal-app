import React from 'react';
import { Platform } from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { theme } from '../constants/theme';

const getChevronDirection = (direction: 'left' | 'right'): 'left' | 'right' => {
  if (Platform.OS === 'web') return direction;
  return direction === 'left' ? 'right' : 'left';
};

const defaultColor = theme.colors.text;

export const PlusIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 24,
  color = defaultColor,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 5v14M5 12h14"
      stroke={color}
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const UserIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 24,
  color = defaultColor,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="8" r="4" stroke={color} strokeWidth="2" />
    <Path
      d="M4 20c0-4 4-6 8-6s8 2 8 6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

export const MenuIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 24,
  color = defaultColor,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="6" width="18" height="2" rx="1" fill={color} />
    <Rect x="3" y="11" width="18" height="2" rx="1" fill={color} />
    <Rect x="3" y="16" width="18" height="2" rx="1" fill={color} />
  </Svg>
);

export const FolderIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 24,
  color = defaultColor,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M2 6a2 2 0 012-2h5l2 2h9a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const BuildingIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 24,
  color = defaultColor,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 21V9l8-4 8 4v12M4 13h16M9 21v-4h6v4"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ChartIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 24,
  color = defaultColor,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 3v18h18M7 16v-4M12 16V8M17 16v-6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const DiceIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 48,
  color = defaultColor,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect
      x="2"
      y="2"
      width="20"
      height="20"
      rx="4"
      stroke={color}
      strokeWidth="2"
      fill="none"
    />
    <Circle cx="8" cy="8" r="1.5" fill={color} />
    <Circle cx="16" cy="16" r="1.5" fill={color} />
    <Circle cx="8" cy="16" r="1.5" fill={color} />
    <Circle cx="16" cy="8" r="1.5" fill={color} />
    <Circle cx="12" cy="12" r="1.5" fill={color} />
  </Svg>
);

export const ClipboardIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 24,
  color = defaultColor,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const CashIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 24,
  color = defaultColor,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="2" y="6" width="20" height="12" rx="2" stroke={color} strokeWidth="2" />
    <Path d="M12 10v4M10 12h4" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const SettingsIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 24,
  color = defaultColor,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" />
    <Path
      d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

export const CoffeeIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 24,
  color = defaultColor,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 8h1a2 2 0 012 2v2a2 2 0 01-2 2h-1M4 8h10v8a2 2 0 01-2 2H6a2 2 0 01-2-2V8z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M14 8V4M10 8V4" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const DrinkIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 24,
  color = defaultColor,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M8 2h8v4l4 14H4L8 6V2zM8 6h8"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const SnackIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 24,
  color = defaultColor,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2v20M4 8h16M4 12h16M4 16h16"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

export const ClockIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 24,
  color = defaultColor,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <Path d="M12 6v6l4 2" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const UsersIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 24,
  color = defaultColor,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="9" cy="7" r="4" stroke={color} strokeWidth="2" />
    <Path
      d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2M16 3.13a4 4 0 010 7.75M21 21v-2a4 4 0 00-3-3.87M21 9a3 3 0 11-6 0 3 3 0 016 0z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const FilterIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 24,
  color = defaultColor,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/** Grid/dashboard icon for management panel */
export const LayoutGridIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 24,
  color = defaultColor,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="3" width="7" height="7" rx="1.5" stroke={color} strokeWidth="2" />
    <Rect x="14" y="3" width="7" height="7" rx="1.5" stroke={color} strokeWidth="2" />
    <Rect x="3" y="14" width="7" height="7" rx="1.5" stroke={color} strokeWidth="2" />
    <Rect x="14" y="14" width="7" height="7" rx="1.5" stroke={color} strokeWidth="2" />
  </Svg>
);

/** Wallet icon for cashier/payment panel */
export const WalletIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 24,
  color = defaultColor,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 7V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-2"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M17 12h4a1 1 0 011 1v2a1 1 0 01-1 1h-4"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const CodeIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 24,
  color = defaultColor,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M16 18l6-6-6-6M8 6l-6 6 6 6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ChevronIcon: React.FC<{
  size?: number;
  color?: string;
  direction?: 'left' | 'right';
}> = ({ size = 20, color = defaultColor, direction = 'right' }) => {
  const resolvedDirection = getChevronDirection(direction);
  return (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    style={resolvedDirection === 'left' ? { transform: [{ scaleX: -1 }] } : undefined}
  >
    <Path
      d="M9 18l6-6-6-6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
  );
};
