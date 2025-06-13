// From AxisAngle

/**
 * CollisionCheck module type definitions for Roblox-TS
 */
declare namespace CollisionCheck {
  /**
   * Checks if two cylinders intersect.
   * @param position0 Center of first cylinder
   * @param height0 Height of first cylinder
   * @param radius0 Radius of first cylinder
   * @param position1 Center of second cylinder
   * @param height1 Height of second cylinder
   * @param radius1 Radius of second cylinder
   */
  function cylinderInCylinder(
    position0: vector,
    height0: number,
    radius0: number,
    position1: vector,
    height1: number,
    radius1: number
  ): boolean;

  /**
   * Checks if a box and a sphere intersect.
   * @param cframe0 CFrame of the box
   * @param size0 Size of the box
   * @param position1 Center of the sphere
   * @param radius1 Radius of the sphere
   */
  function boxInSphere(
    cframe0: CFrame,
    size0: vector,
    position1: vector,
    radius1: number
  ): boolean;

  /**
   * Checks if two spheres intersect.
   * @param position0 Center of first sphere
   * @param radius0 Radius of first sphere
   * @param position1 Center of second sphere
   * @param radius1 Radius of second sphere
   */
  function sphereInSphere(
    position0: vector,
    radius0: number,
    position1: vector,
    radius1: number
  ): boolean;

  /**
   * Checks if two boxes intersect.
   * @param cframe0 CFrame of first box
   * @param size0 Size of first box
   * @param cframe1 CFrame of second box
   * @param size1 Size of second box
   */
  function boxInBox(
    cframe0: CFrame,
    size0: vector,
    cframe1: CFrame,
    size1: vector
  ): boolean;
}

export = CollisionCheck;
