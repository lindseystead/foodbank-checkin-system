/**
 * @fileoverview Foodbank Check-In and Appointment System - Client Frontend Theme Configuration
 * 
 * This file defines the Chakra UI theme configuration for the client-facing
 * check-in application. The theme ensures consistency with the admin panel
 * while maintaining accessibility and professional appearance.
 * 
 * @author Lindsey D. Stead
 * @version 1.0.0
 * @since 2025-10-20
 * @license Proprietary - see LICENSE file for details
 * 
 * @see {@link ../../admin/src/common/theme.ts} Admin Panel Theme
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
      purple: '#9B7AB6',
      orange: '#E89B5C',
      coral: '#D85A4A',
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
      purple: {
        50: '#F5F2F7',
        100: '#EBE5EF',
        200: '#D7CBDF',
        300: '#9B7AB6', // Logo purple
        400: '#8A6BA3',
        500: '#795C90',
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
    // Client-specific colors matching admin panel
    client: {
      primary: '#25385D', // Primary button color
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
          bg: 'client.primary',
          color: 'white',
          _hover: {
            bg: 'client.primary',
            opacity: 0.9,
            transform: 'translateY(-2px)',
            boxShadow: 'lg',
            _disabled: {
              bg: 'client.primary',
              opacity: 0.4,
              transform: 'none',
              boxShadow: 'none'
            }
          },
          _active: {
            bg: 'client.primary',
            opacity: 0.8,
            transform: 'translateY(0)'
          },
          _disabled: {
            bg: 'client.primary',
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
        // Primary button styles matching admin panel
        primary: {
          size: { base: "md", md: "lg" },
          bg: "#25385D",
          color: "white",
          height: { base: "48px", md: "56px" },
          fontSize: { base: "md", md: "lg" },
          fontWeight: "500",
          borderRadius: "md",
          width: { base: "100%", md: "auto" },
          minW: { base: "100%", md: "280px" },
          px: { base: 4, md: 6 },
          _hover: {
            bg: "#25385D",
            opacity: 0.9,
            transform: 'translateY(-2px)',
            boxShadow: 'md',
          },
          _active: {
            bg: "#25385D",
            opacity: 0.8,
            transform: 'translateY(0)'
          },
          _disabled: {
            bg: "#25385D",
            opacity: 0.6,
            cursor: "not-allowed",
            _hover: {
              bg: "#25385D",
              opacity: 0.6,
              transform: 'none',
              boxShadow: 'none'
            }
          },
        },
        // Language button styles
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
        // Assistance button styles
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
        color: 'brand.500',
        fontWeight: '600',
        lineHeight: '110%',
        letterSpacing: '-1%',
      },
    },
    Text: {
      baseStyle: {
        color: 'gray.700',
        fontSize: 'lg',
        lineHeight: '1.8',
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
          bg: 'white',
          borderRadius: 'xl',
          boxShadow: 'md',
          p: { base: 2, sm: 3, md: 4 },
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
  },
  styles: {
    global: {
      'html, body': {
        color: 'gray.800',
      },
      // Responsive container behavior - automatically shrink on smaller screens
      '.chakra-container': {
        maxWidth: '100% !important',
        paddingLeft: '1rem !important',
        paddingRight: '1rem !important',
        '@media (min-width: 48em)': {
          maxWidth: 'container.xl !important',
          paddingLeft: '2rem !important',
          paddingRight: '2rem !important',
        },
      },
      // Make all VStack and HStack components responsive
      '.chakra-stack': {
        width: '100% !important',
        maxWidth: '100% !important',
        '@media (min-width: 48em)': {
          maxWidth: 'none !important',
        },
      },
      // Responsive text sizing
      '.chakra-text, .chakra-heading': {
        fontSize: 'clamp(0.875rem, 2.5vw, 1.125rem) !important',
        '@media (min-width: 48em)': {
          fontSize: '1.125rem !important',
        },
      },
      // Responsive button sizing
      '.chakra-button': {
        width: '100% !important',
        '@media (min-width: 48em)': {
          width: 'auto !important',
        },
      },
      // Override specific max-width constraints that cause horizontal scrolling
      '[maxW="container.sm"], [maxW="container.md"], [maxW="container.lg"]': {
        maxWidth: '100% !important',
        '@media (min-width: 48em)': {
          maxWidth: 'var(--chakra-sizes-container-md) !important',
        },
        '@media (min-width: 62em)': {
          maxWidth: 'var(--chakra-sizes-container-lg) !important',
        },
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
      // Custom scrollbar styling matching admin panel
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
    card: {
      bg: 'white',
      borderRadius: 'xl',
      boxShadow: 'md',
      p: { base: 2, sm: 3, md: 4 },
    },
    selected: {
      bg: 'brand.50',
      borderColor: 'brand.500',
      color: 'brand.500',
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
  },
})

export default theme 