/**
 * @fileoverview Check-ins management page for Foodbank Check-In and Appointment System admin panel
 * 
 * This page provides comprehensive check-in management functionality
 * including viewing all check-ins, filtering, searching, and managing
 * client appointments and status updates.
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
  VStack,
  HStack,
  Card,
  CardBody,
  Skeleton,
  SkeletonCircle,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { logger } from '../utils/logger';
import {
  CheckInsHeader,
  CheckInStats,
  CheckInsSearch,
  CheckInsList,
  CheckInDetailModal,
} from '../components/features/checkins';
import { CheckInRecord } from '../types/checkIn';
import { api } from '../lib/api';
import { getDemoMode, onDemoModeChange } from '../lib/demoMode';
import { printTicket } from '../utils/printTicket';

const CheckInsPage: React.FC = () => {
  const [checkIns, setCheckIns] = useState<CheckInRecord[]>([]);
  const [filteredCheckIns, setFilteredCheckIns] = useState<CheckInRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(getDemoMode());
  const toast = useToast();
  const [selectedCheckIn, setSelectedCheckIn] = useState<CheckInRecord | null>(null);
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();
  const isMountedRef = useRef(true);

  // Fetch today's CSV appointments and filter to 8 AM – 8 PM window (local/Vancouver time)
  const fetchCheckIns = useCallback(async () => {
    try {
      if (isMountedRef.current) {
        setIsLoading(true);
        setError(null);
      }
      
      // Use appointments endpoint to ensure CSV-sourced records are included
      // IMPORTANT: Use api() helper to include authentication headers
      const response = await api('/checkin/appointments');
      const data = await response.json();

      if (!isMountedRef.current) return;

      if (data.success && Array.isArray(data.data)) {
        const now = new Date();
        // Build today's date for filtering in local time (fallback if ISO missing)
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');
        const todayStr = `${y}-${m}-${d}`;

        const inWindow = (rec: any) => {
          const iso = rec.pickUpISO || rec.appointmentTime;
          const timeStr = rec.pickUpTime; // e.g., HH:MM
          let dt: Date | null = null;

          if (iso) {
            const parsed = new Date(iso);
            if (!isNaN(parsed.getTime())) dt = parsed;
          }
          if (!dt && typeof timeStr === 'string' && timeStr.match(/^\d{2}:\d{2}$/)) {
            dt = new Date(`${todayStr}T${timeStr}:00`);
          }

          if (!dt) return false;

          // Ensure it's today
          const sameDay = dt.getFullYear() === now.getFullYear() && dt.getMonth() === now.getMonth() && dt.getDate() === now.getDate();
          if (!sameDay) return false;

          const hour = dt.getHours();
          return hour >= 8 && hour < 20; // 08:00 inclusive to 20:00 exclusive
        };

        const filtered = demoMode
          ? (data.data as any[])
          : (data.data as any[]).filter(inWindow);
        if (isMountedRef.current) {
          setCheckIns(filtered);
          setFilteredCheckIns(filtered);
        }
      } else {
        if (isMountedRef.current) {
          setError('No check-ins data available');
          setCheckIns([]);
          setFilteredCheckIns([]);
        }
      }
    } catch (err: any) {
      if (err?.message === 'API_NOT_CONFIGURED') {
        logger.debug('API not configured - CSV-only mode');
        if (isMountedRef.current) {
          setError(null);
          setCheckIns([]);
          setFilteredCheckIns([]);
        }
      } else {
        logger.error('Failed to fetch check-ins:', err);
        if (isMountedRef.current) {
          setError('Failed to load check-ins data');
          setCheckIns([]);
          setFilteredCheckIns([]);
        }
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [demoMode]);

  useEffect(() => {
    return onDemoModeChange(setDemoMode);
  }, []);

  // Filter check-ins based on search
  useEffect(() => {
    let filtered = checkIns;

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(checkIn => 
        checkIn.clientName.toLowerCase().includes(search) ||
        checkIn.clientId.toLowerCase().includes(search) ||
        checkIn.phoneNumber.includes(search) ||
        checkIn.firstName?.toLowerCase().includes(search) ||
        checkIn.lastName?.toLowerCase().includes(search)
      );
    }

    setFilteredCheckIns(filtered);
  }, [checkIns, searchTerm]);

  // Initial fetch and polling for synchronization
  useEffect(() => {
    fetchCheckIns();
    
    // Polling setup with Page Visibility API for synchronization
    // IMPORTANT: This ensures CheckInsPage stays synchronized with DashboardPage
    // and other admin features that update check-in data
    let interval: NodeJS.Timeout | null = null;
    let isVisible = !document.hidden;
    
    const startPolling = () => {
      if (interval) clearInterval(interval);
      interval = setInterval(() => {
        // Only poll if tab is visible
        if (!document.hidden) {
          fetchCheckIns();
        }
      }, 30000); // Poll every 30 seconds for synchronization
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

  // IMPORTANT: Use consistent status colors matching analytics chart
  // Use shared utility for consistency across all admin features
  // Note: getStatusColorHex is used directly for hex colors, getStatusColorScheme for Chakra color schemes


  /**
   * Handle print ticket action
   * 
   * Best Practice: Uses centralized printTicket utility to ensure
   * consistent ticket generation across the application.
   * All print buttons use the same endpoint and data structure.
   */
  const handlePrintTicket = (checkIn: CheckInRecord) => {
    if (checkIn.id) {
      printTicket(checkIn.id);
    }
  };

  const handleViewDetails = (checkIn: CheckInRecord) => {
    setSelectedCheckIn(checkIn);
    onDetailOpen();
  };

  const handleCancelAppointment = async (checkIn: CheckInRecord) => {
    try {
      // IMPORTANT: Use api() helper to include authentication headers
      const response = await api(`/checkin/${checkIn.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'Cancelled',
          notes: 'Cancelled by admin'
        })
      });
      
      if (response.ok) {
        // Refresh the data
        await fetchCheckIns();
      } else {
        logger.error('Failed to cancel appointment');
      }
    } catch (error) {
      logger.error('Error cancelling appointment:', error);
    }
  };

  /**
   * Export all CSV records with updates
   * 
   * Exports EVERY person from the original CSV upload with:
   * - Same headers and order as original upload
   * - Updated status from check-ins
   * - Next appointment date (or "NA" if missed)
   * - Special requests from client check-in
   * - Original data preserved unless updated
   */
  const handleExportCSV = async () => {
    try {
      // Check if there's any check-in data before attempting export
      if (checkIns.length === 0) {
        toast({
          title: 'No Data to Export',
          description: 'There is no check-in data available to export. Please upload a CSV file first or ensure there are check-in records in the system.',
          status: 'error',
          duration: 7000,
          isClosable: true,
        });
        return;
      }
      
      // Use the new export-all endpoint that exports everyone with updates
      // IMPORTANT: Use api() helper to include authentication headers
      const response = await api('/csv/export-all');
      
      if (response.ok) {
        const blob = await response.blob();
        
        // Check if blob is empty
        if (blob.size === 0) {
          toast({
            title: 'No Data to Export',
            description: 'There is no check-in data available to export. Please ensure there are check-in records in the system.',
            status: 'error',
            duration: 7000,
            isClosable: true,
          });
          return;
        }
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `appointments-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        // Show success message
        toast({
          title: 'Export Successful',
          description: 'All appointment data has been exported to CSV with updates. The file includes everyone from the original upload with updated statuses and next appointments.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        // Handle error response
        const errorData = await response.json().catch(() => ({}));
        toast({
          title: 'Export Failed',
          description: errorData.error || 'Unable to export check-in data. Please ensure there is check-in data in the system and try again.',
          status: 'error',
          duration: 7000,
          isClosable: true,
        });
      }
    } catch (error) {
      logger.error('Error exporting CSV:', error);
      toast({
        title: 'Export Failed',
        description: 'Unable to export check-in data. Please check your connection and try again.',
        status: 'error',
        duration: 7000,
        isClosable: true,
      });
    }
  };

  if (isLoading) {
    return (
      <Box p={{ base: 4, md: 6 }}>
        <VStack spacing={{ base: 4, md: 6 }} align="stretch">
          <HStack justify="space-between">
            <Skeleton height="32px" width="200px" />
            <Skeleton height="40px" width="120px" />
          </HStack>
          <Skeleton height="60px" width="100%" />
          <VStack spacing={{ base: 3, md: 4 }} align="stretch">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i}>
                <CardBody>
                  <HStack spacing={4}>
                    <SkeletonCircle size="40px" />
                    <VStack align="start" spacing={2} flex={1}>
                      <Skeleton height="20px" width="200px" />
                      <Skeleton height="16px" width="150px" />
                    </VStack>
                    <Skeleton height="24px" width="80px" />
                  </HStack>
                </CardBody>
              </Card>
            ))}
          </VStack>
        </VStack>
      </Box>
    );
  }

  return (
    <VStack spacing={{ base: 4, md: 6 }} align="stretch" w="full" maxW="100%" minW="0">
      <CheckInsHeader
        onExport={handleExportCSV}
        onRefresh={fetchCheckIns}
        isLoading={isLoading}
      />

      <CheckInStats checkIns={checkIns} />

      <CheckInsSearch value={searchTerm} onChange={setSearchTerm} />

      <CheckInsList
        checkIns={filteredCheckIns}
        error={error}
        searchTerm={searchTerm}
        onViewDetails={handleViewDetails}
        onPrintTicket={handlePrintTicket}
        onCancelAppointment={handleCancelAppointment}
      />

      <CheckInDetailModal
        isOpen={isDetailOpen}
        onClose={onDetailClose}
        checkIn={selectedCheckIn}
        onPrintTicket={handlePrintTicket}
      />
    </VStack>
  );
};

export default CheckInsPage;
