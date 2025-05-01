//!native
//!optimize 2

import { Workspace } from '@rbxts/services';
import { RunService } from '@rbxts/services';
import { Spawn } from 'shared/SpawnTs';

type NewVector = ReturnType<typeof vector.create>;
type Cacheable = Part | Model;
const FAR = 9999;
const DEFAULT_CACHE_POSITION = new CFrame(0, FAR, 0);
const allCaches: Instance[] = [];

//const MAX_CACHED_INSTANCES = 9000;

export class InstanceCache {
  public template: Cacheable = undefined as unknown as Cacheable;
  public cache: [Cacheable] = [] as unknown as [Cacheable];
  public hiddenCframe: CFrame = DEFAULT_CACHE_POSITION;
  public cframeTable: CFrame[] = [] as unknown as CFrame[];
  public maximum: number = 9000;
  constructor(
    template: Cacheable,
    amount: number,
    position: vector | undefined
  ) {
    this.template = template;
    //if you gave a position, we'll use it
    this.hiddenCframe =
      position !== undefined
        ? new CFrame(position.x, position.y, position.z)
        : this.hiddenCframe;
    //make a table with the cframe repeated over and over for use with BulkMoveTo
    this.cframeTable = table.create(amount, this.hiddenCframe);
    for (let i = 0; i < amount; i++) {
      this._addCopy(template.Clone());
    }
    //becomes faster than manually moving each model after ~50 moves
    Workspace.BulkMoveTo(
      this.cache,
      this.cframeTable,
      Enum.BulkMoveMode.FireCFrameChanged
    );
  }

  //i use the underscore to say that you shouldnt be using the function, only me
  _addCopy(item: Cacheable) {
    if (item.IsA('Part')) {
      item.Anchored = true;
    } else {
      for (const subItem of item.GetDescendants()) {
        if (
          subItem.IsA('Part') === true &&
          subItem.Anchored === false
        ) {
          subItem.Anchored = true;
        }
      }
    }
    item.Parent = Workspace;
    this.cache.push(item);
  }

  get() {
    print(this.cache.size());
    this.cframeTable.remove(0);
    return this.cache.remove(0);
  }

  return() {
    task.defer(function () {});
    // Spawn(function () {
    //   print('hiiii');
    // });
  }
}

RunService.Heartbeat.Connect(function () {});

//export default {};
