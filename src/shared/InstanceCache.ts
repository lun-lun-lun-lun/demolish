//!native
//!optimize 2

import { Workspace } from '@rbxts/services';

type NewVector = ReturnType<typeof vector.create>;

const cache: Instance[] = [];
const FAR = 9999;
const DEFAULT_CACHE_POSITION = new CFrame(FAR, FAR, FAR);

export class InstanceCache {
  public cache: [Part | Model] = [] as unknown as [Part | Model];
  public hideCFrame: CFrame = DEFAULT_CACHE_POSITION;
  constructor(
    templatePart: Part | Model,
    amount: number,
    position: vector | undefined
  ) {
    for (let i = 0; i < amount; i++) {
      const templateClone: Part | Model = templatePart.Clone();
      templateClone.Parent = Workspace;
      //   if (type(templateClone) === "") {

      //   }
      this.cache.push(templateClone);
      this.hideCFrame =
        position !== undefined
          ? new CFrame(position.x, position.y, position.z)
          : DEFAULT_CACHE_POSITION;
      templateClone.PivotTo(this.hideCFrame);
    }
  }
  getPart() {
    for (const thing of this.cache) {
      return thing;
    }
  }
}

export default {};
