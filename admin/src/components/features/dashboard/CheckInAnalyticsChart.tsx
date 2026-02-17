/**
 * @fileoverview Check-in analytics chart component for Foodbank Check-In and Appointment System admin panel
 * 
 * This component provides visual analytics and charts for check-in data,
 * including trends, patterns, and statistical insights for
 * food bank operations monitoring and reporting.
 * 
 * @author Lindsey D. Stead
 * @version 1.0.0
 * @since 2025-10-20
 * @license Proprietary - see LICENSE file for details
 * 
 * @see {@link ../DashboardPage.tsx} Dashboard page
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Grid,
  GridItem,
  Spinner,
  Center
} from '@chakra-ui/react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { api } from '../../../lib/api';
import { getDemoMode, onDemoModeChange } from '../../../lib/demoMode';
import { fetchStatusDay } from '../../../lib/statusService';
import { logger } from '../../../utils/logger';


interface ChartData {
  time: string;
  timeLabel: string;
  completed: number;
  pending: number;
  noShow: number;
  total: number;
  hour: number;
  minute: number;
  isEven: boolean;
}

interface DashboardStats {
  totalCheckIns: number;
  completed: number;
  pending: number;
  noShow: number;
  averageWaitTime: number;
  currentHour: number;
  peakHour: number;
  peakCount: number;
}

const CheckInAnalyticsChart: React.FC = () => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalCheckIns: 0,
    completed: 0,
    pending: 0,
    noShow: 0,
    averageWaitTime: 0,
    currentHour: new Date().getHours(),
    peakHour: 0,
    peakCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [demoMode, setDemoMode] = useState(getDemoMode());
  const [csvStatus, setCsvStatus] = useState<{
    loading: boolean;
    hasData: boolean;
    count: number;
    error: string | null;
  }>({
    loading: true,
    hasData: false,
    count: 0,
    error: null
  });
  const isMountedRef = useRef(true);



  // Fetch CSV status (same as sidebar)
  const notifyDataVersionChange = (dataVersion: string | number) => {
    localStorage.setItem('dataVersion', dataVersion.toString());
    window.dispatchEvent(
      new CustomEvent('dataVersionChanged', { detail: { dataVersion } })
    );
  };

  const fetchCsvStatus = async () => {
    try {
      const result = await fetchStatusDay();
      
      // Prevent state update if component unmounted
      if (!isMountedRef.current) return;
      
      if (result.success) {
        const lastVersion = localStorage.getItem('dataVersion');
        if (result.dataVersion && result.dataVersion.toString() !== lastVersion) {
          notifyDataVersionChange(result.dataVersion);
        }
        
        if (isMountedRef.current) {
          setCsvStatus({
            loading: false,
            hasData: result.data?.data?.present || false,
            count: result.data?.data?.count || 0,
            error: null
          });
        }
      } else {
        if (isMountedRef.current) {
          setCsvStatus({
            loading: false,
            hasData: false,
            count: 0,
            error: result.error || 'Failed to fetch status'
          });
        }
      }
    } catch (err: any) {
      // Handle API not configured gracefully (expected in CSV-only mode)
      if (err?.message === 'API_NOT_CONFIGURED') {
        logger.debug('API not configured - CSV-only mode');
        if (isMountedRef.current) {
          setCsvStatus({
            loading: false,
            hasData: false,
            count: 0,
            error: null // Don't show error for expected state
          });
        }
      } else if (err?.message === 'RATE_LIMITED') {
        logger.debug('Rate limited - skipping CSV status update');
      } else if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
        logger.debug('Backend server not available for CSV status, will retry later');
        if (isMountedRef.current) {
          setCsvStatus({
            loading: false,
            hasData: false,
            count: 0,
            error: null
          });
        }
      } else {
        logger.error('CSV status fetch error:', err);
        if (isMountedRef.current) {
          setCsvStatus({
            loading: false,
            hasData: false,
            count: 0,
            error: 'No CSV data available'
          });
        }
      }
    }
  };

  // Fetch real-time analytics data from appointments
  // IMPORTANT: Includes ALL appointments including Pending status
  // This ensures the dashboard shows all scheduled appointments
  // OPTIMIZED: Only sets loading on initial load, not on every poll to prevent glitchy behavior
  const fetchAnalytics = async (isInitialLoad: boolean = false) => {
    try {
      // Only show loading spinner on initial load, not on every poll
      if (isInitialLoad && isMountedRef.current) {
        setIsLoading(true);
      }
      
      const response = await api('/checkin/appointments');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Prevent state update if component unmounted
      if (!isMountedRef.current) return;
      
      if (data.success && data.data) {
        const appointments = data.data;
        
        // IMPORTANT: Include ALL appointments including Pending status
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        
        const todayAppointments = demoMode
          ? appointments
          : appointments.filter((a: any) => {
              if (a.appointmentTime) {
                try {
                  const apptDate = new Date(a.appointmentTime);
                  if (!isNaN(apptDate.getTime())) {
                    const apptDateStr = apptDate.toISOString().split('T')[0];
                    return apptDateStr === todayStr;
                  }
                } catch (e) {
                  // Invalid date, continue to next check
                }
              }
              if (a.pickUpISO) {
                try {
                  const apptDate = new Date(a.pickUpISO);
                  if (!isNaN(apptDate.getTime())) {
                    const apptDateStr = apptDate.toISOString().split('T')[0];
                    return apptDateStr === todayStr;
                  }
                } catch (e) {
                  // Invalid date, continue to next check
                }
              }
              if (a.pickUpDate) {
                return a.pickUpDate === todayStr;
              }
              return false;
            });
        
        // Calculate stats - IMPORTANT: Includes Pending appointments
        // Colors must match summary panels:
        // - Completed: Green (#8CAB6D) - Collected/Shipped
        // - Pending: Teal Green (#2B7B8C) - Pending/Rescheduled (future appointments that haven't happened yet)
        // - No Show: Red (#E76F51) - Not Collected/Cancelled (missed appointments)
        const completed = todayAppointments.filter((a: any) => a.status === 'Collected' || a.status === 'Shipped').length;
        // Pending: Waiting to be collected or rescheduled (teal green in chart, matches summary panel)
        // IMPORTANT: This includes all Pending appointments for today (future appointments that haven't happened yet)
        const pending = todayAppointments.filter((a: any) => a.status === 'Pending' || a.status === 'Rescheduled').length;
        // No Show: Not collected or cancelled (red in chart, matches summary panel)
        const noShow = todayAppointments.filter((a: any) => a.status === 'Not Collected' || a.status === 'Cancelled').length;
        
        // Generate new chart data
        const newChartData = generateTimeIntervalChartData(todayAppointments);
        
        // OPTIMIZED: Only update state if data actually changed to prevent unnecessary re-renders
        setStats(prevStats => {
          const newStats = {
            totalCheckIns: todayAppointments.length,
            completed,
            pending,
            noShow,
            averageWaitTime: 0,
            currentHour: new Date().getHours(),
            peakHour: 0,
            peakCount: 0
          };
          
          // Only update if stats changed
          if (
            prevStats.totalCheckIns !== newStats.totalCheckIns ||
            prevStats.completed !== newStats.completed ||
            prevStats.pending !== newStats.pending ||
            prevStats.noShow !== newStats.noShow
          ) {
            return newStats;
          }
          return prevStats;
        });
        
        // Only update chart data if it changed (prevent unnecessary re-renders)
        setChartData(prevData => {
          // Simple comparison - if lengths differ, data changed
          if (prevData.length !== newChartData.length) {
            return newChartData;
          }
          // Deep comparison for first and last items to catch changes
          if (newChartData.length > 0 && prevData.length > 0) {
            const firstChanged = 
              prevData[0]?.completed !== newChartData[0]?.completed ||
              prevData[0]?.pending !== newChartData[0]?.pending ||
              prevData[0]?.noShow !== newChartData[0]?.noShow;
            const lastChanged = 
              prevData[prevData.length - 1]?.completed !== newChartData[newChartData.length - 1]?.completed ||
              prevData[prevData.length - 1]?.pending !== newChartData[newChartData.length - 1]?.pending ||
              prevData[prevData.length - 1]?.noShow !== newChartData[newChartData.length - 1]?.noShow;
            
            if (firstChanged || lastChanged) {
              return newChartData;
            }
          }
          return prevData; // No change, keep previous data
        });
        
        setLastUpdate(new Date());
      } else {
        // Only update if we don't have data yet
        if (isMountedRef.current) {
          setStats(prevStats => {
            if (prevStats.totalCheckIns === 0) {
              return prevStats; // Already empty, no need to update
            }
            return {
              totalCheckIns: 0,
              completed: 0,
              pending: 0,
              noShow: 0,
              averageWaitTime: 0,
              currentHour: new Date().getHours(),
              peakHour: 0,
              peakCount: 0
            };
          });
          setChartData(prevData => prevData.length === 0 ? prevData : []);
          setLastUpdate(new Date());
        }
      }
    } catch (error: any) {
      // Handle API not configured gracefully (expected in CSV-only mode)
      if (error?.message === 'API_NOT_CONFIGURED') {
        logger.debug('API not configured - CSV-only mode');
      } else if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        logger.debug('Backend server not available for analytics, will retry later');
      } else {
        logger.error('Error fetching analytics:', error);
      }
      // Don't reset stats on connection errors, keep existing data
      // Only update on non-connection errors
      if (!(error instanceof TypeError && error.message.includes('Failed to fetch'))) {
        if (isMountedRef.current) {
          setStats(prevStats => {
            if (prevStats.totalCheckIns === 0) {
              return prevStats; // Already empty
            }
          return {
            totalCheckIns: 0,
            completed: 0,
            pending: 0,
            noShow: 0,
            averageWaitTime: 0,
            currentHour: new Date().getHours(),
            peakHour: 0,
            peakCount: 0
          };
          });
          setChartData(prevData => prevData.length === 0 ? prevData : []);
          setLastUpdate(new Date());
        }
      }
    } finally {
      // Only set loading to false on initial load
      if (isInitialLoad && isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };


  // Generate chart data based on CSV appointments (by pickup times)
  // IMPORTANT: Always generates bars for ALL time slots in the configured window.
  // Demo mode expands the window to the full day so PM data is visible.
  const generateTimeIntervalChartData = (appointments: any[]): ChartData[] => {
    const intervals: ChartData[] = [];
    
    // Build today's string once
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const todayStr = `${y}-${m}-${d}`;

    // Accepted slots every 15 minutes.
    // Demo mode shows the full day (00:00–23:45). Standard mode shows 08:00–20:00.
    const startHour = demoMode ? 0 : 8;
    const endHour = demoMode ? 23 : 20;
    const isWithinWindow = (dt: Date) => {
      if (demoMode) return true;
      const hour = dt.getHours();
      return hour >= 8 && hour <= 20; // Include 8 PM (20:00)
    };

    // Generate full range (every 15 minutes)
    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        // Build interval slot HH:MM
        // Count appointments for this exact time slot
        // IMPORTANT: Include ALL appointments for today, including FUTURE appointments (pending status)
        const intervalAppointments = appointments.filter((appointment: any) => {
          // Determine a Date for this appointment using available fields
          // Try multiple fields to ensure we catch all appointments, including future ones
          let dt: Date | null = null;
          
          // Try appointmentTime first (most reliable)
          if (appointment.appointmentTime) {
            try {
              const t = new Date(appointment.appointmentTime);
              if (!isNaN(t.getTime())) dt = t;
            } catch (e) {
              // Invalid date, continue
            }
          }
          
          // Try pickUpISO (timezone-aware ISO string)
          if (!dt && appointment.pickUpISO) {
            try {
              const t = new Date(appointment.pickUpISO);
              if (!isNaN(t.getTime())) dt = t;
            } catch (e) {
              // Invalid date, continue
            }
          }
          
          // Try pickUpTime + pickUpDate (fallback)
          if (!dt && typeof appointment.pickUpTime === 'string' && appointment.pickUpTime.match(/^\d{2}:\d{2}$/)) {
            try {
              const dateStr = appointment.pickUpDate || todayStr;
              const t = new Date(`${dateStr}T${appointment.pickUpTime}:00`);
              if (!isNaN(t.getTime())) dt = t;
            } catch (e) {
              // Invalid date, continue
            }
          }

          if (!dt) return false;

          // Only include today's appointments in the 08:00–20:00 window
          // IMPORTANT: Include FUTURE appointments (appointments after current time)
          const sameDay = dt.getFullYear() === now.getFullYear() && 
                         dt.getMonth() === now.getMonth() && 
                         dt.getDate() === now.getDate();
          
          if (!demoMode && !sameDay) return false;
          
          if (!isWithinWindow(dt)) return false;

          // Exact match for 15-minute slots
          // IMPORTANT: This includes FUTURE appointments (pending status) - no time-based filtering
          return dt.getHours() === hour && dt.getMinutes() === minute;
        });
        
        // Count by status with proper color mapping (must match summary panels)
        // IMPORTANT: Colors must match summary panels:
        // - Green = Collected/Shipped (completed)
        // - Teal Green = Pending/Rescheduled (pending - FUTURE appointments that haven't happened yet)
        // - Red = Not Collected/Cancelled (no show - missed appointments)
        const completed = intervalAppointments.filter(a => a.status === 'Collected' || a.status === 'Shipped').length;
        // Pending: FUTURE appointments that haven't happened yet (teal green in chart)
        const pending = intervalAppointments.filter(a => a.status === 'Pending' || a.status === 'Rescheduled').length;
        const noShow = intervalAppointments.filter(a => a.status === 'Not Collected' || a.status === 'Cancelled').length;
        
        
        // Convert to 12-hour format for display
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        const ampm = hour < 12 ? 'AM' : 'PM';
        const timeLabel = `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
        
        // IMPORTANT: Always create chart data entry for ALL time slots, even if empty
        // This ensures future time slots with pending appointments are displayed
        intervals.push({
          time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
          timeLabel,
          completed,
          pending,
          noShow,
          total: completed + pending + noShow,
          hour,
          minute,
          isEven: intervals.length % 2 === 0
        });
      }
    }
    
    // IMPORTANT: Return ALL intervals, including future ones with pending appointments
    return intervals;
  };

  /**
   * Polling setup with Page Visibility API
   * 
   * Best Practices Implemented:
   * - Page Visibility API: Pauses polling when browser tab is hidden
   * - Real-time Updates: 30 second interval for responsive dashboard
   * - Smart Conditions: Only polls when tab is visible
   * - Proper Cleanup: Clears intervals and removes event listeners on unmount
   * - State Management: Prevents race conditions with proper loading states
   * 
   * IMPORTANT: Removed hover pause to prevent glitchy behavior.
   * Chart updates smoothly without interrupting user interaction.
   * 
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API} Page Visibility API
   */
  useEffect(() => {
    // Initial fetch with loading state
    fetchCsvStatus();
    fetchAnalytics(true); // Pass true for initial load to show loading spinner
    
    let interval: NodeJS.Timeout | null = null;
    let isVisible = !document.hidden;
    let isFetching = false; // Prevent concurrent fetches
    
    const startPolling = () => {
      if (interval) clearInterval(interval);
      interval = setInterval(() => {
        // Only poll if tab is visible and not already fetching
        if (!document.hidden && !isFetching) {
          isFetching = true;
          // OPTIMIZED: Don't show loading spinner on polls, only on initial load
          Promise.all([fetchCsvStatus(), fetchAnalytics(false)])
            .finally(() => {
              isFetching = false;
            });
        }
      }, 30000); // Poll every 30 seconds for real-time updates
    };
    
    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
      if (isVisible) {
        // Tab became visible - fetch immediately (without loading spinner) and start polling
        fetchCsvStatus();
        fetchAnalytics(false); // Don't show loading spinner on visibility change
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
  }, []); // Empty dependency array - only run once on mount

  // Track screen width changes for responsive chart
  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    return onDemoModeChange(setDemoMode);
  }, []);

  useEffect(() => {
    fetchAnalytics(false);
  }, [demoMode]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const completed = payload.find((p: any) => p.dataKey === 'completed')?.value || 0;
      const pending = payload.find((p: any) => p.dataKey === 'pending')?.value || 0;
      const noShow = payload.find((p: any) => p.dataKey === 'noShow')?.value || 0;
      const total = completed + pending + noShow;
      
      return (
        <Box 
          bg="white" 
          p={5} 
          borderRadius="xl" 
          border="2px solid" 
          borderColor="gray.200" 
          boxShadow="2xl"
          minW="280px"
        >
          <VStack spacing={4} align="start">
            <Box textAlign="center" w="full">
              <Text fontWeight="bold" fontSize="lg" color="#2B7B8C" mb={1}>
                {label}
              </Text>
              <Text fontSize="sm" color="#2B7B8C">
                Appointment Summary
              </Text>
            </Box>
            
            <HStack spacing={4} justify="center" w="full">
              <VStack align="center" spacing={2} minW="70px">
                <Box
                  bg="cofb.green"
                  borderRadius="full"
                  p={2}
                  boxShadow="md"
                >
                  <Text fontSize="lg" color="white" fontWeight="bold">
                    {completed}
                  </Text>
                </Box>
                <Text fontSize="xs" color="#6B8E4A" fontWeight="600" textAlign="center">
                  ✅ Completed
                </Text>
              </VStack>
              
              <VStack align="center" spacing={2} minW="70px">
                <Box
                  bg="#2B7B8C"
                  borderRadius="full"
                  p={2}
                  boxShadow="md"
                >
                  <Text fontSize="lg" color="white" fontWeight="bold">
                    {pending}
                  </Text>
                </Box>
                <Text fontSize="xs" color="#2B7B8C" fontWeight="600" textAlign="center">
                  📅 Pending
                </Text>
              </VStack>
              
              <VStack align="center" spacing={2} minW="70px">
                <Box
                  bg="#E76F51"
                  borderRadius="full"
                  p={2}
                  boxShadow="md"
                >
                  <Text fontSize="lg" color="white" fontWeight="bold">
                    {noShow}
                  </Text>
                </Box>
                <Text fontSize="xs" color="#E76F51" fontWeight="600" textAlign="center">
                  ❌ No Show
                </Text>
              </VStack>
            </HStack>
            
            {total > 0 && (
              <Box 
                w="full" 
                bg="gray.50" 
                borderRadius="lg" 
                p={3} 
                textAlign="center"
                border="1px solid"
                borderColor="gray.200"
              >
                <Text fontSize="sm" color="gray.700" fontWeight="medium">
                  Total Appointments: <Text as="span" fontWeight="bold" color="#2B7B8C">{total}</Text>
                </Text>
              </Box>
            )}
          </VStack>
        </Box>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Center py={8}>
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text color="gray.600" fontWeight="medium">Loading analytics data...</Text>
        </VStack>
      </Center>
    );
  }

  // Check if we have no data
  const hasNoData = stats.totalCheckIns === 0 && stats.completed === 0 && stats.pending === 0;

  return (
    <Box w="full" maxW="100%" minW="0" minH="100%" position="relative" overflow="hidden">
      <VStack spacing={4} align="stretch" w="full" maxW="100%" minW="0">
        {/* Simple Header */}
        <Box p={{ base: 3, sm: 4 }} bg="white" borderRadius="lg" border="1px solid" borderColor="gray.200" boxShadow="sm" w="full" maxW="100%" minW="0" overflow="hidden">
          <HStack justify="space-between" align="center" flexWrap="wrap" gap={{ base: 2, sm: 3 }} w="full" maxW="100%">
            <Text color="gray.600" fontSize={{ base: "xs", sm: "sm" }} fontWeight="500" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis" minW="0" flex={1}>
              Last updated: {lastUpdate.toLocaleTimeString()}
            </Text>
            <Badge 
              colorScheme="green" 
              fontSize={{ base: "2xs", sm: "xs" }} 
              px={{ base: 2, sm: 3 }} 
              py={1} 
              borderRadius="full"
              fontWeight="600"
              flexShrink={0}
            >
              LIVE
            </Badge>
          </HStack>
        </Box>

        {/* Statistics Cards - Symmetrical Layout */}
        <Grid 
          templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }} 
          gap={{ base: 3, sm: 4 }}
          alignItems="stretch"
          w="full"
          maxW="100%"
          minW="0"
        >
          <GridItem minW="0" w="full" h="full">
            <Box 
              bg={hasNoData ? "gray.50" : "white"} 
              p={{ base: 3, sm: 4, md: 5 }} 
              borderRadius="lg" 
              border="1px solid" 
              borderColor={hasNoData ? "gray.200" : "#2B7B8C"} 
              boxShadow="sm"
              transition="all 0.2s"
              h="100%"
              minH={{ base: "100px", sm: "120px", md: "140px" }}
              display="flex"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
              w="full"
              maxW="100%"
              overflow="hidden"
            >
              <VStack spacing={{ base: 1.5, sm: 2, md: 3 }} align="center" justify="center" h="full" w="full" maxW="100%">
                <Text 
                  fontSize={{ base: "2xs", sm: "xs", md: "sm" }} 
                  color={hasNoData ? "gray.500" : "#2B7B8C"} 
                  fontWeight="600" 
                  textAlign="center" 
                  w="full"
                  maxW="100%"
                  noOfLines={2}
                  px={1}
                >
                  📅 Total Appointments
                </Text>
                <Text 
                  fontSize={{ base: "lg", sm: "xl", md: "2xl" }} 
                  color={hasNoData ? "gray.400" : "#2B7B8C"} 
                  fontWeight="bold" 
                  lineHeight="1"
                  whiteSpace="nowrap"
                >
                  {stats.totalCheckIns}
                </Text>
                <Text 
                  fontSize={{ base: "2xs", sm: "xs" }} 
                  color={hasNoData ? "gray.400" : "#2B7B8C"} 
                  textAlign="center" 
                  w="full"
                  maxW="100%"
                  noOfLines={1}
                  px={1}
                >
                  {hasNoData ? "No data" : "Scheduled Today"}
                </Text>
              </VStack>
            </Box>
          </GridItem>
          
          <GridItem minW="0" w="full" h="full">
            <Box 
              bg={hasNoData ? "gray.50" : "white"} 
              p={{ base: 3, sm: 4, md: 5 }} 
              borderRadius="lg" 
              border="1px solid" 
              borderColor={hasNoData ? "gray.200" : "#8CAB6D"} 
              boxShadow="sm"
              transition="all 0.2s"
              h="100%"
              minH={{ base: "100px", sm: "120px", md: "140px" }}
              display="flex"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
              w="full"
              maxW="100%"
              overflow="hidden"
            >
              <VStack spacing={{ base: 1.5, sm: 2, md: 3 }} align="center" justify="center" h="full" w="full" maxW="100%">
                <Text 
                  fontSize={{ base: "2xs", sm: "xs", md: "sm" }} 
                  color={hasNoData ? "gray.500" : "#8CAB6D"} 
                  fontWeight="600" 
                  textAlign="center" 
                  w="full"
                  maxW="100%"
                  noOfLines={2}
                  px={1}
                >
                  ✅ Completed Check-ins
                </Text>
                <Text 
                  fontSize={{ base: "lg", sm: "xl", md: "2xl" }} 
                  color={hasNoData ? "gray.400" : "#8CAB6D"} 
                  fontWeight="bold" 
                  lineHeight="1"
                  whiteSpace="nowrap"
                >
                  {stats.completed}
                </Text>
                <Text 
                  fontSize={{ base: "2xs", sm: "xs" }} 
                  color={hasNoData ? "gray.400" : "#8CAB6D"} 
                  textAlign="center" 
                  w="full"
                  maxW="100%"
                  noOfLines={1}
                  px={1}
                >
                  {hasNoData ? "No data" : `${stats.totalCheckIns > 0 ? Math.round((stats.completed / stats.totalCheckIns) * 100) : 0}% Complete`}
                </Text>
              </VStack>
            </Box>
          </GridItem>
          
          <GridItem minW="0" w="full" h="full">
            <Box 
              bg={hasNoData ? "gray.50" : "white"} 
              p={{ base: 3, sm: 4, md: 5 }} 
              borderRadius="lg" 
              border="1px solid" 
              borderColor={hasNoData ? "gray.200" : "#2B7B8C"} 
              boxShadow="sm"
              transition="all 0.2s"
              h="100%"
              minH={{ base: "100px", sm: "120px", md: "140px" }}
              display="flex"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
              w="full"
              maxW="100%"
              overflow="hidden"
            >
              <VStack spacing={{ base: 1.5, sm: 2, md: 3 }} align="center" justify="center" h="full" w="full" maxW="100%">
                <Text 
                  fontSize={{ base: "2xs", sm: "xs", md: "sm" }} 
                  color={hasNoData ? "gray.500" : "#2B7B8C"} 
                  fontWeight="600" 
                  textAlign="center" 
                  w="full"
                  maxW="100%"
                  noOfLines={2}
                  px={1}
                >
                  ⏳ Pending Check-ins
                </Text>
                <Text 
                  fontSize={{ base: "lg", sm: "xl", md: "2xl" }} 
                  color={hasNoData ? "gray.400" : "#2B7B8C"} 
                  fontWeight="bold" 
                  lineHeight="1"
                  whiteSpace="nowrap"
                >
                  {stats.pending}
                </Text>
                <Text 
                  fontSize={{ base: "2xs", sm: "xs" }} 
                  color={hasNoData ? "gray.400" : "#2B7B8C"} 
                  textAlign="center" 
                  w="full"
                  maxW="100%"
                  noOfLines={1}
                  px={1}
                >
                  {hasNoData ? "No data" : "Waiting"}
                </Text>
              </VStack>
            </Box>
          </GridItem>
          
          <GridItem minW="0" w="full" h="full">
            <Box 
              bg={hasNoData ? "gray.50" : "white"} 
              p={{ base: 3, sm: 4, md: 5 }} 
              borderRadius="lg" 
              border="1px solid" 
              borderColor={hasNoData ? "gray.200" : "#E76F51"} 
              boxShadow="sm"
              transition="all 0.2s"
              h="100%"
              minH={{ base: "100px", sm: "120px", md: "140px" }}
              display="flex"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
              w="full"
              maxW="100%"
              overflow="hidden"
            >
              <VStack spacing={{ base: 1.5, sm: 2, md: 3 }} align="center" justify="center" h="full" w="full" maxW="100%">
                <Text 
                  fontSize={{ base: "2xs", sm: "xs", md: "sm" }} 
                  color={hasNoData ? "gray.500" : "#E76F51"} 
                  fontWeight="600" 
                  textAlign="center" 
                  w="full"
                  maxW="100%"
                  noOfLines={2}
                  px={1}
                >
                  ❌ No Show Appointments
                </Text>
                <Text 
                  fontSize={{ base: "lg", sm: "xl", md: "2xl" }} 
                  color={hasNoData ? "gray.400" : "#E76F51"} 
                  fontWeight="bold" 
                  lineHeight="1"
                  whiteSpace="nowrap"
                >
                  {stats.noShow}
                </Text>
                <Text 
                  fontSize={{ base: "2xs", sm: "xs" }} 
                  color={hasNoData ? "gray.400" : "#E76F51"} 
                  textAlign="center" 
                  w="full"
                  maxW="100%"
                  noOfLines={1}
                  px={1}
                >
                  {hasNoData ? "No data" : "Missed"}
                </Text>
              </VStack>
            </Box>
          </GridItem>
        </Grid>

        {/* Enhanced Chart Container */}
        <Box 
          bg="white" 
          p={{ base: 3, sm: 4, md: 5, lg: 6 }} 
          borderRadius="lg" 
          border="1px solid" 
          borderColor="gray.200" 
          boxShadow="sm"
          position="relative"
          overflow="hidden"
          minH={{ base: "320px", sm: "500px", md: "550px", lg: "600px" }}
          w="full"
        >
          {/* Background Pattern */}
          <Box
            position="absolute"
            top={0}
            right={0}
            w="200px"
            h="200px"
            bg="cofb.blue"
            opacity={0.1}
            borderRadius="full"
            transform="translate(50%, -50%)"
            zIndex={0}
          />
          
          <VStack spacing={{ base: 4, sm: 5, md: 6 }} align="stretch" position="relative" zIndex={1} w="full">
            <Box textAlign="center" w="full" px={{ base: 2, sm: 0 }}>
              <Text 
                fontSize={{ base: "lg", sm: "xl", md: "2xl" }} 
                color="#25385D" 
                fontWeight="bold" 
                mb={2}
                bg="cofb.blue"
                bgClip="text"
                textFillColor="transparent"
                lineHeight="shorter"
              >
                📊 Appointment Time Slots Dashboard
              </Text>
              <Text fontSize={{ base: "xs", sm: "sm", md: "md" }} color="#25385D" fontWeight="medium" px={{ base: 2, sm: 0 }}>
                Today's scheduled appointments grouped by pickup time slots
              </Text>
              <Box 
                w={{ base: "40px", sm: "60px" }} 
                h="2px" 
                bg="cofb.blue"
                opacity={0.3} 
                borderRadius="full" 
                mx="auto" 
                mt={{ base: 2, sm: 3 }}
              />
            </Box>


            {/* Chart - Shows full range 8 AM - 8 PM but only populates valid CSV time slots */}
            <Box 
              h={{ base: "260px", sm: "450px", md: "500px", lg: "550px" }} 
              w="full"
              minH={{ base: "260px", sm: "450px", md: "500px" }}
              maxH={{ base: "420px", sm: "600px", md: "700px" }}
              bg="white"
              borderRadius="lg"
              p={{ base: 2, sm: 3, md: 4, lg: 5 }}
              boxShadow="sm"
              border="1px solid"
              borderColor="gray.200"
              position="relative"
              overflow="hidden"
            >
              {isLoading ? (
                <Center h="100%">
                  <VStack spacing={4}>
                    <Spinner size="xl" color="blue.500" />
                    <Text color="gray.600" fontWeight="medium">Loading chart data...</Text>
                  </VStack>
                </Center>
              ) : !csvStatus.hasData ? (
                <Center h="100%">
                  <VStack spacing={4}>
                    <Text fontSize="lg" color="gray.500" fontWeight="medium">
                      📊 No CSV Data Available
                    </Text>
                    <Text fontSize="sm" color="gray.400" textAlign="center" maxW="300px">
                      Upload CSV data with today's pickup date to see appointment time slots
                    </Text>
                  </VStack>
                </Center>
              ) : hasNoData ? (
                <Center h="100%">
                  <VStack spacing={4}>
                    <Text fontSize="lg" color="gray.500" fontWeight="medium">
                      📊 No Appointment Data
                    </Text>
                    <Text fontSize="sm" color="gray.400" textAlign="center" maxW="300px">
                      No appointments found in the uploaded CSV data
                    </Text>
                  </VStack>
                </Center>
              ) : (
                <Box
                  width="100%" 
                  height="100%"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                    data={Array.isArray(chartData) ? chartData : []} 
                    margin={{ top: 20, right: 30, left: 30, bottom: 100 }}
                    barCategoryGap={screenWidth < 768 ? "8%" : "12%"}
                    barGap={screenWidth < 768 ? "2%" : "4%"}
                    style={{ 
                      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                      borderRadius: '16px',
                      padding: '12px',
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)'
                    }}
                  >
                  <defs>
                    <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8CAB6D" />
                      <stop offset="50%" stopColor="#7A9B5A" />
                      <stop offset="100%" stopColor="#6B8E4A" />
                    </linearGradient>
                    <linearGradient id="pendingGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2B7B8C" />
                      <stop offset="50%" stopColor="#256A7A" />
                      <stop offset="100%" stopColor="#1E5A6B" />
                    </linearGradient>
                    <linearGradient id="noShowGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#E76F51" />
                      <stop offset="50%" stopColor="#D65A4A" />
                      <stop offset="100%" stopColor="#C44A3A" />
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                      <feMerge> 
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                      <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="#00000020"/>
                    </filter>
                  </defs>
                  <XAxis 
                    dataKey="timeLabel" 
                    tick={{ 
                      fontSize: screenWidth < 768 ? 8 : 9, 
                      fill: '#2B7B8C',
                      fontWeight: '600'
                    }}
                    axisLine={{ stroke: '#2B7B8C', strokeWidth: 2 }}
                    tickLine={{ stroke: '#2B7B8C', strokeWidth: 1 }}
                    angle={-45}
                    textAnchor="end"
                    height={120}
                    interval={screenWidth < 768 ? 3 : 2}
                    tickMargin={15}
                  />
                  <YAxis 
                    tick={{ 
                      fontSize: 12, 
                      fill: '#2B7B8C',
                      fontWeight: '600'
                    }}
                    axisLine={{ stroke: '#2B7B8C', strokeWidth: 2 }}
                    tickLine={{ stroke: '#2B7B8C', strokeWidth: 1 }}
                    domain={[0, 'dataMax + 1']}
                    allowDecimals={false}
                    interval={0}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    wrapperStyle={{ 
                      paddingTop: '20px',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#2B7B8C',
                      display: 'flex',
                      justifyContent: 'center',
                      gap: '20px',
                      flexWrap: 'wrap',
                      alignItems: 'center'
                    }}
                    iconType="circle"
                    layout="horizontal"
                    align="center"
                    verticalAlign="bottom"
                  />
                  <Bar 
                    dataKey="completed" 
                    fill="url(#completedGradient)"
                    name="✅ Completed Check-ins" 
                    radius={[12, 12, 0, 0]}
                    stroke="#6B8E4A"
                    strokeWidth={3}
                    filter="url(#shadow)"
                    style={{ 
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(_, __, event) => {
                      if (event?.target && 'style' in event.target) {
                        (event.target as HTMLElement).style.filter = 'url(#glow)';
                        (event.target as HTMLElement).style.transform = 'scale(1.02)';
                      }
                    }}
                    onMouseLeave={(_, __, event) => {
                      if (event?.target && 'style' in event.target) {
                        (event.target as HTMLElement).style.filter = 'url(#shadow)';
                        (event.target as HTMLElement).style.transform = 'scale(1)';
                      }
                    }}
                  />
                  <Bar 
                    dataKey="pending" 
                    fill="url(#pendingGradient)"
                    name="📅 Pending Appointments" 
                    radius={[12, 12, 0, 0]}
                    stroke="#1E5A6B"
                    strokeWidth={3}
                    filter="url(#shadow)"
                    style={{ 
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(_, __, event) => {
                      if (event?.target && 'style' in event.target) {
                        (event.target as HTMLElement).style.filter = 'url(#glow)';
                        (event.target as HTMLElement).style.transform = 'scale(1.02)';
                      }
                    }}
                    onMouseLeave={(_, __, event) => {
                      if (event?.target && 'style' in event.target) {
                        (event.target as HTMLElement).style.filter = 'url(#shadow)';
                        (event.target as HTMLElement).style.transform = 'scale(1)';
                      }
                    }}
                  />
                  <Bar 
                    dataKey="noShow" 
                    fill="url(#noShowGradient)"
                    name="❌ No Show Appointments" 
                    radius={[12, 12, 0, 0]}
                    stroke="#C44A3A"
                    strokeWidth={3}
                    filter="url(#shadow)"
                    style={{ 
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(_, __, event) => {
                      if (event?.target && 'style' in event.target) {
                        (event.target as HTMLElement).style.filter = 'url(#glow)';
                        (event.target as HTMLElement).style.transform = 'scale(1.02)';
                      }
                    }}
                    onMouseLeave={(_, __, event) => {
                      if (event?.target && 'style' in event.target) {
                        (event.target as HTMLElement).style.filter = 'url(#shadow)';
                        (event.target as HTMLElement).style.transform = 'scale(1)';
                      }
                    }}
                  />
                  </BarChart>
                </ResponsiveContainer>
                </Box>
              )}
            </Box>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};

export default CheckInAnalyticsChart;
