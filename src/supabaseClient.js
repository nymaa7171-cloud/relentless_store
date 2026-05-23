import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ddwbxmnyvpblilbewsne.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkd2J4bXludnBibGlsYmV3c25lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0NzM0NzcsImV4cCI6MjA5NTA0OTQ3N30.zXp2fOzX2Qvn95GI_cODDW1I0lbTTTkOITrDSgYmesk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
