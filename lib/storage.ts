import { supabaseClient, PUBLIC_BUCKET } from "./supabase";

export async function uploadBufferToSupabase(path: string, buf: Buffer, contentType: string) {
  const { data, error } = await supabaseClient.storage
    .from(PUBLIC_BUCKET)
    .upload(path, buf, { contentType, upsert: false });
  if (error) throw error;
  const { data: pub } = supabaseClient.storage.from(PUBLIC_BUCKET).getPublicUrl(path);
  return pub.publicUrl;
}