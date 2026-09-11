import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { auth } from "./auth";

export const authClient = createAuthClient({
  //The base URL of the server & plugins
  plugins: [
    inferAdditionalFields<typeof auth>(), // Baca type dari Role
  ],
});
