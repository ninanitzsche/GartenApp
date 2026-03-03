/**
 * Authentication Service
 * Handles password changes, reset requests, and re-authentication
 */
import { supabase } from './supabase';

/**
 * Change user password with re-authentication
 * Requires current password for security verification
 */
export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  // Re-authenticate with current password to verify user identity
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email) {
    throw new Error('User nicht gefunden');
  }

  // Verify current password by attempting sign in
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (authError) {
    throw new Error('Aktuelles Passwort ist falsch');
  }

  // Update password
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    throw new Error('Passwort konnte nicht geändert werden');
  }
}

/**
 * Send password reset email
 * Uses Supabase built-in password reset flow
 */
export async function resetPassword(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'https://gartenplaner.app/reset-password', // Fallback URL
  });

  if (error) {
    // Check for specific error types
    if (error.message.includes('not confirmed')) {
      throw new Error('E-Mail-Adresse wurde noch nicht bestätigt');
    }
    throw new Error('E-Mail konnte nicht gesendet werden');
  }
}

/**
 * Verify email is registered in system
 * Used for forgot password validation
 */
export async function verifyEmailExists(email: string): Promise<boolean> {
  try {
    // Attempt to send reset email - if no error, email exists
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return !error;
  } catch {
    return false;
  }
}
