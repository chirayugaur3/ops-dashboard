// PURPOSE: Centralized component exports for clean imports
// USAGE: import { KPICard, MapView, ... } from '@/components'

// ===== Core Dashboard Components =====
export { KPICard } from './KPICard';
export { ActivityChart } from './ActivityChart';
export { WorkloadBarList } from './WorkloadBarList';
export { ExceptionsTable } from './ExceptionsTable';
export { FiltersPanel } from './FiltersPanel';
export { MapView } from './MapView';
export { ShiftDetailModal } from './ShiftDetailModal';
export { ResolveDialog } from './ResolveDialog';

// ===== Layout & Navigation =====
export { Header } from './Header';
export { UserMenu } from './UserMenu';

// ===== UI Feedback =====
export { StaleDataIndicator } from './StaleDataIndicator';
export { ToastContainer, useToast } from './Toast';

// ===== Animation Wrappers =====
export { 
  AnimatedPage,
  StaggerContainer, 
  StaggerItem, 
  FadeInOnScroll,
  ScaleOnHover,
  SlideIn,
  AnimatedPresenceWrapper,
  AnimatedNumber,
  PulseAnimation,
  ShimmerLoader,
} from './AnimatedLayout';

// ===== Theme =====
export { ThemeToggle } from './ThemeToggle';

// Note: MapBoundsController is used internally by MapView, not exported here
// to avoid SSR issues with Leaflet
