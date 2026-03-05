import { redirect } from "next/navigation";

// Redirect legacy /product URL to the canonical slug-based product page
export default function ProductRedirectPage() {
  redirect("/product/california-pickle");
}
