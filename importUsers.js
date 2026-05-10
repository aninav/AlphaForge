import fs from 'fs'
import csv from 'csv-parser'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const users = []

fs.createReadStream('users.csv')
  .pipe(csv())
  .on('data', (data) => users.push(data))
  .on('end', async () => {
    for (const user of users) {
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
      })

      if (error) {
        console.log('Error:', error.message)
        continue
      }

      await supabase.from('profiles').insert({
        id: data.user.id,
        full_name: user.full_name,
        email: user.email,
      })

      console.log('Created:', user.email)
    }

    console.log('Done!')
  })