//!native
//!optimize 2

import { Workspace } from '@rbxts/services';
import { RunService } from '@rbxts/services';

//define a type that can be either a part or a model
type Cacheable = Part | Model;
//constant representing a far away position
const FAR = 5000;
//the default location where cached objects are hidden
const DEFAULT_CACHE_POSITION = new CFrame(FAR, FAR, FAR);
//maximum number of instances allowed in the cache
const MAX_CACHED_INSTANCES = 9999;
//stores all autocache instances in the game
const allCaches: AutoCache[] = [];

//the rate at which the cache gets another part until it reaches its maximum
export const rates = {
  increase: 1
};

//an automatically increasing cache of parts or models
export class AutoCache {
  public template: Cacheable = undefined as unknown as Cacheable; //the template to clone from
  public cache: [Cacheable] = [] as unknown as [Cacheable]; //the cache storing parts or models
  public hiddenCframe: CFrame = DEFAULT_CACHE_POSITION; //where to hide objects when cached
  public cframeTable: CFrame[] = [] as unknown as CFrame[]; //used for bulk movement
  public maximum: number = MAX_CACHED_INSTANCES; //how many instances the cache can store
  public usedThisHeartbeat: boolean = false; //tracks if cache was used during current heartbeat

  constructor(template: Cacheable, amount: number, position: vector | undefined) {
    this.template = template;
    //if a custom hiding position is given use it otherwise use the default
    this.hiddenCframe =
      position !== undefined
        ? new CFrame(position.x, position.y, position.z)
        : this.hiddenCframe;
    //create a table with the same cframe for bulk moving instances
    this.cframeTable = table.create(amount, this.hiddenCframe);
    //add the initial number of instances to the cache
    for (let i = 0; i < amount; i++) {
      this._addClone(template);
    }
    //move all cached instances to the hidden position using bulkmoveto
    Workspace.BulkMoveTo(
      this.cache,
      this.cframeTable,
      Enum.BulkMoveMode.FireCFrameChanged
    );

    //add this cache instance to the list of all caches
    allCaches.push(this);
  }

  //i use the underscore to say that you shouldnt be using the function only me
  //will not copy the item by itself
  _addItem(item: Cacheable) {
    if (item.IsA('Part')) {
      item.Anchored = true;
      //item.CanCollide = false;
    } else {
      //anchor all parts inside a model
      for (const subItem of item.GetDescendants()) {
        if (subItem.IsA('Part') === true && subItem.Anchored === false) {
          subItem.Anchored = true;
        }
      }
    }
    //move the item to the workspace and add it to the cache
    item.Parent = Workspace;
    this.cache.push(item);
  }

  //creates a clone of the original item and adds it to the cache
  _addClone(originalItem: Cacheable) {
    const item = originalItem.Clone();
    if (item.IsA('Part')) {
      item.Anchored = true;
    } else {
      //anchor all unanchored parts inside the model
      for (const subItem of item.GetDescendants()) {
        if (subItem.IsA('Part') === true && subItem.Anchored === false) {
          subItem.Anchored = true;
        }
      }
    }
    item.Parent = Workspace;
    this.cache.push(item);
  }

  //adds more instances to the cache optionally specify how many
  add(amount: number | undefined) {
    this.usedThisHeartbeat = true;
    const repeats = amount === undefined ? 1 : amount;
    for (let i = 0; i < repeats; i++) {
      this._addClone(this.template);
    }
  }

  //gets an instance from the cache and marks cache as used
  get() {
    this.usedThisHeartbeat = true;
    this.cframeTable.remove(0);
    return this.cache.remove(0);
  }

  //returns an instance to the cache and resets its properties
  return(item: Cacheable) {
    this.usedThisHeartbeat = true;
    const template = this.template;
    //move the item back to the template's parent
    item.Parent = template.Parent;
    //set attributes to match the template skipping uniqueid
    for (const attribute of template.GetAttributes()) {
      const [name, value] = [attribute[0], attribute[1]];
      if (name === 'UniqueId') {
        continue;
      }
      item.SetAttribute(name, value);
    }

    //if the item is a part, match physical properties and hide it
    if (item.IsA('Part') && template.IsA('Part')) {
      item.Color = template.Color;
      item.Shape = template.Shape;
      item.Size = template.Size;
      item.CFrame = this.hiddenCframe;
      this._addItem(item);
    } else if (item.IsA('Model') && template.IsA('Model')) {
      //if the item is a model, destroy it and replace with a new clone
      //i didnt end up using models in the cache anyway so this horrendous idea never affected anything
      item.Destroy();
      this._addClone(template);
    }
  }
}

//runs every heartbeat to check each cache every frame to see if we need to add a part or not
RunService.Heartbeat.Connect(function (deltaTime) {
  for (const iCache of allCaches) {
    const cacheUsed = iCache.usedThisHeartbeat;
    if (cacheUsed === true) {
      //reset check for use on this frame for next heartbeat
      iCache.usedThisHeartbeat = false;
    } else if (cacheUsed === false && iCache.cache.size() < iCache.maximum) {
      //if cache wasnt used and not full yet, add more instances
      const increase =
        iCache.cache.size() + rates.increase > iCache.maximum
          ? iCache.maximum - iCache.cache.size()
          : rates.increase;
      for (let i = 0; i < increase; i++) {
        iCache._addItem(iCache.template.Clone());
      }
    }
  }
});

export default rates;

//export default {};
