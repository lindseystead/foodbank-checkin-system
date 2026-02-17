/**
 * @fileoverview Status color utility for Foodbank Check-In and Appointment System admin panel
 * 
 * This module provides consistent status color mapping across all admin panel features.
 * It ensures that appointment statuses use the same colors throughout the application.
 * 
 * IMPORTANT: These colors must match the analytics chart colors for consistency:
 * - Completed/Collected: Green (#6B9F7A)
 * - Pending/Rescheduled: Blue (#4A6B8C) - future appointments that haven't happened yet
 * - No Show/Not Collected: Red (#D85A4A) - missed appointments
 * 
 * @author Lindsey D. Stead
 * @version 1.0.0
 * @since 2025-10-20
 * @license Proprietary - see LICENSE file for details
 */

/**
 * Status color definitions matching analytics chart
 * IMPORTANT: These must match the colors used in CheckInAnalyticsChart.tsx
 */
export const STATUS_COLORS = {
  // Completed/Collected - Green
  completed: {
    hex: '#6B9F7A',
    chakra: 'green',
    name: 'green'
  },
  // Pending/Rescheduled - Teal Green (future appointments)
  pending: {
    hex: '#4A6B8C',
    chakra: 'blue', // Chakra blue maps to teal green
    name: 'blue'
  },
  // No Show/Not Collected - Red
  noShow: {
    hex: '#D85A4A',
    chakra: 'red',
    name: 'red'
  },
  // Shipped - Purple (for in-transit)
  shipped: {
    hex: '#805AD5',
    chakra: 'purple',
    name: 'purple'
  },
  // Cancelled - Gray
  cancelled: {
    hex: '#718096',
    chakra: 'gray',
    name: 'gray'
  }
} as const;

/**
 * Get status color for Chakra UI components (Badge, etc.)
 * Returns Chakra color scheme name for consistent styling
 * 
 * @param status - Appointment status
 * @param checkIn - Optional check-in record for late/missed detection
 * @returns Chakra color scheme name
 */
export const getStatusColorScheme = (
  status: string,
  checkIn?: { appointmentTime?: string }
): string => {
  // Check if appointment is late or missed (for Pending status)
  if (status === 'Pending' && checkIn?.appointmentTime) {
    const appointmentTime = new Date(checkIn.appointmentTime);
    const now = new Date();
    const hoursPast = (now.getTime() - appointmentTime.getTime()) / (1000 * 60 * 60);
    
    if (hoursPast >= 4) {
      return STATUS_COLORS.noShow.chakra; // Missed - red
    } else if (hoursPast >= 1) {
      return 'orange'; // Late - orange
    }
  }
  
  switch (status) {
    case 'Collected':
      return STATUS_COLORS.completed.chakra; // Green
    case 'Shipped':
      return STATUS_COLORS.shipped.chakra; // Purple
    case 'Pending':
      return STATUS_COLORS.pending.chakra; // Teal Green (blue in Chakra)
    case 'Rescheduled':
      return STATUS_COLORS.pending.chakra; // Teal Green (blue in Chakra)
    case 'Not Collected':
      return STATUS_COLORS.noShow.chakra; // Red
    case 'Cancelled':
      return STATUS_COLORS.cancelled.chakra; // Gray
    default:
      return STATUS_COLORS.cancelled.chakra; // Gray
  }
};

/**
 * Get status hex color for direct color usage
 * Returns hex color code for consistent styling
 * 
 * @param status - Appointment status
 * @param checkIn - Optional check-in record for late/missed detection
 * @returns Hex color code
 */
export const getStatusColorHex = (
  status: string,
  checkIn?: { appointmentTime?: string }
): string => {
  // Check if appointment is late or missed (for Pending status)
  if (status === 'Pending' && checkIn?.appointmentTime) {
    const appointmentTime = new Date(checkIn.appointmentTime);
    const now = new Date();
    const hoursPast = (now.getTime() - appointmentTime.getTime()) / (1000 * 60 * 60);
    
    if (hoursPast >= 4) {
      return STATUS_COLORS.noShow.hex; // Missed - red
    } else if (hoursPast >= 1) {
      return '#E89B5C'; // Late - orange
    }
  }
  
  switch (status) {
    case 'Collected':
      return STATUS_COLORS.completed.hex; // Green (#6B9F7A)
    case 'Shipped':
      return STATUS_COLORS.shipped.hex; // Purple
    case 'Pending':
      return STATUS_COLORS.pending.hex; // Blue (#4A6B8C)
    case 'Rescheduled':
      return STATUS_COLORS.pending.hex; // Blue (#4A6B8C)
    case 'Not Collected':
      return STATUS_COLORS.noShow.hex; // Red (#D85A4A)
    case 'Cancelled':
      return STATUS_COLORS.cancelled.hex; // Gray
    default:
      return STATUS_COLORS.cancelled.hex; // Gray
  }
};

