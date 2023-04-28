import { getUserData, UserData } from '@decentraland/Identity'
import envConfig from './environment'

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

const SUPABASE_URL = envConfig.api_url
const SUPABASE_ANON_KEY = envConfig.api_key

export let userData: UserData

async function setUserData() {
  const data = await getUserData()
  userData = data
}

export async function addMinute(address, item, name) {
  if (!userData) {
    await setUserData()
  }

  const url = `${SUPABASE_URL}/rest/v1/rpc/update_or_insert_tracking`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY
      },
      body: JSON.stringify({
        uuid: generateUUID(),
        address,
        item,
        name
      })
    })

    if (response.ok) {
      const data = await response.text()
      log('Minutes added for user and item:', data)
    } else {
      log('Error adding minutes:', response.status, response.statusText)
      const errorData = await response.text()
      log('Error data:', errorData)
    }
  } catch (error) {
    log('Error calling Supabase:', error.message)
  }
}

export async function getScoreBoard() {
  const url = `${SUPABASE_URL}/rest/v1/tracking`

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY
      }
    })

    if (response.ok) {
      const data = await response.json()
      log('get data:', data)
      return data
    } else {
      log('Error getting data:', response.status, response.statusText)
      const errorData = await response.json()
      log('Error getting data:', errorData)
    }
  } catch (error) {
    log('Error calling Supabase to get data:', error.message)
  }
}
