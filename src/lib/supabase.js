import { createClient } from "@supabase/supabase-js";

const url = "https://vaaprybybixusxpfvksg.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhYXByeWJ5Yml4dXN4cGZ2a3NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyNDQ4NjksImV4cCI6MjA5NjgyMDg2OX0.upirqqbrBG1ZXrQdSYV4QKescFeStylqRPkOsewZuUA";

export const supabase = createClient(url, key);
