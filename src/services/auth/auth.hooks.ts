import { useMutation } from "@tanstack/react-query";
import { loginUser } from "./auth.api";
import { LoginPayload, AuthResponse } from "./auth.types";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/lib/admin-auth"; // ✅ Import koro

export const useLogin = () => {
  const router = useRouter();
  const { setIsAuthenticated } = useAdminAuth(); // ✅ Context state dhoro

  return useMutation<AuthResponse, Error, LoginPayload>({
    mutationFn: loginUser,
    onSuccess: (data) => {
      console.log("Login Success!", data.message);

      // ✅ STEP 1: AdminAuth ke janaw je login successful
      setIsAuthenticated(true);
      sessionStorage.setItem("admin_authenticated", "true");

      // ✅ STEP 2: Tarpor dashboard e pathaw
      router.push("/admin/dashboard");
    },
    onError: (error: any) => {
      console.error(
        "Login failed:",
        error.response?.data?.message || error.message,
      );
    },
  });
};
