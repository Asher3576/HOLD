import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** Phase A(목데이터)에서는 없어도 동작. Phase B부터 필수. */
export const supabase =
  url && anonKey ? createClient(url, anonKey) : null

export function requireSupabase() {
  if (!supabase) {
    throw new Error(
      'Supabase 환경변수가 없습니다. .env의 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY를 확인하세요.',
    )
  }
  return supabase
}
