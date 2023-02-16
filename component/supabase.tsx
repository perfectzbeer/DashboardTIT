import { createClient } from '@supabase/supabase-js'

const supabaseUrl:string = 'https://lldzljxhukgbylauxnvo.supabase.co'
const supabaseKey:string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsZHpsanhodWtnYnlsYXV4bnZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzAyOTkwMDIsImV4cCI6MTk4NTg3NTAwMn0.Lp4hg1lEBD7KYFckhxaG6NPGo5LSWngUBa37UDhkrNQ'

const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase;