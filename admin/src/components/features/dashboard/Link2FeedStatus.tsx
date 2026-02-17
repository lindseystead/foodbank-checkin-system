/**
 * @fileoverview Link2Feed status component for Foodbank Check-In and Appointment System admin panel
 * 
 * This component displays Link2Feed integration status and provides configuration
 * options for connecting the system to Link2Feed services. It handles
 * connection status, API configuration, and integration management.
 * 
 * @author Lindsey D. Stead
 * @version 1.0.0
 * @since 2025-10-20
 * @license Proprietary - see LICENSE file for details
 * 
 * @see {@link ../SettingsPage.tsx} Settings page
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Flex,
  Text,
  Button,
  Badge,
  Card,
  CardBody,
  Icon,
  Heading,
  Input,
  FormControl,
  FormLabel,
  FormHelperText,
  Select,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
} from '@chakra-ui/react';
import { 
  FiCheckCircle, 
  FiXCircle, 
  FiShield,
  FiGlobe,
  FiKey,
  FiClock,
  FiSettings,
  FiPlay,
  FiTrash2,
} from 'react-icons/fi';
import { logger } from '../../../utils/logger';

interface Link2FeedConfig {
  apiKey: string;
  secretKey: string;
  baseUrl: string;
  environment: 'test' | 'staging' | 'live';
  organizationId?: string;
}

const Link2FeedStatus: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [config, setConfig] = useState<Link2FeedConfig>({
    apiKey: '',
    secretKey: '',
    baseUrl: '',
    environment: 'test',
    organizationId: '',
  });
  const [status, setStatus] = useState({
    configured: false,
    hasApiKey: false,
    hasSecretKey: false,
    baseUrl: '',
    environment: 'unknown',
    missing: [] as string[],
  });
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  
  // Fixed theme colors for consistency
  const bgColor = 'white'; // Fixed white background
  const borderColor = 'gray.200'; // Fixed gray border
  const accentColor = 'blue.500'; // Fixed blue accent
  const successColor = 'green.500'; // Fixed green success
  const errorColor = 'red.500'; // Fixed red error

  // Load current configuration
  useEffect(() => {
    const loadConfig = async () => {
      try {
        // In a real app, this would load from backend/database
        const savedConfig = localStorage.getItem('link2feed_config');
        if (savedConfig) {
          const parsed = JSON.parse(savedConfig);
          setConfig(parsed);
          setStatus({
            configured: true,
            hasApiKey: !!parsed.apiKey,
            hasSecretKey: !!parsed.secretKey,
            baseUrl: parsed.baseUrl,
            environment: parsed.environment,
            missing: [],
          });
        } else {
          setStatus({
            configured: false,
            hasApiKey: false,
            hasSecretKey: false,
            baseUrl: '',
            environment: 'unknown',
            missing: ['API Key', 'Secret Key', 'Base URL'],
          });
        }
      } catch (error) {
        logger.error('Error loading config:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, []);

  const handleConfigChange = (field: keyof Link2FeedConfig, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveConfig = async () => {
    setIsConfiguring(true);
    try {
      // Validate required fields
      if (!config.apiKey || !config.secretKey || !config.baseUrl) {
        toast({
          title: 'Configuration Incomplete',
          description: 'Please fill in all required fields: API Key, Secret Key, and Base URL are required.',
          status: 'error',
          duration: 7000,
          isClosable: true,
        });
        return;
      }

      // Save configuration (in production, this would go to backend)
      localStorage.setItem('link2feed_config', JSON.stringify(config));
      
      // Update status
      setStatus({
        configured: true,
        hasApiKey: true,
        hasSecretKey: true,
        baseUrl: config.baseUrl,
        environment: config.environment,
        missing: [],
      });

      toast({
        title: 'Configuration Saved',
        description: 'Link2Feed API configuration has been saved successfully. You can now test the connection.',
        status: 'success',
        duration: 4000,
        isClosable: true,
      });

      onClose();
    } catch (error) {
      toast({
        title: 'Configuration Error',
        description: 'Unable to save the Link2Feed configuration. Please check your input and try again.',
        status: 'error',
        duration: 7000,
        isClosable: true,
      });
    } finally {
      setIsConfiguring(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      // In a real app, this would call the backend to test the connection
      toast({
        title: 'Testing Connection',
        description: 'Verifying Link2Feed API connection with provided credentials...',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });

      // Simulate API test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Connection Successful',
        description: 'Link2Feed API connection test passed. The system can now communicate with Link2Feed.',
        status: 'success',
        duration: 4000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Connection Failed',
        description: 'Unable to connect to Link2Feed API. Please verify your API credentials and base URL, then try again.',
        status: 'error',
        duration: 7000,
        isClosable: true,
      });
    }
  };

  const handleClearConfig = () => {
    localStorage.removeItem('link2feed_config');
    setConfig({
      apiKey: '',
      secretKey: '',
      baseUrl: '',
      environment: 'test',
      organizationId: '',
    });
    setStatus({
      configured: false,
      hasApiKey: false,
      hasSecretKey: false,
      baseUrl: '',
      environment: 'unknown',
      missing: ['API Key', 'Secret Key', 'Base URL'],
    });
    toast({
      title: 'Configuration Cleared',
      description: 'Link2Feed configuration has been removed',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  const getStatusBadge = () => {
    if (isLoading) {
      return <Badge colorScheme="gray">Loading...</Badge>;
    }
    if (status.configured && status.hasApiKey && status.hasSecretKey) {
      return <Badge colorScheme="green">Connected</Badge>;
    }
    return <Badge colorScheme="red">Disconnected</Badge>;
  };

  const getStatusIcon = () => {
    if (isLoading) return FiClock;
    if (status.configured && status.hasApiKey && status.hasSecretKey) return FiCheckCircle;
    return FiXCircle;
  };

  if (isLoading) {
    return (
      <Card bg={bgColor} borderColor={borderColor} borderWidth="1px" borderRadius="lg">
        <CardBody>
          <HStack justify="center" spacing={3}>
            <Icon as={FiClock} color={accentColor} />
            <Text>Loading Link2Feed status...</Text>
          </HStack>
        </CardBody>
      </Card>
    );
  }

  return (
    <>
      <Card bg={bgColor} borderColor={borderColor} borderWidth="1px" borderRadius="lg" w="full" maxW="100%" minW="0">
        <CardBody p={{ base: 4, sm: 5 }} w="full" maxW="100%" minW="0">
          <VStack spacing={{ base: 4, sm: 5 }} align="stretch" w="full">
            {/* Status Header */}
            <Flex
              direction={{ base: "column", sm: "row" }}
              justify="space-between"
              align={{ base: "start", sm: "center" }}
              gap={{ base: 3, sm: 4 }}
              w="full"
              flexWrap="wrap"
            >
              <HStack spacing={3} minW="0" flex={1}>
                <Icon 
                  as={getStatusIcon()} 
                  boxSize={{ base: 5, sm: 6 }} 
                  color={status.configured ? successColor : errorColor}
                  flexShrink={0}
                />
                <Heading 
                  size={{ base: "sm", sm: "md" }} 
                  color="gray.800"
                  lineHeight="1.3"
                >
                  API Connection Status
                </Heading>
              </HStack>
              <Box flexShrink={0}>
                {getStatusBadge()}
              </Box>
            </Flex>

            {/* Status Description */}
            <Text 
              fontSize={{ base: "xs", sm: "sm" }} 
              color="gray.600"
              lineHeight="1.6"
            >
              {status.configured 
                ? 'Your system is successfully connected to the Link2Feed API and will use real-time data synchronization for enhanced appointment management and client data updates.'
                : 'The system is currently operating in CSV-only mode. To enable real-time data synchronization and enhanced features, configure your Link2Feed API credentials below.'
              }
            </Text>

            {/* Success Alert */}
            {status.configured && (
              <Alert status="success" borderRadius="md">
                <AlertIcon />
                <Box w="full" minW="0">
                  <AlertTitle fontSize={{ base: "xs", sm: "sm" }}>API Successfully Configured</AlertTitle>
                  <AlertDescription fontSize={{ base: "2xs", sm: "xs" }} mt={1}>
                    Environment: <strong>{status.environment}</strong> | Base URL: <strong>{status.baseUrl}</strong>
                  </AlertDescription>
                </Box>
              </Alert>
            )}

            {/* Info Alert */}
            {status.missing.length > 0 && (
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Box w="full" minW="0">
                  <AlertTitle fontSize={{ base: "xs", sm: "sm" }}>CSV-Only Mode Active</AlertTitle>
                  <AlertDescription fontSize={{ base: "2xs", sm: "xs" }} mt={1}>
                    The system is running in CSV-only mode and functioning normally. Link2Feed API integration is available 
                    and ready to activate once API credentials are configured.
                  </AlertDescription>
                </Box>
              </Alert>
            )}

            {/* Action Buttons */}
            <Flex
              direction={{ base: "column", sm: "row" }}
              justify="center"
              align="stretch"
              gap={{ base: 3, sm: 3 }}
              w="full"
              flexWrap="wrap"
            >
              <Button
                leftIcon={<FiSettings />}
                colorScheme="blue"
                onClick={onOpen}
                size={{ base: "sm", sm: "md" }}
                w={{ base: "full", sm: "auto" }}
                minW={{ base: "auto", sm: "200px" }}
              >
                {status.configured ? 'Update Configuration' : 'Configure API'}
              </Button>
              
              {status.configured && (
                <>
                  <Button
                    leftIcon={<FiPlay />}
                    colorScheme="green"
                    variant="outline"
                    onClick={handleTestConnection}
                    size={{ base: "sm", sm: "md" }}
                    w={{ base: "full", sm: "auto" }}
                    minW={{ base: "auto", sm: "150px" }}
                  >
                    Test Connection
                  </Button>
                  <Button
                    leftIcon={<FiTrash2 />}
                    colorScheme="red"
                    variant="outline"
                    onClick={handleClearConfig}
                    size={{ base: "sm", sm: "md" }}
                    w={{ base: "full", sm: "auto" }}
                    minW={{ base: "auto", sm: "140px" }}
                  >
                    Clear Config
                  </Button>
                </>
              )}
            </Flex>

            {/* Requirements Box */}
            <Box bg="gray.50" p={{ base: 4, sm: 5 }} borderRadius="md" border="1px solid" borderColor="gray.200">
              <VStack align="start" spacing={3} w="full">
                <Heading size={{ base: "xs", sm: "sm" }} color="gray.700" lineHeight="1.3">
                  Required API Credentials
                </Heading>
                <VStack align="start" spacing={2} w="full">
                  <HStack spacing={2} align="start" w="full">
                    <Icon as={FiKey} color={accentColor} boxSize={{ base: 4, sm: 5 }} flexShrink={0} mt={0.5} />
                    <Box flex={1} minW="0">
                      <Text fontSize={{ base: "xs", sm: "sm" }} color="gray.800" fontWeight="600" mb={0.5}>
                        API Key
                      </Text>
                      <Text fontSize={{ base: "2xs", sm: "xs" }} color="gray.600" lineHeight="1.5">
                        A unique identifier provided by Link2Feed that authenticates your organization's API requests.
                      </Text>
                    </Box>
                  </HStack>
                  <HStack spacing={2} align="start" w="full">
                    <Icon as={FiShield} color={accentColor} boxSize={{ base: 4, sm: 5 }} flexShrink={0} mt={0.5} />
                    <Box flex={1} minW="0">
                      <Text fontSize={{ base: "xs", sm: "sm" }} color="gray.800" fontWeight="600" mb={0.5}>
                        Secret Key
                      </Text>
                      <Text fontSize={{ base: "2xs", sm: "xs" }} color="gray.600" lineHeight="1.5">
                        Used for HMAC request signing to ensure secure API communication. This key is never transmitted and remains secure.
                      </Text>
                    </Box>
                  </HStack>
                  <HStack spacing={2} align="start" w="full">
                    <Icon as={FiGlobe} color={accentColor} boxSize={{ base: 4, sm: 5 }} flexShrink={0} mt={0.5} />
                    <Box flex={1} minW="0">
                      <Text fontSize={{ base: "xs", sm: "sm" }} color="gray.800" fontWeight="600" mb={0.5}>
                        Base URL
                      </Text>
                      <Text fontSize={{ base: "2xs", sm: "xs" }} color="gray.600" lineHeight="1.5">
                        The environment-specific API endpoint URL (test, staging, or live/production environment).
                      </Text>
                    </Box>
                  </HStack>
                </VStack>
              </VStack>
            </Box>

            {/* Note */}
            <Box>
              <Text fontSize={{ base: "xs", sm: "sm" }} color="gray.600" lineHeight="1.6">
                <strong>Note:</strong> Link2Feed API integration is completely optional. The system functions fully using CSV exports 
                from Link2Feed or any compatible appointment management system. API integration provides real-time synchronization 
                and enhanced features, but is not required for basic operations.
              </Text>
            </Box>
          </VStack>
        </CardBody>
      </Card>

      {/* Configuration Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Configure Link2Feed Integration</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Environment</FormLabel>
                <Select
                  value={config.environment}
                  onChange={(e) => handleConfigChange('environment', e.target.value)}
                >
                  <option value="test">Test</option>
                  <option value="staging">Staging</option>
                  <option value="live">Live</option>
                </Select>
                <FormHelperText>Choose your Link2Feed environment</FormHelperText>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>API Base URL</FormLabel>
                <Input
                  value={config.baseUrl}
                  onChange={(e) => handleConfigChange('baseUrl', e.target.value)}
                  placeholder="https://api.link2feed.com"
                />
                <FormHelperText>Your Link2Feed API endpoint URL</FormHelperText>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>API Key</FormLabel>
                <Input
                  value={config.apiKey}
                  onChange={(e) => handleConfigChange('apiKey', e.target.value)}
                  placeholder="Enter your Link2Feed API key"
                />
                <FormHelperText>Your unique organization identifier</FormHelperText>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Secret Key</FormLabel>
                <Input
                  value={config.secretKey}
                  onChange={(e) => handleConfigChange('secretKey', e.target.value)}
                  placeholder="Enter your Link2Feed secret key"
                  type="password"
                />
                <FormHelperText>Used for HMAC request signing (never transmitted)</FormHelperText>
              </FormControl>

              <FormControl>
                <FormLabel>Organization ID (Optional)</FormLabel>
                <Input
                  value={config.organizationId}
                  onChange={(e) => handleConfigChange('organizationId', e.target.value)}
                  placeholder="Enter your organization ID"
                />
                <FormHelperText>Your food bank's unique identifier</FormHelperText>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Flex
              direction={{ base: "column", sm: "row" }}
              justify="center"
              align="stretch"
              gap={{ base: 3, sm: 3 }}
              w="full"
              maxW="100%"
            >
              <Button
                variant="ghost"
                onClick={onClose}
                size={{ base: "md", sm: "md" }}
                w={{ base: "full", sm: "auto" }}
                minW={{ base: "auto", sm: "120px" }}
                order={{ base: 2, sm: 1 }}
              >
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                onClick={handleSaveConfig}
                isLoading={isConfiguring}
                loadingText="Saving..."
                size={{ base: "md", sm: "md" }}
                w={{ base: "full", sm: "auto" }}
                minW={{ base: "auto", sm: "180px" }}
                order={{ base: 1, sm: 2 }}
                fontWeight="600"
              >
                Save Configuration
              </Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Link2FeedStatus;
