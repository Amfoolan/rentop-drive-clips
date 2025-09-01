import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(url, key);
export const PUBLIC_BUCKET = "videos";

export async function uploadBufferToSupabase(path: string, buf: Buffer, contentType: string) {
  const { error } = await supabase.storage.from(PUBLIC_BUCKET).upload(path, buf, {
    contentType, 
    upsert: false
  });
  
  if (error) throw error;
  
  const { data } = supabase.storage.from(PUBLIC_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}