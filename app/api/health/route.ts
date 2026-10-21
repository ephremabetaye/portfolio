import { connectDB, isDBConfigured } from "@/lib/mongodb";
import { getAdminConfigStatus } from "@/lib/auth";
import { envValue, getSiteUrl } from "@/lib/env";
import { getEmailjsConfig, isEmailjsConfigured } from "@/lib/email";
import { isDemoMode } from "@/lib/demo-store";

export const dynamic = "force-dynamic";

/**
 * Deployment diagnostic endpoint: open /api/health after deploying.
 * It only reports booleans/status, never secret values.
 */
export async function GET() {
  const database = {
    configured: isDBConfigured(),
    connected: false,
    error: "",
  };

  if (database.configured) {
    try {
      await connectDB();
      database.connected = true;
    } catch (e) {
      database.error = e instanceof Error ? e.message : "Database connection failed";
    }
  } else {
    database.error = "MONGODB_URI is not set for this deployment";
  }

  let emailConfigured = false;
  let emailError = "";
  if (!database.configured || database.connected) {
    try {
      emailConfigured = isEmailjsConfigured(await getEmailjsConfig());
    } catch (e) {
      emailError = e instanceof Error ? e.message : "Could not load email settings";
    }
  } else {
    // Avoid a second slow DB connection attempt in the health check.
    const service = envValue("NEXT_PUBLIC_EMAILJS_SERVICE_ID") || envValue("EMAILJS_SERVICE_ID");
    const template =
      envValue("NEXT_PUBLIC_EMAILJS_TEMPLATE_ID") ||
      envValue("EMAILJS_TEMPLATE_ID") ||
      envValue("EMAILJS_AUTO_REPLY_TEMPLATE_ID");
    const publicKey = envValue("NEXT_PUBLIC_EMAILJS_PUBLIC_KEY") || envValue("EMAILJS_PUBLIC_KEY");
    emailConfigured = !!(service && template && publicKey);
    if (!emailConfigured) emailError = "EmailJS env variables are not set (or configure them in Admin → Settings)";
  }

  return Response.json(
    {
      success: true,
      data: {
        environment: process.env.NODE_ENV,
        vercel: !!process.env.VERCEL,
        demoMode: isDemoMode(),
        siteUrl: getSiteUrl(),
        database,
        admin: getAdminConfigStatus(),
        email: { configured: emailConfigured, error: emailError },
      },
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
