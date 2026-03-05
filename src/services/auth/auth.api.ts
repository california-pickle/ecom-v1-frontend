// src/services/auth/auth.api.ts

import axiosInstance from "@/lib/axiosInstance";
import { LoginPayload, AuthResponse } from "./auth.types";

export const loginUser = async (
  credentials: LoginPayload,
): Promise<AuthResponse> => {
  // Tomar backend er login route e POST request dicchi
  const response = await axiosInstance.post<AuthResponse>(
    "/auth/login",
    credentials,
  );

  // MAGIC: Ekhane kono token save korar code nai!
  // Browser auto cookie theke token niye nibe backend er 'httpOnly' er karone.

  return response.data;
};
