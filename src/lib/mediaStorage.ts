import { supabase } from '@/infrastructure/supabase/supabaseClient';

/**
 * Converts a base64 Data URL (e.g. captured from HTML5 Canvas / Camera) into a Blob
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(';base64,');
  const contentType = parts[0].split(':')[1] || 'image/jpeg';
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
}

/**
 * Uploads captured camera photo (Base64 DataURL or Blob) to Supabase Storage.
 * Stores under `media/{userId}/{timestamp}_{uuid}.jpg` or falls back to `avatars` or base64.
 */
export async function uploadCapturedMedia(
  mediaInput: string | Blob,
  folder = 'vibe_shots'
): Promise<string> {
  try {
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth?.user?.id || 'anonymous';
    const blob = typeof mediaInput === 'string' ? dataUrlToBlob(mediaInput) : mediaInput;
    const filename = `${folder}/${uid}/${Date.now()}_${crypto.randomUUID().slice(0, 8)}.jpg`;

    // Try primary media bucket first, then avatars bucket
    const targetBucket = 'media';
    const { error: uploadErr } = await supabase.storage.from(targetBucket).upload(filename, blob, {
      contentType: 'image/jpeg',
      upsert: false,
    });

    if (uploadErr) {
      // Fallback to avatars bucket if media bucket is not enabled
      const { error: avatarErr } = await supabase.storage.from('avatars').upload(filename, blob, {
        contentType: 'image/jpeg',
        upsert: false,
      });

      if (!avatarErr) {
        const { data } = supabase.storage.from('avatars').getPublicUrl(filename);
        return data.publicUrl;
      }

      console.warn('Storage bucket upload skipped, returning direct image:', uploadErr.message);
      return typeof mediaInput === 'string' ? mediaInput : URL.createObjectURL(blob);
    }

    const { data } = supabase.storage.from(targetBucket).getPublicUrl(filename);
    return data.publicUrl;
  } catch (err) {
    console.warn('Media upload error:', err);
    return typeof mediaInput === 'string' ? mediaInput : URL.createObjectURL(mediaInput as Blob);
  }
}
