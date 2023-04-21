const TitleFont = new Font(Fonts.SansSerif)
const SFFont = new Font(Fonts.SansSerif)

export enum TextTypes {
  BIGTITLE = 'bigtitle',
  BIGVALUE = 'bigvalue',
  TITLE = 'title',
  LABEL = 'label',
  VALUE = 'value',
  UNIT = 'unit',
  TINYVALUE = 'tinyvalue',
  TINYTITLE = 'tinytitle'
}

export class ScoreBoardText extends Entity {
  constructor(type: TextTypes, text: string, transform: TranformConstructorArgs, parent: Entity) {
    super()
    engine.addEntity(this)

    this.addComponent(new Transform(transform))
    this.setParent(parent)

    const shape = new TextShape(text)

    shape.width = 10

    switch (type) {
      case TextTypes.BIGTITLE:
        shape.fontSize = 4
        shape.color = Color3.White()
        shape.vTextAlign = 'center'
        shape.font = TitleFont
        break
      case TextTypes.BIGVALUE:
        shape.fontSize = 3
        shape.color = Color3.Green()
        shape.vTextAlign = 'center'
        shape.font = TitleFont
        break

      case TextTypes.TITLE:
        shape.fontSize = 3
        shape.color = Color3.White()
        shape.vTextAlign = 'center'
        shape.width = 10
        shape.font = TitleFont
        break
      case TextTypes.TINYTITLE:
        shape.fontSize = 2
        shape.color = Color3.White()
        shape.vTextAlign = 'center'
        shape.width = 10
        shape.font = SFFont
        break
      case TextTypes.LABEL:
        shape.fontSize = 3
        shape.color = Color3.White()
        shape.vTextAlign = 'left'
        shape.font = SFFont
        break
      case TextTypes.VALUE:
        shape.fontSize = 3
        shape.color = Color3.Green()
        shape.vTextAlign = 'right'
        shape.font = SFFont
        break
      case TextTypes.TINYVALUE:
        shape.fontSize = 2
        shape.color = Color3.Green()
        shape.vTextAlign = 'right'
        shape.font = SFFont
        break

      case TextTypes.UNIT:
        shape.fontSize = 2
        shape.color = Color3.White()
        shape.vTextAlign = 'right'
        shape.font = SFFont
        break
    }

    this.addComponent(shape)
  }
}

const scoreBoardNames: ScoreBoardText[] = []
const scoreBoardValues: ScoreBoardText[] = []

function truncateString(str: string) {
  let shortStr = str
  const maxLength = 8
  if (str.length > maxLength) {
    const start = str.slice(0, maxLength / 2)
    const end = str.slice(-maxLength / 2)
    shortStr = `${start}...${end}`
  }
  return shortStr
}

export async function buildLeaderBoard(scoreData: any[], parent: Entity, length: number) {
  // if canvas is empty
  if (scoreBoardNames.length === 0) {
    const nameTitle = new ScoreBoardText(
      TextTypes.BIGTITLE,
      'leader',
      {
        position: new Vector3(-0.8, 0.65, 0)
      },
      parent
    )

    const scoreTitle = new ScoreBoardText(
      TextTypes.BIGTITLE,
      'board',
      {
        position: new Vector3(0.8, 0.65, 0)
      },
      parent
    )

    for (let i = 0; i < length; i++) {
      if (i < scoreData.length) {
        const address = scoreData[i].user_address
        const shortAddress = truncateString(address)

        const name = new ScoreBoardText(
          TextTypes.TINYTITLE,
          shortAddress,
          {
            position: new Vector3(-0.6, 0.2 - i / 4, 0)
          },
          parent
        )
        scoreBoardNames.push(name)

        const score = new ScoreBoardText(
          TextTypes.TINYVALUE,
          scoreData[i].minutes_worn.toString(),
          {
            position: new Vector3(0.6, 0.2 - i / 4, 0)
          },
          parent
        )
        scoreBoardValues.push(score)
      } else {
        // create empty line
        const name = new ScoreBoardText(
          TextTypes.TINYTITLE,
          '-',
          {
            position: new Vector3(-0.6, 0.2 - i / 4, 0)
          },
          parent
        )
        scoreBoardNames.push(name)

        const score = new ScoreBoardText(
          TextTypes.TINYVALUE,
          '-',
          {
            position: new Vector3(0.6, 0.2 - i / 4, 0)
          },
          parent
        )
        scoreBoardValues.push(score)
      }
    }
  } else {
    // update existing board
    for (let i = 0; i < length; i++) {
      if (i > scoreData.length) {
        const address = scoreData[i].user_address
        const shortAddress = truncateString(address)
        scoreBoardNames[i].getComponent(TextShape).value = shortAddress
        scoreBoardValues[i].getComponent(TextShape).value = scoreData[i].minutes_worn
      }
    }
  }
}
