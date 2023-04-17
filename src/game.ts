import { getUserData } from '@decentraland/Identity';

const stand = new Entity();
stand.addComponent(new BoxShape());
stand.addComponent(new Transform({ position: new Vector3(8, 0, 8) }));
engine.addEntity(stand);

const avatar = new Entity();
const avatarShape = new AvatarShape();

avatar.addComponent(avatarShape);
avatar.addComponent(new Transform({ position: new Vector3(8, 0.5, 8) }));
engine.addEntity(avatar);
avatarShape.bodyShape = 'urn:decentraland:off-chain:base-avatars:BaseFemale';
avatarShape.skinColor = new Color4(0.94921875, 0.76171875, 0.6484375, 1);
avatarShape.eyeColor = new Color4(0.23046875, 0.625, 0.3125, 1);
avatarShape.hairColor = new Color4(0.234375, 0.12890625, 0.04296875, 1);
avatarShape.wearables = [
  'urn:decentraland:off-chain:base-avatars:f_simple_yellow_tshirt',
  'urn:decentraland:off-chain:base-avatars:f_red_modern_pants',
  'urn:decentraland:off-chain:base-avatars:bun_shoes',
  'urn:decentraland:off-chain:base-avatars:standard_hair',
  'urn:decentraland:off-chain:base-avatars:f_eyes_00',
  'urn:decentraland:off-chain:base-avatars:f_eyebrows_00',
  'urn:decentraland:off-chain:base-avatars:f_mouth_00',
];

// executeTask(async () => {
//   let data = await getUserData();
//   log(data, 'data');
// });

void getUserData().then(async (a) => {
  log(a, 'avatar');
  const av = a.avatar;
  avatarShape.bodyShape = av.bodyShape;
  avatarShape.wearables = av.wearables;
  engine.addEntity(avatar);
});

const shirtWearingTime: Record<string, number> = {};

const targetShirt = 'urn:decentraland:off-chain:base-avatars:polocoloredtshirt';

async function isWearingTargetShirt(): Promise<boolean> {
  let data = await getUserData();
  log(data, 'av');
  const wearingTargetShirt = data.avatar.wearables.some((wearable: string) => {
    return wearable === targetShirt;
  });
  return wearingTargetShirt;
}
class TimerSystem implements ISystem {
  timer: number;
  callback: () => Promise<void>;

  constructor(callback: () => Promise<void>, timeout: number) {
    this.callback = callback;
    this.timer = timeout;
  }

  update(dt: number) {
    this.timer -= dt * 1000;

    if (this.timer <= 0) {
      this.timer = 0;
      void this.callback();
      engine.removeSystem(this);
    }
  }
}

async function checkMyAvatarWearingShirt() {
  const userData = await getUserData();
  const publicKey = userData.publicKey;

  const wearingTargetShirt = await isWearingTargetShirt();
  log(wearingTargetShirt, 'check shirt');
  if (wearingTargetShirt) {
    const currentTime = shirtWearingTime[publicKey] || 0;
    shirtWearingTime[publicKey] = currentTime + 1;
  }

  if (!wearingTargetShirt) {
    shirtWearingTime[publicKey] = 0;
  }

  engine.addSystem(new TimerSystem(checkMyAvatarWearingShirt, 60000));
}

void checkMyAvatarWearingShirt();

function addShirtWearingTimeToStand(publicKey: string) {
  const text = new Entity();
  text.addComponent(new TextShape('Wearing shirt for: 0 minutes'));
  text.addComponent(new Transform({ position: new Vector3(0, 2, 0) }));
  text.setParent(stand);
  engine.addEntity(text);

  class UpdateTextSystem implements ISystem {
    timer: number;
    callback: () => void;

    constructor(callback: () => void, timeout: number) {
      this.callback = callback;
      this.timer = timeout;
    }

    update(dt: number) {
      this.timer -= dt * 1000;

      if (this.timer <= 0) {
        this.timer = 0;
        this.callback();
        engine.removeSystem(this);
        engine.addSystem(new UpdateTextSystem(updateText, 60000));
      }
    }
  }

  const updateText = () => {
    const time = shirtWearingTime[publicKey] || 0;
    text.getComponent(TextShape).value = `Wearing shirt for: ${time} minutes`;
  };

  engine.addSystem(new UpdateTextSystem(updateText, 60000));
}

void getUserData().then(async (userData) => {
  addShirtWearingTimeToStand(userData.publicKey);
});
