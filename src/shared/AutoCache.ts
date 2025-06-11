//!native
//!optimize 2

import { Workspace } from '@rbxts/services';
import { RunService } from '@rbxts/services';
import { Spawn } from 'shared/SpawnTs';

type NewVector = ReturnType<typeof vector.create>;
type Cacheable = Part | Model;
const FAR = 5000;
//autocache sometimes bugs out when I put my parts really really far away
const DEFAULT_CACHE_POSITION = new CFrame(FAR, math.abs(FAR), FAR);
const MAX_CACHED_INSTANCES = 9000;
const allCaches: AutoCache[] = [];

export const rates = {
  increase: 1
};
export class AutoCache {
  public template: Cacheable = undefined as unknown as Cacheable;
  public cache: [Cacheable] = [] as unknown as [Cacheable];
  public hiddenCframe: CFrame = DEFAULT_CACHE_POSITION;
  public cframeTable: CFrame[] = [] as unknown as CFrame[];
  public maximum: number = MAX_CACHED_INSTANCES;
  public usedThisHeartbeat: boolean = false; //eventually will be changed for a more robust analysis
  constructor(template: Cacheable, amount: number, position: vector | undefined) {
    this.template = template;
    //if you gave a position, we'll use it
    this.hiddenCframe =
      position !== undefined
        ? new CFrame(position.x, position.y, position.z)
        : this.hiddenCframe;
    //make a table with the cframe repeated over and over for use with BulkMoveTo
    this.cframeTable = table.create(amount, this.hiddenCframe);
    for (let i = 0; i < amount; i++) {
      this._addClone(template);
    }
    //becomes faster than manually moving each model after ~50 moves
    Workspace.BulkMoveTo(
      this.cache,
      this.cframeTable,
      Enum.BulkMoveMode.FireCFrameChanged
    );

    allCaches.push(this);
  }

  //i use the underscore to say that you shouldnt be using the function, only me
  //will not copy the item by itself.
  _addItem(item: Cacheable) {
    if (item.IsA('Part')) {
      item.Anchored = true;
      //item.CanCollide = false;
    } else {
      for (const subItem of item.GetDescendants()) {
        if (subItem.IsA('Part') === true && subItem.Anchored === false) {
          subItem.Anchored = true;
        }
      }
    }
    item.Parent = Workspace;
    this.cache.push(item);
  }

  _addClone(originalItem: Cacheable) {
    const item = originalItem.Clone();
    if (item.IsA('Part')) {
      item.Anchored = true;
    } else {
      for (const subItem of item.GetDescendants()) {
        if (subItem.IsA('Part') === true && subItem.Anchored === false) {
          subItem.Anchored = true;
        }
      }
    }
    item.Parent = Workspace;
    this.cache.push(item);
  }
  add(amount: number | undefined) {
    this.usedThisHeartbeat = true;
    const repeats = amount === undefined ? 1 : amount;
    for (let i = 0; i < repeats; i++) {
      this._addClone(this.template);
    }
  }

  get() {
    this.usedThisHeartbeat = true;
    this.cframeTable.remove(0);
    return this.cache.remove(0);
  }

  return(item: Cacheable) {
    this.usedThisHeartbeat = true;
    const template = this.template;
    //fire destroy or something? it wasnt really destroyed though... not sure
    //for now i'll ignore things like that since they are irrelevant to my usecase, mostly
    item.Parent = template.Parent;
    //set miscellaneous attributes
    for (const attribute of template.GetAttributes()) {
      //need to skip GUID, they should be unique to each instance (will add GUIDs later btw)
      const [name, value] = [attribute[0], attribute[1]];
      if (name === 'UniqueId') {
        continue;
      }
      item.SetAttribute(name, value);
    }
    if (item.IsA('Part') && template.IsA('Part')) {
      item.Color = template.Color;
      item.Shape = template.Shape;
      item.Size = template.Size; //not sure if this works, vectors are weird in rbx
      item.CFrame = this.hiddenCframe;
      this._addItem(item);
    } else if (item.IsA('Model') && template.IsA('Model')) {
      //item.ScaleTo(template.GetScale());
      //would theoretically have to handle getting back removed children too?
      //sounds like too much work for a part of it im not really using
      item.Destroy();
      this._addClone(template);
    }
  }
}

RunService.Heartbeat.Connect(function (deltaTime) {
  for (const iCache of allCaches) {
    const cacheUsed = iCache.usedThisHeartbeat;
    if (cacheUsed === true) {
      iCache.usedThisHeartbeat = false;
    } else if (cacheUsed === false && iCache.cache.size() < iCache.maximum) {
      const increase =
        iCache.cache.size() + rates.increase > iCache.maximum
          ? iCache.maximum - iCache.cache.size()
          : rates.increase;
      for (let i = 0; i < increase; i++) {
        iCache._addItem(iCache.template.Clone());
      }
      //hi
    }
  }
});

export default rates;

//export default {};
