import { getUserData } from '@decentraland/Identity'
import { addMinute, getScoreBoard } from './serverSupabase'
import { getPlayersInScene } from '@decentraland/Players'
import { buildLeaderBoard } from './leaderboard'

const shirtWearingTime: Record<string, number> = {}

const targetShirt = 'urn:decentraland:off-chain:base-avatars:f_simple_yellow_tshirt'

async function getAllUsersData(): Promise<any[]> {
  const players = await getPlayersInScene()
  return Promise.all(players.map(() => getUserData()))
}

async function isWearingTargetShirt(userData): Promise<boolean> {
  const wearingTargetShirt = userData.avatar.wearables.some((wearable: string) => {
    return wearable === targetShirt
  })
  return wearingTargetShirt
}

class TimerSystem implements ISystem {
  timer: number
  callback: () => Promise<void>

  constructor(callback: () => Promise<void>, timeout: number) {
    this.callback = callback
    this.timer = timeout
  }

  update(dt: number) {
    this.timer -= dt * 1000

    if (this.timer <= 0) {
      this.timer = 0
      void this.callback()
      engine.removeSystem(this)
    }
  }
}

async function checkAllUsersWearingTargetShirt() {
  const allUsersData = await getAllUsersData()
  log(allUsersData, 'data')

  for (const userData of allUsersData) {
    const publicKey = userData.publicKey

    const wearingTargetShirt = await isWearingTargetShirt(userData)
    log(wearingTargetShirt, 'check shirt')
    if (wearingTargetShirt) {
      const currentTime = shirtWearingTime[publicKey] || 0
      shirtWearingTime[publicKey] = currentTime + 1
      await addMinute(userData.publicKey, targetShirt)
        .then(() => {
          log('Minute added successfully FE')
        })
        .catch((error) => {
          log('Error calling addMin FE:', error, error.message)
        })
    }

    if (!wearingTargetShirt) {
      shirtWearingTime[publicKey] = 0
    }
  }

  engine.addSystem(new TimerSystem(checkAllUsersWearingTargetShirt, 60000))
}

void checkAllUsersWearingTargetShirt()

const smallStoneWall = new Entity('smallStoneWall')
engine.addEntity(smallStoneWall)
smallStoneWall.addComponent(
  new Transform({
    position: new Vector3(1, 0, 9.5),
    rotation: new Quaternion(0, 0, 0, 1),
    scale: new Vector3(1.8453333377838135, 1.8453333377838135, 6)
  })
)

smallStoneWall.addComponent(new GLTFShape('models/FenceStoneTallSmall_01.glb'))
smallStoneWall.addComponent(
  new OnPointerDown(() => {
    updateBoard().catch((error) => log(error))
  })
)

const boardParent = new Entity()
boardParent.addComponent(
  new Transform(
    new Transform({
      position: new Vector3(1.3, 2.2, 6.5),
      rotation: Quaternion.Euler(0, 270, 0)
    })
  )
)

engine.addEntity(boardParent)

async function updateBoard() {
  const scoreData: any = await getScoreBoard()
  buildLeaderBoard(scoreData, boardParent, 9).catch((error) => log(error))
}

updateBoard().catch((error) => log(error))
