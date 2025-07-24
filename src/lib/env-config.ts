/**
 * Environment Configuration Utility
 * 
 * This file provides a centralized place to access environment variables
 * with proper typing and default values.
 */

// List of valid roles in the system
export const VALID_ROLES = [
  'SuperUser', 
  'ketuaLingkungan', 
  'sekretaris', 
  'wakilSekretaris', 
  'bendahara', 
  'wakilBendahara',
  'wakilKetua',
  'umat'
] as const;

export type Role = typeof VALID_ROLES[number];

// Environment configuration object with type checking
export const envConfig = {
  // User role for development
  devUserRole: process.env.NEXT_PUBLIC_DEV_USER_ROLE as Role || 'umat',
  
  // App URL
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  
  // Check if we're in development mode
  isDevelopment: process.env.NODE_ENV === 'development',
  
  // Check if we're in production mode
  isProduction: process.env.NODE_ENV === 'production',
};

/**
 * Validates if a role is valid
 * @param role The role to validate
 * @returns boolean indicating if the role is valid
 */
export function isValidRole(role: string): role is Role {
  return VALID_ROLES.includes(role as Role);
}

/**
 * Gets the current user role from environment in development
 * or falls back to the default role
 * @param defaultRole Optional default role if none is specified
 * @returns The current role
 */
export function getDevUserRole(defaultRole: Role = 'umat'): Role {
  const envRole = process.env.NEXT_PUBLIC_DEV_USER_ROLE;
  
  if (envRole && isValidRole(envRole)) {
    return envRole;
  }
  
  return defaultRole;
}

export default envConfig; 