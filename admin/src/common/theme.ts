/**
 * @fileoverview Foodbank Check-In and Appointment System - Admin Panel Theme Configuration
 * 
 * This file defines the Chakra UI theme configuration for the admin panel
 * application. The theme ensures consistency with the client frontend
 * while providing admin-specific styling and enhanced accessibility.
 * 
 * @author Lindsey D. Stead
 * @version 1.0.0
 * @since 2025-10-20
 * @license Proprietary - see LICENSE file for details
 * 
 * @see {@link ../../client/src/common/theme.ts} Client Frontend Theme
 * @see {@link https://chakra-ui.com/docs/styled-system/theme} Chakra UI Theme Docs
 */

import { extendTheme, type ThemeConfig } from '@chakra-ui/react'

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
}

const theme = extendTheme({
  config,
  colors: {
    foodbank: {
      blue: '#4A6B8C',
      green: '#6B9F7A',
      orange: '#E89B5C',
      coral: '#D85A4A',
    },
    // Enhanced neutral palette for better contrast
    neutral: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#E5E5E5',
      300: '#D4D4D4',
      400: '#A3A3A3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
    },
    brand: {
      50: '#E8EDF2',
      100: '#C5D4E0',
      200: '#A2BBCE',
      300: '#7FA2BC',
      400: '#5C89AA',
      500: '#4A6B8C', // Primary brand color (blue)
      600: '#3C5670',
      700: '#2E4154',
      800: '#202C38',
      900: '#12171C',
    },
    accent: {
      green: {
        50: '#F0F5F2',
        100: '#E1EBE5',
        200: '#C3D7CB',
        300: '#6B9F7A', // Logo green
        400: '#5D8C6A',
        500: '#4F795A',
      },
      orange: {
        50: '#FDF6F0',
        100: '#FBEDE1',
        200: '#F7DBC3',
        300: '#E89B5C', // Logo orange
        400: '#D88A4A',
        500: '#C87938',
      },
      coral: {
        50: '#FDF4F3',
        100: '#FAE9E7',
        200: '#F5D3CF',
        300: '#D85A4A', // Logo coral
        400: '#C24D3E',
        500: '#AC4032',
      },
    },
    // Admin-specific colors (matching frontend brand colors exactly)
    admin: {
      primary: '#25385D', // Frontend primary button color
      success: '#48BB78',
      warning: '#ED8936',
      error: '#F56565',
      info: '#4299E1',
    },
  },
  fonts: {
    heading: 'Open Sans, system-ui, sans-serif',
    body: 'Open Sans, system-ui, sans-serif',
  },
  components: {
    Container: {
      baseStyle: {
        maxW: 'container.xl',
        px: { base: 4, md: 8 },
        py: { base: 4, md: 6 },
      },
    },
    Button: {
      baseStyle: {
        fontWeight: '600',
        borderRadius: 'md',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        minH: '44px', // Touch-friendly minimum height
        minW: '44px', // Touch-friendly minimum width
        _focus: {
          boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.5)',
          outline: 'none',
          transform: 'scale(1.02)',
        },
        _focusVisible: {
          boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.5)',
          outline: 'none',
        },
      },
      variants: {
        solid: {
          bg: 'admin.primary',
          color: 'white',
          _hover: {
            bg: 'admin.primary',
            opacity: 0.9,
            transform: 'translateY(-2px)',
            boxShadow: 'lg',
            _disabled: {
              bg: 'admin.primary',
              opacity: 0.4,
              transform: 'none',
              boxShadow: 'none'
            }
          },
          _active: {
            bg: 'admin.primary',
            opacity: 0.8,
            transform: 'translateY(0)'
          },
          _disabled: {
            bg: 'admin.primary',
            opacity: 0.4,
            cursor: 'not-allowed'
          },
        },
        outline: {
          borderColor: 'brand.500',
          color: 'brand.500',
          _hover: {
            bg: 'brand.50',
            transform: 'translateY(-2px)',
            boxShadow: 'md',
          },
          _active: {
            bg: 'brand.100',
            transform: 'translateY(0)',
            boxShadow: 'sm'
          },
        },
        // Frontend primary button styles exactly
        primary: {
          size: { base: "md", md: "lg" },
          bg: "#25385D",
          color: "white",
          height: { base: "48px", md: "56px" },
          fontSize: { base: "md", md: "lg" },
          fontWeight: "600",
          borderRadius: "xl",
          width: { base: "100%", md: "auto" },
          minW: { base: "100%", md: "280px" },
          px: { base: 4, md: 6 },
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          _hover: {
            bg: "#1e2d47",
            transform: 'translateY(-2px)',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
          _active: {
            bg: "#1a2538",
            transform: 'translateY(0)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
          _disabled: {
            bg: "#25385D",
            opacity: 0.4,
            cursor: "not-allowed",
            transform: 'none',
            boxShadow: 'none',
          },
        },
        // Frontend language button styles exactly
        language: {
          width: { base: "100%", md: "auto" },
          height: { base: "48px", md: "56px" },
          variant: "outline",
          size: { base: "md", md: "lg" },
          borderRadius: "xl",
          minW: { base: "100%", md: "320px" },
          fontSize: { base: "md", md: "lg" },
          _hover: {
            bg: 'gray.50',
            borderColor: 'gray.500',
            transform: 'translateY(-2px)',
            boxShadow: 'md',
          },
          _focus: {
            boxShadow: '0 0 0 3px rgba(66, 153, 225, 0.6)',
            outline: 'none'
          },
          _active: {
            bg: 'gray.100',
            transform: 'translateY(0)',
            boxShadow: 'sm'
          },
        },
        // Frontend assistance button styles exactly
        assistance: {
          size: { base: "md", md: "lg" },
          variant: "outline",
          height: { base: "48px", md: "56px" },
          borderRadius: "md",
          borderColor: "#E2E8F0",
          color: "#25385D",
          fontSize: { base: "md", md: "lg" },
          fontWeight: "500",
          width: { base: "100%", md: "auto" },
          minW: { base: "100%", md: "320px" },
          px: { base: 4, md: 6 },
          _hover: {
            bg: 'gray.50',
            borderColor: '#CBD5E0',
            transform: 'translateY(-2px)',
            boxShadow: 'md'
          },
          _focus: {
            boxShadow: '0 0 0 3px rgba(66, 153, 225, 0.6)',
            outline: 'none'
          },
          _active: {
            bg: 'gray.100',
            borderColor: '#CBD5E0',
            transform: 'translateY(0)',
            boxShadow: 'sm'
          },
        },
        // Admin-specific button variants matching frontend
        admin: {
          bg: '#25385D',
          color: 'white',
          height: { base: '48px', md: '56px' },
          fontSize: { base: 'md', md: 'lg' },
          fontWeight: '500',
          borderRadius: 'md',
          width: { base: '100%', md: 'auto' },
          minW: { base: '100%', md: '280px' },
          px: { base: 4, md: 6 },
          _hover: {
            bg: '#25385D',
            opacity: 0.9,
            transform: 'translateY(-2px)',
            boxShadow: 'md',
          },
          _active: {
            bg: '#25385D',
            opacity: 0.8,
            transform: 'translateY(0)'
          },
        },
        // High contrast button variants for better readability
        adminDark: {
          bg: '#1A202C',
          color: 'white',
          height: { base: '48px', md: '56px' },
          fontSize: { base: 'md', md: 'lg' },
          fontWeight: '600',
          borderRadius: 'md',
          _hover: {
            bg: '#2D3748',
            transform: 'translateY(-2px)',
            boxShadow: 'lg',
          },
          _active: {
            bg: '#1A202C',
            transform: 'translateY(0)'
          },
        },
        adminGreen: {
          bg: '#38A169',
          color: 'white',
          height: { base: '48px', md: '56px' },
          fontSize: { base: 'md', md: 'lg' },
          fontWeight: '600',
          borderRadius: 'md',
          _hover: {
            bg: '#2F855A',
            transform: 'translateY(-2px)',
            boxShadow: 'lg',
          },
          _active: {
            bg: '#38A169',
            transform: 'translateY(0)'
          },
        },
        adminOrange: {
          bg: '#DD6B20',
          color: 'white',
          height: { base: '48px', md: '56px' },
          fontSize: { base: 'md', md: 'lg' },
          fontWeight: '600',
          borderRadius: 'md',
          _hover: {
            bg: '#C05621',
            transform: 'translateY(-2px)',
            boxShadow: 'lg',
          },
          _active: {
            bg: '#DD6B20',
            transform: 'translateY(0)'
          },
        },
        success: {
          bg: 'admin.success',
          color: 'white',
          _hover: {
            bg: 'green.600',
            transform: 'translateY(-2px)',
            boxShadow: 'md',
          },
        },
        warning: {
          bg: 'admin.warning',
          color: 'white',
          _hover: {
            bg: 'orange.600',
            transform: 'translateY(-2px)',
            boxShadow: 'md',
          },
        },
        danger: {
          bg: 'admin.error',
          color: 'white',
          _hover: {
            bg: 'red.600',
            transform: 'translateY(-2px)',
            boxShadow: 'md',
          },
        },
      },
      defaultProps: {
        variant: 'solid',
      },
    },
    Input: {
      baseStyle: {
        field: {
          height: { base: '48px', md: '56px' },
          fontSize: { base: 'md', md: 'lg' },
          _focus: {
            borderColor: 'brand.500',
            boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
          },
        },
      },
      variants: {
        filled: {
          field: {
            _hover: {
              bg: 'gray.100',
            },
            _focus: {
              bg: 'white',
            },
          },
        },
      },
    },
    Heading: {
      baseStyle: {
        color: 'neutral.800',
        fontWeight: '700',
        lineHeight: '110%',
        letterSpacing: '-0.5%',
      },
    },
    Text: {
      baseStyle: {
        color: 'neutral.700',
        fontSize: 'md',
        lineHeight: '1.6',
        fontWeight: '400',
      },
    },
    Link: {
      baseStyle: {
        color: 'brand.500',
        _hover: {
          textDecoration: 'none',
          color: 'brand.600',
        },
      },
    },
    Card: {
      baseStyle: {
        container: {
          bg: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '2xl',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          border: '1px solid',
          borderColor: 'rgba(255, 255, 255, 0.2)',
          p: { base: 4, sm: 6, md: 8 },
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          _before: {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'rgba(255, 255, 255, 0.4)',
          },
          _hover: {
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            transform: 'translateY(-2px)',
            borderColor: 'rgba(255, 255, 255, 0.3)',
          },
        },
      },
    },
    Form: {
      variants: {
        floating: {
          container: {
            _focusWithin: {
              label: {
                transform: 'scale(0.85) translateY(-24px)',
                color: 'brand.500',
              },
            },
            'input:not(:placeholder-shown) + label, .chakra-select__wrapper + label': {
              transform: 'scale(0.85) translateY(-24px)',
            },
            label: {
              color: 'gray.500',
              top: 0,
              left: 0,
              zIndex: 2,
              position: 'absolute',
              backgroundColor: 'white',
              pointerEvents: 'none',
              mx: 3,
              px: 1,
              my: 2,
              transformOrigin: 'left top',
            },
          },
        },
      },
    },
    // Admin-specific components
    Stat: {
      baseStyle: {
        container: {
          bg: 'white',
          borderRadius: 'lg',
          p: 6,
          boxShadow: 'sm',
          border: '1px solid',
          borderColor: 'gray.200',
        },
        label: {
          fontSize: 'sm',
          color: 'gray.600',
          fontWeight: '500',
        },
        number: {
          fontSize: '2xl',
          fontWeight: '700',
          color: 'gray.900',
        },
      },
    },
  },
  styles: {
    global: {
      'html, body': {
        color: 'neutral.800',
        // Force consistent color rendering across devices
        colorAdjust: 'exact',
        WebkitColorAdjust: 'exact',
        // Consistent solid gray background
        backgroundColor: '#f8fafc',
        minHeight: '100vh',
      },
      // Improve focus visibility for accessibility
      '*:focus': {
        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.5) !important',
        outline: 'none',
      },
      '*:focus-visible': {
        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.5) !important',
        outline: 'none',
      },
      // Improve text readability
      'p, span': {
        lineHeight: '1.8',
      },
      // Custom scrollbar styling matching frontend
      '::-webkit-scrollbar': {
        width: '4px',
        height: '4px',
      },
      '::-webkit-scrollbar-track': {
        width: '6px',
        bg: 'rgba(0, 0, 0, 0.1)',
        borderRadius: '24px',
      },
      '::-webkit-scrollbar-thumb': {
        background: 'rgba(0, 0, 0, 0.2)',
        borderRadius: '24px',
        '&:hover': {
          background: 'rgba(0, 0, 0, 0.3)',
        },
      },
      // Firefox scrollbar styling
      '*': {
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(0, 0, 0, 0.2) rgba(0, 0, 0, 0.1)',
        colorAdjust: 'exact',
        WebkitColorAdjust: 'exact',
      },
      // Ensure consistent colors across all device sizes
      '.chakra-box[bg="gray.50"]': {
        backgroundColor: 'neutral.50 !important',
      },
      '.chakra-box[bg="gray.100"]': {
        backgroundColor: 'neutral.100 !important',
      },
      // Make sidebar consistent
      '[data-testid="sidebar"], .chakra-box[data-testid="sidebar"]': {
        backgroundColor: 'white !important',
      },
      // Make header consistent
      '[data-testid="header"], .chakra-box[data-testid="header"]': {
        backgroundColor: 'white !important',
      },
      // Make secondary text consistent
      '.chakra-text[color="gray.500"], .chakra-text[color="gray.600"]': {
        color: 'neutral.600 !important',
      },
      // Make borders consistent
      '.chakra-box[borderColor="gray.200"]': {
        borderColor: 'neutral.200 !important',
      },
      // High contrast mode support
      '@media (prefers-contrast: high)': {
        'button, input, select, textarea': {
          borderWidth: '2px',
          boxShadow: '0 0 0 2px currentColor',
        },
      },
      // Reduced motion support
      '@media (prefers-reduced-motion: reduce)': {
        '*': {
          animationDuration: '0.01ms !important',
          animationIterationCount: '1 !important',
          transitionDuration: '0.01ms !important',
        },
      },
    },
  },
  layerStyles: {
    // Glass morphism card
    glassCard: {
      bg: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderRadius: '2xl',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      border: '1px solid',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      p: { base: 4, sm: 6, md: 8 },
      position: 'relative',
      overflow: 'hidden',
      _before: {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '1px',
        background: 'rgba(255, 255, 255, 0.4)',
      },
    },
    // Elevated card with depth
    elevatedCard: {
      bg: 'rgba(255, 255, 255, 0.98)',
      borderRadius: '2xl',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      border: '1px solid',
      borderColor: 'rgba(255, 255, 255, 0.3)',
      p: { base: 5, sm: 7, md: 9 },
      position: 'relative',
      overflow: 'hidden',
      _before: {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '1px',
        background: '#4A6B8C',
        opacity: 0.2,
      },
    },
    // Subtle card for secondary content
    subtleCard: {
      bg: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(5px)',
      borderRadius: 'xl',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      p: { base: 3, sm: 4, md: 5 },
    },
    // Status card with colored accent
    statusCard: {
      bg: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderRadius: '2xl',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      border: '1px solid',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      borderLeft: '4px solid',
      borderLeftColor: 'blue.400',
      p: { base: 4, sm: 6, md: 8 },
      position: 'relative',
    },
    // Interactive card with hover effects
    interactiveCard: {
      bg: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderRadius: '2xl',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      border: '1px solid',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      p: { base: 4, sm: 6, md: 8 },
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
      _hover: {
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        transform: 'translateY(-2px)',
        borderColor: 'rgba(255, 255, 255, 0.3)',
      },
    },
    // Legacy styles for compatibility
    card: {
      bg: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderRadius: '2xl',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      border: '1px solid',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      p: { base: 4, sm: 6, md: 8 },
    },
    selected: {
      bg: 'rgba(59, 130, 246, 0.1)',
      borderColor: 'blue.400',
      color: 'blue.600',
      boxShadow: '0 0 0 1px rgba(59, 130, 246, 0.2)',
    },
    // Admin-specific layer styles
    adminCard: {
      bg: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderRadius: '2xl',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      border: '1px solid',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      p: { base: 4, sm: 6, md: 8 },
    },
    statCard: {
      bg: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderRadius: '2xl',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      border: '1px solid',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      p: { base: 4, sm: 6, md: 8 },
    },
  },
  textStyles: {
    h1: {
      fontSize: ['2xl', '3xl', '4xl'],
      fontWeight: 'bold',
      lineHeight: '110%',
      letterSpacing: '-2%',
    },
    h2: {
      fontSize: ['xl', '2xl', '3xl'],
      fontWeight: 'semibold',
      lineHeight: '110%',
      letterSpacing: '-1%',
    },
    subtitle: {
      fontSize: ['md', 'lg', 'xl'],
      fontWeight: 'normal',
      lineHeight: '140%',
    },
    // Admin-specific text styles
    adminTitle: {
      fontSize: ['xl', '2xl', '3xl'],
      fontWeight: 'bold',
      color: '#25385D', // Fixed color - no responsive variations
    },
    statNumber: {
      fontSize: ['2xl', '3xl', '4xl'],
      fontWeight: '700',
      color: 'neutral.800', // Fixed color - no responsive variations
    },
  },
})

export default theme
