/**
 * @fileoverview CSV status component for Foodbank Check-In and Appointment System admin panel
 * 
 * This component displays the current status of CSV data processing,
 * including upload status, processing progress, and data
 * validation results for monitoring bulk operations.
 * 
 * @author Lindsey D. Stead
 * @version 1.0.0
 * @since 2025-10-20
 * @license Proprietary - see LICENSE file for details
 * 
 * @see {@link ../CSVUploadPage.tsx} CSV upload page
 */

import React, { useState, useEffect, useRef } from 'react';
import { fetchStatusDay } from '../../../lib/statusService';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Icon,
  Spinner,
  Button,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FiDatabase, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { logger } from '../../../utils/logger';
import { getDemoMode, onDemoModeChange } from '../../../lib/demoMode';

interface DayStatus {
  today: string;
  csvDate?: string;
  data: {
    present: boolean;
    count: number;
    expiresAt?: string;
  };
}

interface CSVStatusProps {
  onRefresh?: () => void;
}

const CSVStatus: React.FC<CSVStatusProps> = ({ onRefresh }) => {
  const [status, setStatus] = useState<DayStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(getDemoMode());
  const navigate = useNavigate();
  const isMountedRef = useRef(true);

  /**
   * Polling setup with Page Visibility API
   * 
   * Best Practices Implemented:
   * - Page Visibility API: Pauses polling when browser tab is hidden
   * - Conditional Polling: Only polls when data exists (reduces unnecessary calls)
   * - Event-Driven: Immediate refresh on CSV import events
   * - Optimized Interval: 2 minutes (reduced from 30s to minimize API calls)
   * - Smart Conditions: Only polls when tab is visible and data exists
   * - Proper Cleanup: Clears intervals and removes event listeners on unmount
   * 
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API} Page Visibility API
   */
  useEffect(() => {
    fetchStatus();
    
    // Listen for CSV import events to start polling
    const handleCSVImport = () => {
      fetchStatus(); // Immediate refresh
    };
    
    window.addEventListener('csvDataImported', handleCSVImport);
    
    // Only start polling if we have data or are loading, and tab is visible
    let interval: NodeJS.Timeout | null = null;
    let isVisible = !document.hidden;
    
    const startPolling = () => {
      if (interval) clearInterval(interval);
      if ((status?.data?.present || loading) && isVisible) {
        // Auto-refresh every 2 minutes ONLY when data exists and tab is visible
        interval = setInterval(() => {
          if (!document.hidden) {
            fetchStatus();
          }
        }, 120000); // Poll every 2 minutes (optimized to reduce API calls by 75%)
      }
    };
    
    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
      if (isVisible) {
        // Tab became visible - fetch immediately and start polling
        fetchStatus();
        startPolling();
      } else {
        // Tab hidden - stop polling
        if (interval) {
          clearInterval(interval);
          interval = null;
        }
      }
    };
    
    // Start polling if conditions are met
    startPolling();
    
    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      isMountedRef.current = false;
      window.removeEventListener('csvDataImported', handleCSVImport);
      if (interval) clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []); // Only run once on mount - fetchStatus handles state updates internally

  useEffect(() => {
    return onDemoModeChange(setDemoMode);
  }, []);

  const notifyDataVersionChange = (dataVersion: string | number) => {
    localStorage.setItem('dataVersion', dataVersion.toString());
    window.dispatchEvent(
      new CustomEvent('dataVersionChanged', { detail: { dataVersion } })
    );
  };

  const fetchStatus = async () => {
    try {
      const result = await fetchStatusDay();
      
      // Prevent state update if component unmounted
      if (!isMountedRef.current) return;
      
      if (result.success) {
        // Check if data version changed (data was purged)
        const lastVersion = localStorage.getItem('dataVersion');
        if (result.dataVersion && result.dataVersion.toString() !== lastVersion) {
          notifyDataVersionChange(result.dataVersion);
        }
        
        if (isMountedRef.current) {
          setStatus(result.data ?? null);
          setError(null);
        }
        // Call the refresh callback if provided
        if (onRefresh) {
          onRefresh();
        }
      } else {
        if (isMountedRef.current) {
          setError(result.error || 'Failed to fetch status');
        }
      }
    } catch (err: any) {
      // Handle API not configured gracefully (expected in CSV-only mode)
      if (err?.message === 'API_NOT_CONFIGURED') {
        // API not configured - this is expected, don't log as error
        logger.debug('API not configured - CSV-only mode');
        if (isMountedRef.current) {
          setError(null); // Don't show error for expected state
        }
      } else if (err?.message === 'RATE_LIMITED') {
        logger.debug('Rate limited - skipping status update');
      } else {
        // Real errors - log appropriately
        logger.error('Status fetch error:', err);
        if (isMountedRef.current) {
          setError('No client check-ins were found. Please upload a CSV file.');
        }
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  // Expose refresh function to parent components
  useEffect(() => {
    if (onRefresh) {
      onRefresh();
    }
  }, [status, onRefresh]);


  const getStatusIcon = () => {
    if (!status) return FiDatabase;
    if (status.data.present) return FiCheckCircle;
    return FiXCircle;
  };

  const getStatusText = () => {
    if (!status) return 'No Data';
    if (!status.data.present) return 'Not Ready';
    
    // Check if CSV date matches today
    const isToday = demoMode || status.csvDate === status.today;
    return isToday ? 'Ready' : 'Wrong Date';
  };

  const formatExpiryTime = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    }
    return `${diffMinutes}m`;
  };

  const formatTodayDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'America/Vancouver'
    });
  };

  const getStatusMessage = () => {
    if (!status) return 'No data available';
    if (!status.data.present) return 'No CSV data uploaded for today';
    
    const count = status.data.count;
    if (count === 0) return 'No records found';
    
    // Check if CSV date matches today
    const isToday = demoMode || status.csvDate === status.today;
    const dateText = demoMode
      ? status.csvDate
        ? `from ${formatTodayDate(status.csvDate)} (demo mode)`
        : 'from an unknown date (demo mode)'
      : isToday
        ? 'today'
        : status.csvDate
          ? `from ${formatTodayDate(status.csvDate)}`
          : 'from an unknown date';
    
    if (count === 1) return `1 client with appointment ${dateText}`;
    return `${count} clients with appointments ${dateText}`;
  };

  if (loading) {
    return (
      <VStack spacing={4} align="center" justify="center" h="full">
        <Spinner size="lg" color="#2B7B8C" />
        <Text fontSize="md" color="gray.600" fontWeight="500">
          Loading status...
        </Text>
      </VStack>
    );
  }

  if (error) {
    return (
      <VStack spacing={4} align="center" justify="center" h="full" minH="200px" w="full">
        <Box
          p={6}
          bg="white"
          borderRadius="xl"
          border="1px solid"
          borderColor="gray.200"
          boxShadow="sm"
          w="full"
          maxW="100%"
          position="relative"
          overflow="hidden"
        >
          {/* Status Header */}
          <VStack spacing={4} align="center" w="full">
            <Box
              p={4}
              bg="gray.100"
              borderRadius="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Icon as={FiDatabase} color="gray.400" boxSize={8} />
            </Box>
            
            <VStack spacing={2} align="center" w="full">
              <Text fontSize="lg" fontWeight="bold" color="admin.primary" textAlign="center">
                Daily Data Status
              </Text>
              <Text fontSize="xs" color="gray.500" textAlign="center">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  timeZone: 'America/Vancouver'
                })}
              </Text>
            </VStack>

            <Badge 
              colorScheme="red" 
              size="lg"
              px={4}
              py={2}
              borderRadius="full"
              fontWeight="bold"
              fontSize="sm"
            >
              NO DATA
            </Badge>

            {/* Friendly Message */}
            <Box
              p={4}
              bg="blue.50"
              borderRadius="lg"
              border="1px solid"
              borderColor="blue.200"
              w="full"
              maxW="100%"
            >
              <VStack spacing={3} align="center">
                <Text fontSize="sm" color="blue.700" fontWeight="medium" textAlign="center">
                  💡 Upload today's CSV data to get started
                </Text>
                <Button
                  size="sm"
                  colorScheme="blue"
                  variant="solid"
                  onClick={() => navigate('/csv-upload')}
                  w="full"
                  maxW="200px"
                >
                  Upload CSV File
                </Button>
                <Button
                  size="xs"
                  variant="ghost"
                  colorScheme="blue"
                  onClick={fetchStatus}
                  isLoading={loading}
                >
                  Check for Data
                </Button>
              </VStack>
            </Box>
          </VStack>
        </Box>
      </VStack>
    );
  }

  return (
    <VStack spacing={4} align="center" justify="center" h="full" minH="200px" w="full">
      <VStack spacing={4} align="center" w="full">
        <Box
          p={4}
          bg={status?.data.present ? "green.100" : "gray.100"}
          color={status?.data.present ? "green.600" : "gray.600"}
          borderRadius="full"
          display="flex"
          alignItems="center"
          justifyContent="center"
          boxShadow="sm"
        >
          <Icon as={getStatusIcon()} boxSize={8} />
        </Box>
        
        <VStack spacing={2} align="center" textAlign="center" w="full">
          <Badge 
            colorScheme={status?.data.present ? "green" : "gray"}
            size="lg"
            px={4}
            py={2}
            borderRadius="full"
            fontWeight="bold"
            fontSize="sm"
          >
            {getStatusText()}
          </Badge>

          <Text fontSize="sm" color="gray.600" textAlign="center" maxW="100%" px={2}>
            {getStatusMessage()}
          </Text>
          
          {status?.data.present && (
            <VStack spacing={2} align="center" mt={2}>
              <Text fontSize="3xl" fontWeight="bold" color="#2B7B8C">
                {status.data.count}
              </Text>
              <Text fontSize="xs" color="gray.500" fontWeight="medium">
                Total Records
              </Text>

              {/* Expiry Info */}
              {status.data.expiresAt && (
                <HStack spacing={2} mt={2} justify="center">
                  <Icon as={FiClock} color="orange.500" boxSize={4} />
                  <Text fontSize="xs" fontWeight="medium" color="gray.600">
                    Expires in {formatExpiryTime(status.data.expiresAt)}
                  </Text>
                </HStack>
              )}
            </VStack>
          )}

          {/* Action Hint */}
          {!status?.data.present && (
            <Box
              p={4}
              bg="blue.50"
              borderRadius="lg"
              border="1px solid"
              borderColor="blue.200"
              w="full"
              maxW="100%"
              mt={2}
            >
              <VStack spacing={3} align="center">
                <Text fontSize="sm" color="blue.700" fontWeight="medium" textAlign="center">
                  💡 Upload today's appointment data to begin
                </Text>
                <Button
                  size="sm"
                  colorScheme="blue"
                  variant="solid"
                  onClick={() => navigate('/csv-upload')}
                  w="full"
                  maxW="200px"
                >
                  Upload CSV File
                </Button>
              </VStack>
            </Box>
          )}
        </VStack>
      </VStack>
    </VStack>
  );
};

export { CSVStatus };
