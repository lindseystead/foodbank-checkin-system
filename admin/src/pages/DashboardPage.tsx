/**
 * @fileoverview Dashboard page for Foodbank Check-In and Appointment System admin panel
 * 
 * This is the main dashboard page that provides an overview of daily
 * operations, real-time check-in data, system status, and quick
 * access to all admin functions for the food bank system.
 * 
 * @author Lindsey D. Stead
 * @version 1.0.0
 * @since 2025-10-20
 * @license Proprietary - see LICENSE file for details
 * 
 * @see {@link ../components/features/dashboard/} Dashboard components
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Button,
  VStack,
  useDisclosure,
} from '@chakra-ui/react';
import { FiSettings } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

// Import components
import {
  CSVHelpModal,
  DashboardHeader,
  DashboardOverview,
  DashboardTabs,
} from '../components/features/dashboard';
import { CheckInRecord } from '../types/checkIn';
import { api } from '../lib/api';
import { getDemoMode, onDemoModeChange } from '../lib/demoMode';
import { logger } from '../utils/logger';

const DashboardPage: React.FC = () => {
  const { isOpen: isCSVHelpOpen, onOpen: onCSVHelpOpen, onClose: onCSVHelpClose } = useDisclosure();
  const [checkIns, setCheckIns] = useState<CheckInRecord[]>([]);
  const [isLoadingCheckIns, setIsLoadingCheckIns] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [demoMode, setDemoMode] = useState(getDemoMode());
  const navigate = useNavigate();
  const isMountedRef = useRef(true);

  /**
   * Fetch today's check-ins from backend API
   * 
   * Best Practices:
   * - Filters to today's appointments only
   * - Handles connection errors gracefully
   * - Preserves existing data on transient errors
   * - Prevents state updates after component unmounts (race condition fix)
   */
  const fetchCheckIns = useCallback(async () => {
    try {
      const response = await api('/checkin/appointments');
      if (!response.ok) {
        throw new Error(`Failed to fetch check-ins: ${response.status}`);
      }
      const data = await response.json();
      
      // Prevent state update if component unmounted
      if (!isMountedRef.current) return;
      
      if (data.success && data.data) {
        const appointments = data.data as CheckInRecord[];
        const todayAppointments = demoMode
          ? appointments
          : appointments.filter((appointment: CheckInRecord) => {
              if (appointment.appointmentTime) {
                const appointmentDate = new Date(appointment.appointmentTime);
                const today = new Date();
                return appointmentDate.toDateString() === today.toDateString();
              }
              return false;
            });
        
        if (isMountedRef.current) {
          setCheckIns(todayAppointments);
        }
      } else {
        if (isMountedRef.current) {
          setCheckIns([]);
        }
      }
    } catch (error: any) {
      // Handle API not configured gracefully (expected in CSV-only mode)
      if (error?.message === 'API_NOT_CONFIGURED') {
        logger.debug('API not configured - CSV-only mode');
      } else if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        logger.debug('Backend server not available for check-ins, will retry later');
      } else {
        logger.error('Failed to fetch check-ins:', error);
      }
      // Keep existing data on connection errors
      if (!(error instanceof TypeError && error.message.includes('Failed to fetch'))) {
        if (isMountedRef.current) {
          setCheckIns([]);
        }
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoadingCheckIns(false);
        setLastRefresh(new Date());
      }
    }
  }, [demoMode]);

  useEffect(() => {
    return onDemoModeChange(setDemoMode);
  }, []);

  /**
   * Polling setup with Page Visibility API
   * 
   * Best Practices Implemented:
   * - Page Visibility API: Pauses polling when browser tab is hidden
   * - Optimized Interval: 2 minutes (reduced from 60s to minimize API calls)
   * - Smart Conditions: Only polls when tab is visible
   * - Proper Cleanup: Clears intervals and removes event listeners on unmount
   * 
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API} Page Visibility API
   */
  useEffect(() => {
    fetchCheckIns();
    
    // Use visibility API to pause polling when tab is hidden
    let interval: NodeJS.Timeout | null = null;
    let isVisible = !document.hidden;
    
    const startPolling = () => {
      if (interval) clearInterval(interval);
      interval = setInterval(() => {
        // Only poll if tab is visible
        if (!document.hidden) {
          fetchCheckIns();
        }
      }, 120000); // Poll every 2 minutes (optimized to reduce API calls)
    };
    
    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
      if (isVisible) {
        // Tab became visible - fetch immediately and start polling
        fetchCheckIns();
        startPolling();
      } else {
        // Tab hidden - stop polling
        if (interval) {
          clearInterval(interval);
          interval = null;
        }
      }
    };
    
    // Start polling if visible
    if (isVisible) {
      startPolling();
    }
    
    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      isMountedRef.current = false;
      if (interval) clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchCheckIns]);


  const handleQuickAction = (actionId: string) => {
    
    switch (actionId) {
      case 'link2feed-config':
        // Navigate to settings page for Link2Feed configuration
        navigate('/settings');
        break;
      case 'upload-csv':
        // Navigate to CSV upload page
        navigate('/csv-upload');
        break;
      case 'view-checkins':
        // Navigate to check-ins page
        navigate('/check-ins');
        break;
      case 'view-settings':
        // Navigate to settings page
        navigate('/settings');
        break;
      default:
        break;
    }
  };

  return (
    <>
      <VStack spacing={{ base: 4, md: 6 }} align="stretch" w="full" maxW="100%" minW="0">
        {/* Header Section */}
        <DashboardHeader
          title="Daily Operations Dashboard"
          description="Welcome to the Foodbank Check-In and Appointment System"
          lastUpdated={lastRefresh}
          onRefresh={fetchCheckIns}
          isLoading={isLoadingCheckIns}
          showDateBadge={true}
        />

        <DashboardOverview onAction={handleQuickAction} />

        <DashboardTabs
          checkIns={checkIns}
          isLoadingCheckIns={isLoadingCheckIns}
          onRefreshCheckIns={fetchCheckIns}
        />
      </VStack>

      {/* CSV Help Button */}
      <Box 
        position="fixed" 
        bottom={{ base: 4, sm: 4, md: 4 }} 
        right={{ base: 4, sm: 4, md: 4 }}
        zIndex={10}
        display={{ base: "none", md: "block" }}
      >
        <Button
          onClick={onCSVHelpOpen}
          colorScheme="brand"
          size="md"
          borderRadius="full"
          boxShadow="lg"
          leftIcon={<FiSettings />}
          color="white"
          _hover={{ color: "white" }}
          _active={{ color: "white" }}
        >
          Quick Help
        </Button>
      </Box>

      {/* Modals */}
      <CSVHelpModal isOpen={isCSVHelpOpen} onClose={onCSVHelpClose} />
    </>
  );
};

export default DashboardPage;
