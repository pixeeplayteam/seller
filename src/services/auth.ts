import { supabase } from '../lib/supabase';
import type { LoginCredentials, RegisterCredentials } from '../types/auth';

export const signIn = async ({ email, password }: LoginCredentials) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
};

export const signUp = async ({ email, password }: RegisterCredentials) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
      data: {
        role: 'user',
      }
    },
  });

  if (error) {
    throw error;
  }

  if (data.user?.identities?.length === 0) {
    throw new Error('Email already registered. Please sign in instead.');
  }

  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
};

export const verifyEmail = async (token: string) => {
  const { error } = await supabase.auth.verifyOtp({
    token_hash: token,
    type: 'email',
  });

  if (error) {
    throw error;
  }
};