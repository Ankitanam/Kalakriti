import { supabase } from "./supabase";

export async function signUp(
  email: string,
  password: string,
  role: string = "buyer"
) {
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role,
      },
    },
  });
}

export async function signIn(
  email: string,
  password: string
) {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
}

export async function signOut() {
  return await supabase.auth.signOut();
}

export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}