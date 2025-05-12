//!native
//!optimize 2

//by doing --!native, the code is transpiled to C++ and runs faster (but uses more memory)
//using !optimize 2 is just doing the same optimizations the rolbox would do in a live game

//original calculations are from AxisAngle in 2015, i only translated from lua to typescript

//const pointToObjectSpace = emptyCFrame.PointToObjectSpace;

export function CylinderInCylinder(
  position0: vector,
  height0: number,
  radius0: number,
  position1: vector,
  height1: number,
  radius1: number
): boolean {
  const halfHeight0: number = height0 / 2;
  const halfHeight1: number = height1 / 2;
  const cylinder0Min: number = position0.y - halfHeight0;
  const cylinder0Max: number = position0.y + halfHeight0;
  const cylinder1Min: number = position1.y - halfHeight1;
  const cylinder1Max: number = position1.y + halfHeight1;

  if (
    //are we too far up to be hitting
    cylinder0Min > cylinder1Max ||
    cylinder0Max < cylinder1Min
  ) {
    return false;
  }

  const distX: number = position1.x - position0.x;
  const distZ: number = position1.z - position0.z;
  const radiusSum: number = radius0 + radius1;

  //is the distance bigger than our radius*, discounting the y
  if (distX * distX + distZ * distZ > radiusSum * radiusSum) {
    return false;
  }

  return true;
}

export function boxInSphere(
  cframe0: CFrame,
  size0: vector,
  position1: vector,
  radius1: number
): boolean {
  const relative: Vector3 = cframe0.PointToObjectSpace(
    position1 as unknown as Vector3
  );
  const sizeX: number = size0.x / 2;
  const sizeY: number = size0.x / 2;
  const sizeZ: number = size0.z / 2;
  const relX: number = relative.X;
  const relY: number = relative.Y;
  const relZ: number = relative.Z;

  //very ugly to look at unfortunately, but a potential computation skip
  //also eslint is being very annoying && i wish i could specify the newline thing not to be forced
  const distX: number =
    relX > sizeX
      ? relX - sizeX
      : relX < -sizeX
        ? relX + sizeX
        : 0;
  const distY: number =
    relY > sizeY
      ? relY - sizeY
      : relY < -sizeY
        ? relY + sizeY
        : 0;
  const distZ: number =
    relZ > sizeZ
      ? relZ - sizeZ
      : relZ < -sizeZ
        ? relZ + sizeZ
        : 0;
  return (
    distX * distX + distY * distY + distZ * distZ <
    radius1 * radius1
  );
}

export function sphereInSphere(
  position0: vector,
  radius0: number,
  position1: vector,
  radius1: number
): boolean {
  //is the distance between our positions bigger than our radius?
  const magnitude = math.sqrt(
    ((position1.x - position0.x) ^ 2) +
      ((position1.y - position0.y) ^ 2) +
      ((position1.z - position0.z) ^ 2)
  );
  return magnitude < radius0 + radius1;
}

export function boxInBox(
  cframe0: CFrame,
  size0: vector,
  cframe1: CFrame,
  size1: vector
): boolean {
  let [
    m00,
    m01,
    // eslint-disable-next-line prefer-const
    m02,
    m03,
    m04,
    m05,
    m06,
    m07,
    m08,
    m09,
    m10,
    m11
  ] = cframe0.GetComponents();
  let [
    m12,
    m13,
    m14,
    m15,
    m16,
    m17,
    m18,
    m19,
    m20,
    m21,
    m22,
    m23
  ] = cframe1.GetComponents();

  const [m24, m25, m26]: [number, number, number] = [
    size0.x / 2,
    size0.y / 2,
    size0.z / 2
  ];
  const [m27, m28, m29]: [number, number, number] = [
    size1.x / 2,
    size1.y / 2,
    size1.z / 2
  ];
  let [m30, m31, m32]: [number, number, number] = [
    m12 - m00,
    m13 - m01,
    m14 - m02
  ];
  m00 = m03 * m30 + m06 * m31 + m09 * m32;
  m01 = m04 * m30 + m07 * m31 + m10 * m32;
  m12 = m15 * m30 + m18 * m31 + m21 * m32;
  m13 = m16 * m30 + m19 * m31 + m22 * m32;
  m14 = m17 * m30 + m20 * m31 + m23 * m32;
  m30 = m12 > m27 ? m12 - m27 : m12 < -m27 ? m12 + m27 : 0;
  m31 = m13 > m28 ? m13 - m28 : m13 < -m28 ? m13 + m28 : 0;
  m32 = m14 > m29 ? m14 - m29 : m14 < -m29 ? m14 + m29 : 0;
  let m33 = m00 > m24 ? m00 - m24 : m00 < -m24 ? m00 + m24 : 0;
  let m34 = m01 > m25 ? m01 - m25 : m01 < -m25 ? m01 + m25 : 0;
  let m35 = m02 > m26 ? m02 - m26 : m02 < -m26 ? m02 + m26 : 0;
  const m36 = m30 * m30 + m31 * m31 + m32 * m32;
  m30 = m33 * m33 + m34 * m34 + m35 * m35;
  m31 =
    m24 < m25 ? (m24 < m26 ? m24 : m26) : m25 < m26 ? m25 : m26;
  m32 =
    m27 < m28 ? (m27 < m29 ? m27 : m29) : m28 < m29 ? m28 : m29;

  //for context, the guy that wrote the original code is an actual genius mathematician. i have no idea what any of these calculations signify or how they work.
  //i asked the dude who showed me this and he doesn't know either. its faster than the built in roblox methods, and established algorithms like GJK and EPA
  //i dont think we'll ever know what goes on inside AxisAngle's head.
  if (m36 < m31 * m31 || m30 < m32 * m32) {
    return true;
  } else if (
    m36 > m24 * m24 + m25 * m25 + m26 * m26 ||
    m30 > m27 * m27 + m28 * m28 + m29 * m29
  ) {
    return false;
  } else {
    m30 = m03 * m15 + m06 * m18 + m09 * m21;
    m31 = m03 * m16 + m06 * m19 + m09 * m22;
    m32 = m03 * m17 + m06 * m20 + m09 * m23;
    m03 = m04 * m15 + m07 * m18 + m10 * m21;
    m06 = m04 * m16 + m07 * m19 + m10 * m22;
    m09 = m04 * m17 + m07 * m20 + m10 * m23;
    m04 = m05 * m15 + m08 * m18 + m11 * m21;
    m07 = m05 * m16 + m08 * m19 + m11 * m22;
    m10 = m05 * m17 + m08 * m20 + m11 * m23;
    m05 = m29 * m29;
    m08 = m27 * m27;
    m11 = m28 * m28;
    m15 = m24 * m30;
    m16 = m25 * m03;
    m17 = m26 * m04;
    m18 = m24 * m31;
    m19 = m25 * m06;
    m20 = m26 * m07;
    m21 = m24 * m32;
    m22 = m25 * m09;
    m23 = m26 * m10;
    m33 = m15 + m16 + m17 - m12;
    if (m33 * m33 < m08) {
      const m34 = m18 + m19 + m20 - m13;
    }
    if (m34 * m34 < m11) {
      const m35 = m21 + m22 + m23 - m14;
    }
    if (m35 * m35 < m05) {
      return true;
    }
    m33 = -m15 + m16 + m17 - m12;
    if (m33 * m33 < m08) {
      m34 = -m18 + m19 + m20 - m13;
    }
    if (m34 * m34 < m11) {
      m35 = -m21 + m22 + m23 - m14;
    }
    if (m35 * m35 < m05) {
      return true;
    }
    m33 = m15 - m16 + m17 - m12;
    if (m33 * m33 < m08) {
      m34 = m18 - m19 + m20 - m13;
    }
    if (m34 * m34 < m11) {
      const m35 = m21 - m22 + m23 - m14;
    }
    if (m35 * m35 < m05) {
      return true;
    }
    m33 = -m15 - m16 + m17 - m12;
    if (m33 * m33 < m08) {
      m34 = -m18 - m19 + m20 - m13;
    }
    if (m34 * m34 < m11) {
      const m35 = -m21 - m22 + m23 - m14;
    }
    if (m35 * m35 < m05) {
      return true;
    }
    m33 = m15 + m16 - m17 - m12;
    if (m33 * m33 < m08) {
      m34 = m18 + m19 - m20 - m13;
    }
    if (m34 * m34 < m11) {
      const m35 = m21 + m22 - m23 - m14;
    }
    if (m35 * m35 < m05) {
      return true;
    }
    m33 = -m15 + m16 - m17 - m12;
    if (m33 * m33 < m08) {
      m34 = -m18 + m19 - m20 - m13;
    }
    if (m34 * m34 < m11) {
      const m35 = -m21 + m22 - m23 - m14;
    }
    if (m35 * m35 < m05) {
      return true;
    }
    m33 = m15 - m16 - m17 - m12;
    if (m33 * m33 < m08) {
      m34 = m18 - m19 - m20 - m13;
    }
    if (m34 * m34 < m11) {
      const m35 = m21 - m22 - m23 - m14;
    }
    if (m35 * m35 < m05) {
      return true;
    }
    m33 = -m15 - m16 - m17 - m12;
    if (m33 * m33 < m08) {
      m34 = -m18 - m19 - m20 - m13;
    }
    if (m34 * m34 < m11) {
      const m35 = -m21 - m22 - m23 - m14;
    }
    if (m35 * m35 < m05) {
      return true;
    }
  }

  m12 = m24 * m24;
  m13 = m25 * m25;
  m14 = m26 * m26;
  m15 = m27 * m04;
  m16 = m28 * m07;
  m17 = m27 * m30;
  m18 = m28 * m31;
  m19 = m27 * m03;
  m20 = m28 * m06;
  m21 = m29 * m10;
  m22 = m29 * m32;
  m23 = m29 * m09;
  // 	elseif m36>m24*m24+m25*m25+m26*m26 || m30>m27*m27+m28*m28+m29*m29)
  // 		return false
  // 	else
  // 		--LOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOL
  // 		--(This is how you tell if something was made by Axis Angle)

  // 		 let m33 =m15+m16+m17-m12};if (  m33*m33<m08)  {let m34 =m18+m19+m20-m13};if (  m34*m34<m11)  {let m35 =m21+m22+m23-m14;if (  m35 *m35<m05) {return true};
  // 		 let m33 =-m15+m16+m17-m12};if (  m33*m33<m08)  {let m34 =-m18+m19+m20-m13};if (  m34*m34<m11)  {let m35 =-m21+m22+m23-m14;if (  m35 *m35<m05) {return true};
  // 		 let m33 =m15-m16+m17-m12};if (  m33*m33<m08)  {let m34 =m18-m19+m20-m13};if (  m34*m34<m11)  {let m35 =m21-m22+m23-m14;if (  m35 *m35<m05) {return true};
  // 		 let m33 =-m15-m16+m17-m12};if (  m33*m33<m08)  {let m34 =-m18-m19+m20-m13};if (  m34*m34<m11)  {let m35 =-m21-m22+m23-m14;if (  m35 *m35<m05) {return true};
  // 		 let m33 =m15+m16-m17-m12};if (  m33*m33<m08)  {let m34 =m18+m19-m20-m13};if (  m34*m34<m11)  {let m35 =m21+m22-m23-m14;if (  m35 *m35<m05) {return true};
  // 		 let m33 =-m15+m16-m17-m12};if (  m33*m33<m08)  {let m34 =-m18+m19-m20-m13};if (  m34*m34<m11)  {let m35 =-m21+m22-m23-m14;if (  m35 *m35<m05) {return true};
  // 		 let m33 =m15-m16-m17-m12};if (  m33*m33<m08)  {let m34 =m18-m19-m20-m13};if (  m34*m34<m11)  {let m35 =m21-m22-m23-m14;if (  m35 *m35<m05) {return true};
  // 		 let m33 =-m15-m16-m17-m12};if (  m33*m33<m08)  {let m34 =-m18-m19-m20-m13};if (  m34*m34<m11)  {let m35 =-m21-m22-m23-m14;if (  m35 *m35<m05) {return true};
  // 		 let m12 =m24*m24
  // 		 let m13 =m25*m25
  // 		 let m14 =m26*m26
  // 		 let m15 =m27*m04
  // 		 let m16 =m28*m07
  // 		 let m17 =m27*m30
  // 		 let m18 =m28*m31
  // 		 let m19 =m27*m03
  // 		 let m20 =m28*m06
  // 		 let m21 =m29*m10
  // 		 let m22 =m29*m32
  // 		 let m23 =m29*m09
  m35 = (m02 - m26 + m15 + m16) / m10;
  if (m35 * m35 < m05) {
    const m33 = m00 + m17 + m18 - m35 * m32;
  }
  if (m33 * m33 < m12) {
    const m34 = m01 + m19 + m20 - m35 * m09;
  }
  if (m34 * m34 < m13) {
    return true;
  }
  m35 = (m02 + m26 + m15 + m16) / m10;
  if (m35 * m35 < m05) {
    const m33 = m00 + m17 + m18 - m35 * m32;
  }
  if (m33 * m33 < m12) {
    const m34 = m01 + m19 + m20 - m35 * m09;
  }
  if (m34 * m34 < m13) {
    return true;
  }
  m35 = (m02 - m26 - m15 + m16) / m10;
  if (m35 * m35 < m05) {
    const m33 = m00 - m17 + m18 - m35 * m32;
  }
  if (m33 * m33 < m12) {
    const m34 = m01 - m19 + m20 - m35 * m09;
  }
  if (m34 * m34 < m13) {
    return true;
  }
  m35 = (m02 + m26 - m15 + m16) / m10;
  if (m35 * m35 < m05) {
    const m33 = m00 - m17 + m18 - m35 * m32;
  }
  if (m33 * m33 < m12) {
    const m34 = m01 - m19 + m20 - m35 * m09;
  }
  if (m34 * m34 < m13) {
    return true;
  }
  m35 = (m02 - m26 + m15 - m16) / m10;
  if (m35 * m35 < m05) {
    const m33 = m00 + m17 - m18 - m35 * m32;
  }
  if (m33 * m33 < m12) {
    const m34 = m01 + m19 - m20 - m35 * m09;
  }
  if (m34 * m34 < m13) {
    return true;
  }
  m35 = (m02 + m26 + m15 - m16) / m10;
  if (m35 * m35 < m05) {
    const m33 = m00 + m17 - m18 - m35 * m32;
  }
  if (m33 * m33 < m12) {
    const m34 = m01 + m19 - m20 - m35 * m09;
  }
  if (m34 * m34 < m13) {
    return true;
  }
  m35 = (m02 - m26 - m15 - m16) / m10;
  if (m35 * m35 < m05) {
    const m33 = m00 - m17 - m18 - m35 * m32;
  }
  if (m33 * m33 < m12) {
    const m34 = m01 - m19 - m20 - m35 * m09;
  }
  if (m34 * m34 < m13) {
    return true;
  }
  m35 = (m02 + m26 - m15 - m16) / m10;
  if (m35 * m35 < m05) {
    const m33 = m00 - m17 - m18 - m35 * m32;
  }
  if (m33 * m33 < m12) {
    const m34 = m01 - m19 - m20 - m35 * m09;
  }
  if (m34 * m34 < m13) {
    return true;
  }
  m35 = (m00 - m24 + m17 + m18) / m32;
  if (m35 * m35 < m05) {
    const m33 = m01 + m19 + m20 - m35 * m09;
  }
  if (m33 * m33 < m13) {
    const m34 = m02 + m15 + m16 - m35 * m10;
  }
  if (m34 * m34 < m14) {
    return true;
  }
  m35 = (m00 + m24 + m17 + m18) / m32;
  if (m35 * m35 < m05) {
    const m33 = m01 + m19 + m20 - m35 * m09;
  }
  if (m33 * m33 < m13) {
    const m34 = m02 + m15 + m16 - m35 * m10;
  }
  if (m34 * m34 < m14) {
    return true;
  }
  m35 = (m00 - m24 - m17 + m18) / m32;
  if (m35 * m35 < m05) {
    const m33 = m01 - m19 + m20 - m35 * m09;
  }
  if (m33 * m33 < m13) {
    const m34 = m02 - m15 + m16 - m35 * m10;
  }
  if (m34 * m34 < m14) {
    return true;
  }
  m35 = (m00 + m24 - m17 + m18) / m32;
  if (m35 * m35 < m05) {
    const m33 = m01 - m19 + m20 - m35 * m09;
  }
  if (m33 * m33 < m13) {
    const m34 = m02 - m15 + m16 - m35 * m10;
  }
  if (m34 * m34 < m14) {
    return true;
  }
  m35 = (m00 - m24 + m17 - m18) / m32;
  if (m35 * m35 < m05) {
    const m33 = m01 + m19 - m20 - m35 * m09;
  }
  if (m33 * m33 < m13) {
    const m34 = m02 + m15 - m16 - m35 * m10;
  }
  if (m34 * m34 < m14) {
    return true;
  }
  m35 = (m00 + m24 + m17 - m18) / m32;
  if (m35 * m35 < m05) {
    const m33 = m01 + m19 - m20 - m35 * m09;
  }
  if (m33 * m33 < m13) {
    const m34 = m02 + m15 - m16 - m35 * m10;
  }
  if (m34 * m34 < m14) {
    return true;
  }
  m35 = (m00 - m24 - m17 - m18) / m32;
  if (m35 * m35 < m05) {
    const m33 = m01 - m19 - m20 - m35 * m09;
  }
  if (m33 * m33 < m13) {
    const m34 = m02 - m15 - m16 - m35 * m10;
  }
  if (m34 * m34 < m14) {
    return true;
  }
  m35 = (m00 + m24 - m17 - m18) / m32;
  if (m35 * m35 < m05) {
    const m33 = m01 - m19 - m20 - m35 * m09;
  }
  if (m33 * m33 < m13) {
    const m34 = m02 - m15 - m16 - m35 * m10;
  }
  if (m34 * m34 < m14) {
    return true;
  }
  m35 = (m01 - m25 + m19 + m20) / m09;
  if (m35 * m35 < m05) {
    const m33 = m02 + m15 + m16 - m35 * m10;
  }
  if (m33 * m33 < m14) {
    const m34 = m00 + m17 + m18 - m35 * m32;
  }
  if (m34 * m34 < m12) {
    return true;
  }
  m35 = (m01 + m25 + m19 + m20) / m09;
  if (m35 * m35 < m05) {
    const m33 = m02 + m15 + m16 - m35 * m10;
  }
  if (m33 * m33 < m14) {
    const m34 = m00 + m17 + m18 - m35 * m32;
  }
  if (m34 * m34 < m12) {
    return true;
  }
  m35 = (m01 - m25 - m19 + m20) / m09;
  if (m35 * m35 < m05) {
    const m33 = m02 - m15 + m16 - m35 * m10;
  }
  if (m33 * m33 < m14) {
    const m34 = m00 - m17 + m18 - m35 * m32;
  }
  if (m34 * m34 < m12) {
    return true;
  }
  m35 = (m01 + m25 - m19 + m20) / m09;
  if (m35 * m35 < m05) {
    const m33 = m02 - m15 + m16 - m35 * m10;
  }
  if (m33 * m33 < m14) {
    const m34 = m00 - m17 + m18 - m35 * m32;
  }
  if (m34 * m34 < m12) {
    return true;
  }
  m35 = (m01 - m25 + m19 - m20) / m09;
  if (m35 * m35 < m05) {
    const m33 = m02 + m15 - m16 - m35 * m10;
  }
  if (m33 * m33 < m14) {
    const m34 = m00 + m17 - m18 - m35 * m32;
  }
  if (m34 * m34 < m12) {
    return true;
  }
  m35 = (m01 + m25 + m19 - m20) / m09;
  if (m35 * m35 < m05) {
    const m33 = m02 + m15 - m16 - m35 * m10;
  }
  if (m33 * m33 < m14) {
    const m34 = m00 + m17 - m18 - m35 * m32;
  }
  if (m34 * m34 < m12) {
    return true;
  }
  m35 = (m01 - m25 - m19 - m20) / m09;
  if (m35 * m35 < m05) {
    const m33 = m02 - m15 - m16 - m35 * m10;
  }
  if (m33 * m33 < m14) {
    const m34 = m00 - m17 - m18 - m35 * m32;
  }
  if (m34 * m34 < m12) {
    return true;
  }
  m35 = (m01 + m25 - m19 - m20) / m09;
  if (m35 * m35 < m05) {
    const m33 = m02 - m15 - m16 - m35 * m10;
  }
  if (m33 * m33 < m14) {
    const m34 = m00 - m17 - m18 - m35 * m32;
  }
  if (m34 * m34 < m12) {
    return true;
  }
  m35 = (m02 - m26 + m16 + m21) / m04;
  if (m35 * m35 < m08) {
    const m33 = m00 + m18 + m22 - m35 * m30;
  }
  if (m33 * m33 < m12) {
    const m34 = m01 + m20 + m23 - m35 * m03;
  }
  if (m34 * m34 < m13) {
    return true;
  }
  m35 = (m02 + m26 + m16 + m21) / m04;
  if (m35 * m35 < m08) {
    const m33 = m00 + m18 + m22 - m35 * m30;
  }
  if (m33 * m33 < m12) {
    const m34 = m01 + m20 + m23 - m35 * m03;
  }
  if (m34 * m34 < m13) {
    return true;
  }
  m35 = (m02 - m26 - m16 + m21) / m04;
  if (m35 * m35 < m08) {
    const m33 = m00 - m18 + m22 - m35 * m30;
  }
  if (m33 * m33 < m12) {
    const m34 = m01 - m20 + m23 - m35 * m03;
  }
  if (m34 * m34 < m13) {
    return true;
  }
  m35 = (m02 + m26 - m16 + m21) / m04;
  if (m35 * m35 < m08) {
    const m33 = m00 - m18 + m22 - m35 * m30;
  }
  if (m33 * m33 < m12) {
    const m34 = m01 - m20 + m23 - m35 * m03;
  }
  if (m34 * m34 < m13) {
    return true;
  }
  m35 = (m02 - m26 + m16 - m21) / m04;
  if (m35 * m35 < m08) {
    const m33 = m00 + m18 - m22 - m35 * m30;
  }
  if (m33 * m33 < m12) {
    const Axi = m01 + m20 - m23 - m35 * m03;
    if (Axi * Axi < m13) {
      return true;
    }
  }
  m35 = (m02 + m26 + m16 - m21) / m04;
  if (m35 * m35 < m08) {
    const m33 = m00 + m18 - m22 - m35 * m30;
  }
  if (m33 * m33 < m12) {
    const sAn = m01 + m20 - m23 - m35 * m03;
    if (sAn * sAn < m13) {
      return true;
    }
  }
  m35 = (m02 - m26 - m16 - m21) / m04;
  if (m35 * m35 < m08) {
    const m33 = m00 - m18 - m22 - m35 * m30;
  }
  if (m33 * m33 < m12) {
    const gle = m01 - m20 - m23 - m35 * m03;
    if (gle * gle < m13) {
      return true;
    }
  }
  m35 = (m02 + m26 - m16 - m21) / m04;
  if (m35 * m35 < m08) {
    const m33 = m00 - m18 - m22 - m35 * m30;
  }
  if (m33 * m33 < m12) {
    const m34 = m01 - m20 - m23 - m35 * m03;
  }
  if (m34 * m34 < m13) {
    return true;
  }
  m35 = (m00 - m24 + m18 + m22) / m30;
  if (m35 * m35 < m08) {
    const m33 = m01 + m20 + m23 - m35 * m03;
  }
  if (m33 * m33 < m13) {
    const m34 = m02 + m16 + m21 - m35 * m04;
  }
  if (m34 * m34 < m14) {
    return true;
  }
  m35 = (m00 + m24 + m18 + m22) / m30;
  if (m35 * m35 < m08) {
    const m33 = m01 + m20 + m23 - m35 * m03;
  }
  if (m33 * m33 < m13) {
    const m34 = m02 + m16 + m21 - m35 * m04;
  }
  if (m34 * m34 < m14) {
    return true;
  }
  m35 = (m00 - m24 - m18 + m22) / m30;
  if (m35 * m35 < m08) {
    const m33 = m01 - m20 + m23 - m35 * m03;
  }
  if (m33 * m33 < m13) {
    const m34 = m02 - m16 + m21 - m35 * m04;
  }
  if (m34 * m34 < m14) {
    return true;
  }
  m35 = (m00 + m24 - m18 + m22) / m30;
  if (m35 * m35 < m08) {
    const m33 = m01 - m20 + m23 - m35 * m03;
  }
  if (m33 * m33 < m13) {
    const m34 = m02 - m16 + m21 - m35 * m04;
  }
  if (m34 * m34 < m14) {
    return true;
  }
  m35 = (m00 - m24 + m18 - m22) / m30;
  if (m35 * m35 < m08) {
    const m33 = m01 + m20 - m23 - m35 * m03;
  }
  if (m33 * m33 < m13) {
    const m34 = m02 + m16 - m21 - m35 * m04;
  }
  if (m34 * m34 < m14) {
    return true;
  }
  m35 = (m00 + m24 + m18 - m22) / m30;
  if (m35 * m35 < m08) {
    const m33 = m01 + m20 - m23 - m35 * m03;
  }
  if (m33 * m33 < m13) {
    const m34 = m02 + m16 - m21 - m35 * m04;
  }
  if (m34 * m34 < m14) {
    return true;
  }
  m35 = (m00 - m24 - m18 - m22) / m30;
  if (m35 * m35 < m08) {
    const m33 = m01 - m20 - m23 - m35 * m03;
  }
  if (m33 * m33 < m13) {
    const m34 = m02 - m16 - m21 - m35 * m04;
  }
  if (m34 * m34 < m14) {
    return true;
  }
  m35 = (m00 + m24 - m18 - m22) / m30;
  if (m35 * m35 < m08) {
    const m33 = m01 - m20 - m23 - m35 * m03;
  }
  if (m33 * m33 < m13) {
    const m34 = m02 - m16 - m21 - m35 * m04;
  }
  if (m34 * m34 < m14) {
    return true;
  }
  m35 = (m01 - m25 + m20 + m23) / m03;
  if (m35 * m35 < m08) {
    const m33 = m02 + m16 + m21 - m35 * m04;
  }
  if (m33 * m33 < m14) {
    const m34 = m00 + m18 + m22 - m35 * m30;
  }
  if (m34 * m34 < m12) {
    return true;
  }
  m35 = (m01 + m25 + m20 + m23) / m03;
  if (m35 * m35 < m08) {
    const m33 = m02 + m16 + m21 - m35 * m04;
  }
  if (m33 * m33 < m14) {
    const m34 = m00 + m18 + m22 - m35 * m30;
  }
  if (m34 * m34 < m12) {
    return true;
  }
  m35 = (m01 - m25 - m20 + m23) / m03;
  if (m35 * m35 < m08) {
    const m33 = m02 - m16 + m21 - m35 * m04;
  }
  if (m33 * m33 < m14) {
    const m34 = m00 - m18 + m22 - m35 * m30;
  }
  if (m34 * m34 < m12) {
    return true;
  }
  m35 = (m01 + m25 - m20 + m23) / m03;
  if (m35 * m35 < m08) {
    const m33 = m02 - m16 + m21 - m35 * m04;
  }
  if (m33 * m33 < m14) {
    const m34 = m00 - m18 + m22 - m35 * m30;
  }
  if (m34 * m34 < m12) {
    return true;
  }
  m35 = (m01 - m25 + m20 - m23) / m03;
  if (m35 * m35 < m08) {
    const m33 = m02 + m16 - m21 - m35 * m04;
  }
  if (m33 * m33 < m14) {
    const m34 = m00 + m18 - m22 - m35 * m30;
  }
  if (m34 * m34 < m12) {
    return true;
  }
  m35 = (m01 + m25 + m20 - m23) / m03;
  if (m35 * m35 < m08) {
    const m33 = m02 + m16 - m21 - m35 * m04;
  }
  if (m33 * m33 < m14) {
    const m34 = m00 + m18 - m22 - m35 * m30;
  }
  if (m34 * m34 < m12) {
    return true;
  }
  m35 = (m01 - m25 - m20 - m23) / m03;
  if (m35 * m35 < m08) {
    const m33 = m02 - m16 - m21 - m35 * m04;
  }
  if (m33 * m33 < m14) {
    const m34 = m00 - m18 - m22 - m35 * m30;
  }
  if (m34 * m34 < m12) {
    return true;
  }
  m35 = (m01 + m25 - m20 - m23) / m03;
  if (m35 * m35 < m08) {
    const m33 = m02 - m16 - m21 - m35 * m04;
  }
  if (m33 * m33 < m14) {
    const m34 = m00 - m18 - m22 - m35 * m30;
  }
  if (m34 * m34 < m12) {
    return true;
  }
  m35 = (m02 - m26 + m21 + m15) / m07;
  if (m35 * m35 < m11) {
    const m33 = m00 + m22 + m17 - m35 * m31;
  }
  if (m33 * m33 < m12) {
    const m34 = m01 + m23 + m19 - m35 * m06;
  }
  if (m34 * m34 < m13) {
    return true;
  }
  m35 = (m02 + m26 + m21 + m15) / m07;
  if (m35 * m35 < m11) {
    const m33 = m00 + m22 + m17 - m35 * m31;
  }
  if (m33 * m33 < m12) {
    const m34 = m01 + m23 + m19 - m35 * m06;
  }
  if (m34 * m34 < m13) {
    return true;
  }
  m35 = (m02 - m26 - m21 + m15) / m07;
  if (m35 * m35 < m11) {
    const m33 = m00 - m22 + m17 - m35 * m31;
  }
  if (m33 * m33 < m12) {
    const m34 = m01 - m23 + m19 - m35 * m06;
  }
  if (m34 * m34 < m13) {
    return true;
  }
  m35 = (m02 + m26 - m21 + m15) / m07;
  if (m35 * m35 < m11) {
    const m33 = m00 - m22 + m17 - m35 * m31;
  }
  if (m33 * m33 < m12) {
    const m34 = m01 - m23 + m19 - m35 * m06;
  }
  if (m34 * m34 < m13) {
    return true;
  }
  m35 = (m02 - m26 + m21 - m15) / m07;
  if (m35 * m35 < m11) {
    const m33 = m00 + m22 - m17 - m35 * m31;
  }
  if (m33 * m33 < m12) {
    const m34 = m01 + m23 - m19 - m35 * m06;
  }
  if (m34 * m34 < m13) {
    return true;
  }
  m35 = (m02 + m26 + m21 - m15) / m07;
  if (m35 * m35 < m11) {
    const m33 = m00 + m22 - m17 - m35 * m31;
  }
  if (m33 * m33 < m12) {
    const m34 = m01 + m23 - m19 - m35 * m06;
  }
  if (m34 * m34 < m13) {
    return true;
  }
  m35 = (m02 - m26 - m21 - m15) / m07;
  if (m35 * m35 < m11) {
    const m33 = m00 - m22 - m17 - m35 * m31;
  }
  if (m33 * m33 < m12) {
    const m34 = m01 - m23 - m19 - m35 * m06;
  }
  if (m34 * m34 < m13) {
    return true;
  }
  m35 = (m02 + m26 - m21 - m15) / m07;
  if (m35 * m35 < m11) {
    const m33 = m00 - m22 - m17 - m35 * m31;
  }
  if (m33 * m33 < m12) {
    const m34 = m01 - m23 - m19 - m35 * m06;
  }
  if (m34 * m34 < m13) {
    return true;
  }
  m35 = (m00 - m24 + m22 + m17) / m31;
  if (m35 * m35 < m11) {
    const m33 = m01 + m23 + m19 - m35 * m06;
  }
  if (m33 * m33 < m13) {
    const m34 = m02 + m21 + m15 - m35 * m07;
  }
  if (m34 * m34 < m14) {
    return true;
  }
  m35 = (m00 + m24 + m22 + m17) / m31;
  if (m35 * m35 < m11) {
    const m33 = m01 + m23 + m19 - m35 * m06;
  }
  if (m33 * m33 < m13) {
    const m34 = m02 + m21 + m15 - m35 * m07;
  }
  if (m34 * m34 < m14) {
    return true;
  }
  m35 = (m00 - m24 - m22 + m17) / m31;
  if (m35 * m35 < m11) {
    const m33 = m01 - m23 + m19 - m35 * m06;
  }
  if (m33 * m33 < m13) {
    const m34 = m02 - m21 + m15 - m35 * m07;
  }
  if (m34 * m34 < m14) {
    return true;
  }
  m35 = (m00 + m24 - m22 + m17) / m31;
  if (m35 * m35 < m11) {
    const m33 = m01 - m23 + m19 - m35 * m06;
  }
  if (m33 * m33 < m13) {
    const m34 = m02 - m21 + m15 - m35 * m07;
  }
  if (m34 * m34 < m14) {
    return true;
  }
  m35 = (m00 - m24 + m22 - m17) / m31;
  if (m35 * m35 < m11) {
    const m33 = m01 + m23 - m19 - m35 * m06;
  }
  if (m33 * m33 < m13) {
    const m34 = m02 + m21 - m15 - m35 * m07;
  }
  if (m34 * m34 < m14) {
    return true;
  }
  m35 = (m00 + m24 + m22 - m17) / m31;
  if (m35 * m35 < m11) {
    const m33 = m01 + m23 - m19 - m35 * m06;
  }
  if (m33 * m33 < m13) {
    const m34 = m02 + m21 - m15 - m35 * m07;
  }
  if (m34 * m34 < m14) {
    return true;
  }
  m35 = (m00 - m24 - m22 - m17) / m31;
  if (m35 * m35 < m11) {
    const m33 = m01 - m23 - m19 - m35 * m06;
  }
  if (m33 * m33 < m13) {
    const m34 = m02 - m21 - m15 - m35 * m07;
  }
  if (m34 * m34 < m14) {
    return true;
  }
  m35 = (m00 + m24 - m22 - m17) / m31;
  if (m35 * m35 < m11) {
    const m33 = m01 - m23 - m19 - m35 * m06;
  }
  if (m33 * m33 < m13) {
    const m34 = m02 - m21 - m15 - m35 * m07;
  }
  if (m34 * m34 < m14) {
    return true;
  }
  m35 = (m01 - m25 + m23 + m19) / m06;
  if (m35 * m35 < m11) {
    const m33 = m02 + m21 + m15 - m35 * m07;
  }
  if (m33 * m33 < m14) {
    const m34 = m00 + m22 + m17 - m35 * m31;
  }
  if (m34 * m34 < m12) {
    return true;
  }
  m35 = (m01 + m25 + m23 + m19) / m06;
  if (m35 * m35 < m11) {
    const m33 = m02 + m21 + m15 - m35 * m07;
  }
  if (m33 * m33 < m14) {
    const m34 = m00 + m22 + m17 - m35 * m31;
  }
  if (m34 * m34 < m12) {
    return true;
  }
  m35 = (m01 - m25 - m23 + m19) / m06;
  if (m35 * m35 < m11) {
    const m33 = m02 - m21 + m15 - m35 * m07;
  }
  if (m33 * m33 < m14) {
    const m34 = m00 - m22 + m17 - m35 * m31;
  }
  if (m34 * m34 < m12) {
    return true;
  }
  m35 = (m01 + m25 - m23 + m19) / m06;
  if (m35 * m35 < m11) {
    const m33 = m02 - m21 + m15 - m35 * m07;
  }
  if (m33 * m33 < m14) {
    const m34 = m00 - m22 + m17 - m35 * m31;
  }
  if (m34 * m34 < m12) {
    return true;
  }
  m35 = (m01 - m25 + m23 - m19) / m06;
  if (m35 * m35 < m11) {
    const m33 = m02 + m21 - m15 - m35 * m07;
  }
  if (m33 * m33 < m14) {
    const m34 = m00 + m22 - m17 - m35 * m31;
  }
  if (m34 * m34 < m12) {
    return true;
  }
  m35 = (m01 + m25 + m23 - m19) / m06;
  if (m35 * m35 < m11) {
    const m33 = m02 + m21 - m15 - m35 * m07;
  }
  if (m33 * m33 < m14) {
    const m34 = m00 + m22 - m17 - m35 * m31;
  }
  if (m34 * m34 < m12) {
    return true;
  }
  m35 = (m01 - m25 - m23 - m19) / m06;
  if (m35 * m35 < m11) {
    const m33 = m02 - m21 - m15 - m35 * m07;
  }
  if (m33 * m33 < m14) {
    const m34 = m00 - m22 - m17 - m35 * m31;
  }
  if (m34 * m34 < m12) {
    return true;
  }
  m35 = (m01 + m25 - m23 - m19) / m06;
  if (m35 * m35 < m11) {
    const m33 = m02 - m21 - m15 - m35 * m07;
  }
  if (m33 * m33 < m14) {
    const m34 = m00 - m22 - m17 - m35 * m31;
  }
  if (m34 * m34 < m12) {
    return true;
  }
  return false;
}

// function CollisionCheck.boxInBox(cframe0: CFrame, size0: vector, cframe1: CFrame, size1: vector): boolean
// 	 let	m00,m01,m02,
// 	m03,m04,m05,
// 	m06,m07,m08,
// 	m09,m10,m11	=components(cframe0)
// 	 let	m12,m13,m14,
// 	m15,m16,m17,
// 	m18,m19,m20,
// 	m21,m22,m23	=components(cframe1)
// 	 let	m24,m25,m26	=size0.x/2,size0.y/2,size0.z/2
// 	 let	m27,m28,m29	=size1.x/2,size1.y/2,size1.z/2
// 	 let	m30,m31,m32	=m12-m00,m13-m01,m14-m02
// 	 let	m00 			=m03*m30+m06*m31+m09*m32
// 	 let	m01 			=m04*m30+m07*m31+m10*m32
// 	 let	m02 			=m05*m30+m08*m31+m11*m32
// 	 let	m12 			=m15*m30+m18*m31+m21*m32
// 	 let	m13 			=m16*m30+m19*m31+m22*m32
// 	 let	m14 			=m17*m30+m20*m31+m23*m32
// 	 let	m30 			=m12>m27 && m12-m27
// 		or m12<-m27 && m12+m27
// 		or 0
// 	 let	m31 			=m13>m28 && m13-m28
// 		or m13<-m28 && m13+m28
// 		or 0
// 	 let	m32 			=m14>m29 && m14-m29
// 		or m14<-m29 && m14+m29
// 		or 0
// 	 let	m33 			=m00>m24 && m00-m24
// 		or m00<-m24 && m00+m24
// 		or 0
// 	 let	m34 			=m01>m25 && m01-m25
// 		or m01<-m25 && m01+m25
// 		or 0
// 	 let	m35 			=m02>m26 && m02-m26
// 		or m02<-m26 && m02+m26
// 		or 0
// 	 let	m36 			=m30*m30+m31*m31+m32*m32
// 	 let	m30 			=m33*m33+m34*m34+m35*m35
// 	 let	m31 			=m24<m25 && (m24<m26 && m24 || m26) || (m25<m26 && m25 || m26) :: number
// 	 let	m32 			=m27<m28 && (m27<m29 && m27 || m29) || (m28<m29 && m28 || m29) :: number
// 	if m36<m31*m31 || m30<m32*m32)
// 		return true
// 	elseif m36>m24*m24+m25*m25+m26*m26 || m30>m27*m27+m28*m28+m29*m29)
// 		return false
// 	else
// 		--LOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOL
// 		--(This is how you tell if something was made by Axis Angle)
// 		 let m30 =m03*m15+m06*m18+m09*m21
// 		 let m31 =m03*m16+m06*m19+m09*m22
// 		 let m32 =m03*m17+m06*m20+m09*m23
// 		 let m03 =m04*m15+m07*m18+m10*m21
// 		 let m06 =m04*m16+m07*m19+m10*m22
// 		 let m09 =m04*m17+m07*m20+m10*m23
// 		 let m04 =m05*m15+m08*m18+m11*m21
// 		 let m07 =m05*m16+m08*m19+m11*m22
// 		 let m10 =m05*m17+m08*m20+m11*m23
// 		 let m05 =m29*m29
// 		 let m08 =m27*m27
// 		 let m11 =m28*m28
// 		 let m15 =m24*m30
// 		 let m16 =m25*m03
// 		 let m17 =m26*m04
// 		 let m18 =m24*m31
// 		 let m19 =m25*m06
// 		 let m20 =m26*m07
// 		 let m21 =m24*m32
// 		 let m22 =m25*m09
// 		 let m23 =m26*m10
// 		 let m33 =m15+m16+m17-m12};if (  m33*m33<m08)  {let m34 =m18+m19+m20-m13};if (  m34*m34<m11)  {let m35 =m21+m22+m23-m14;if (  m35 *m35<m05) {return true};
// 		 let m33 =-m15+m16+m17-m12};if (  m33*m33<m08)  {let m34 =-m18+m19+m20-m13};if (  m34*m34<m11)  {let m35 =-m21+m22+m23-m14;if (  m35 *m35<m05) {return true};
// 		 let m33 =m15-m16+m17-m12};if (  m33*m33<m08)  {let m34 =m18-m19+m20-m13};if (  m34*m34<m11)  {let m35 =m21-m22+m23-m14;if (  m35 *m35<m05) {return true};
// 		 let m33 =-m15-m16+m17-m12};if (  m33*m33<m08)  {let m34 =-m18-m19+m20-m13};if (  m34*m34<m11)  {let m35 =-m21-m22+m23-m14;if (  m35 *m35<m05) {return true};
// 		 let m33 =m15+m16-m17-m12};if (  m33*m33<m08)  {let m34 =m18+m19-m20-m13};if (  m34*m34<m11)  {let m35 =m21+m22-m23-m14;if (  m35 *m35<m05) {return true};
// 		 let m33 =-m15+m16-m17-m12};if (  m33*m33<m08)  {let m34 =-m18+m19-m20-m13};if (  m34*m34<m11)  {let m35 =-m21+m22-m23-m14;if (  m35 *m35<m05) {return true};
// 		 let m33 =m15-m16-m17-m12};if (  m33*m33<m08)  {let m34 =m18-m19-m20-m13};if (  m34*m34<m11)  {let m35 =m21-m22-m23-m14;if (  m35 *m35<m05) {return true};
// 		 let m33 =-m15-m16-m17-m12};if (  m33*m33<m08)  {let m34 =-m18-m19-m20-m13};if (  m34*m34<m11)  {let m35 =-m21-m22-m23-m14;if (  m35 *m35<m05) {return true};
// 		 let m12 =m24*m24
// 		 let m13 =m25*m25
// 		 let m14 =m26*m26
// 		 let m15 =m27*m04
// 		 let m16 =m28*m07
// 		 let m17 =m27*m30
// 		 let m18 =m28*m31
// 		 let m19 =m27*m03
// 		 let m20 =m28*m06
// 		 let m21 =m29*m10
// 		 let m22 =m29*m32
// 		 let m23 =m29*m09
// 		 let m35 =(m02-m26+m15+m16)/m10;if (  m35 *m35<m05)  {let m33 =m00+m17+m18-m35*m32};if (  m33*m33<m12)  {let m34 =m01+m19+m20-m35*m09};if (  m34*m34<m13) {return true};
// 		 let m35 =(m02+m26+m15+m16)/m10;if (  m35 *m35<m05)  {let m33 =m00+m17+m18-m35*m32};if (  m33*m33<m12)  {let m34 =m01+m19+m20-m35*m09};if (  m34*m34<m13) {return true};
// 		 let m35 =(m02-m26-m15+m16)/m10;if (  m35 *m35<m05)  {let m33 =m00-m17+m18-m35*m32};if (  m33*m33<m12)  {let m34 =m01-m19+m20-m35*m09};if (  m34*m34<m13) {return true};
// 		 let m35 =(m02+m26-m15+m16)/m10;if (  m35 *m35<m05)  {let m33 =m00-m17+m18-m35*m32};if (  m33*m33<m12)  {let m34 =m01-m19+m20-m35*m09};if (  m34*m34<m13) {return true};
// 		 let m35 =(m02-m26+m15-m16)/m10;if (  m35 *m35<m05)  {let m33 =m00+m17-m18-m35*m32};if (  m33*m33<m12)  {let m34 =m01+m19-m20-m35*m09};if (  m34*m34<m13) {return true};
// 		 let m35 =(m02+m26+m15-m16)/m10;if (  m35 *m35<m05)  {let m33 =m00+m17-m18-m35*m32};if (  m33*m33<m12)  {let m34 =m01+m19-m20-m35*m09};if (  m34*m34<m13) {return true};
// 		 let m35 =(m02-m26-m15-m16)/m10;if (  m35 *m35<m05)  {let m33 =m00-m17-m18-m35*m32};if (  m33*m33<m12)  {let m34 =m01-m19-m20-m35*m09};if (  m34*m34<m13) {return true};
// 		 let m35 =(m02+m26-m15-m16)/m10;if (  m35 *m35<m05)  {let m33 =m00-m17-m18-m35*m32};if (  m33*m33<m12)  {let m34 =m01-m19-m20-m35*m09};if (  m34*m34<m13) {return true};
// 		 let m35 =(m00-m24+m17+m18)/m32;if (  m35 *m35<m05)  {let m33 =m01+m19+m20-m35*m09};if (  m33*m33<m13)  {let m34 =m02+m15+m16-m35*m10};if (  m34*m34<m14) {return true};
// 		 let m35 =(m00+m24+m17+m18)/m32;if (  m35 *m35<m05)  {let m33 =m01+m19+m20-m35*m09};if (  m33*m33<m13)  {let m34 =m02+m15+m16-m35*m10};if (  m34*m34<m14) {return true};
// 		 let m35 =(m00-m24-m17+m18)/m32;if (  m35 *m35<m05)  {let m33 =m01-m19+m20-m35*m09};if (  m33*m33<m13)  {let m34 =m02-m15+m16-m35*m10};if (  m34*m34<m14) {return true};
// 		 let m35 =(m00+m24-m17+m18)/m32;if (  m35 *m35<m05)  {let m33 =m01-m19+m20-m35*m09};if (  m33*m33<m13)  {let m34 =m02-m15+m16-m35*m10};if (  m34*m34<m14) {return true};
// 		 let m35 =(m00-m24+m17-m18)/m32;if (  m35 *m35<m05)  {let m33 =m01+m19-m20-m35*m09};if (  m33*m33<m13)  {let m34 =m02+m15-m16-m35*m10};if (  m34*m34<m14) {return true};
// 		 let m35 =(m00+m24+m17-m18)/m32;if (  m35 *m35<m05)  {let m33 =m01+m19-m20-m35*m09};if (  m33*m33<m13)  {let m34 =m02+m15-m16-m35*m10};if (  m34*m34<m14) {return true};
// 		 let m35 =(m00-m24-m17-m18)/m32;if (  m35 *m35<m05)  {let m33 =m01-m19-m20-m35*m09};if (  m33*m33<m13)  {let m34 =m02-m15-m16-m35*m10};if (  m34*m34<m14) {return true};
// 		 let m35 =(m00+m24-m17-m18)/m32;if (  m35 *m35<m05)  {let m33 =m01-m19-m20-m35*m09};if (  m33*m33<m13)  {let m34 =m02-m15-m16-m35*m10};if (  m34*m34<m14) {return true};
// 		 let m35 =(m01-m25+m19+m20)/m09;if (  m35 *m35<m05)  {let m33 =m02+m15+m16-m35*m10};if (  m33*m33<m14)  {let m34 =m00+m17+m18-m35*m32};if (  m34*m34<m12) {return true};
// 		 let m35 =(m01+m25+m19+m20)/m09;if (  m35 *m35<m05)  {let m33 =m02+m15+m16-m35*m10};if (  m33*m33<m14)  {let m34 =m00+m17+m18-m35*m32};if (  m34*m34<m12) {return true};
// 		 let m35 =(m01-m25-m19+m20)/m09;if (  m35 *m35<m05)  {let m33 =m02-m15+m16-m35*m10};if (  m33*m33<m14)  {let m34 =m00-m17+m18-m35*m32};if (  m34*m34<m12) {return true};
// 		 let m35 =(m01+m25-m19+m20)/m09;if (  m35 *m35<m05)  {let m33 =m02-m15+m16-m35*m10};if (  m33*m33<m14)  {let m34 =m00-m17+m18-m35*m32};if (  m34*m34<m12) {return true};
// 		 let m35 =(m01-m25+m19-m20)/m09;if (  m35 *m35<m05)  {let m33 =m02+m15-m16-m35*m10};if (  m33*m33<m14)  {let m34 =m00+m17-m18-m35*m32};if (  m34*m34<m12) {return true};
// 		 let m35 =(m01+m25+m19-m20)/m09;if (  m35 *m35<m05)  {let m33 =m02+m15-m16-m35*m10};if (  m33*m33<m14)  {let m34 =m00+m17-m18-m35*m32};if (  m34*m34<m12) {return true};
// 		 let m35 =(m01-m25-m19-m20)/m09;if (  m35 *m35<m05)  {let m33 =m02-m15-m16-m35*m10};if (  m33*m33<m14)  {let m34 =m00-m17-m18-m35*m32};if (  m34*m34<m12) {return true};
// 		 let m35 =(m01+m25-m19-m20)/m09;if (  m35 *m35<m05)  {let m33 =m02-m15-m16-m35*m10};if (  m33*m33<m14)  {let m34 =m00-m17-m18-m35*m32};if (  m34*m34<m12) {return true};
// 		 let m35 =(m02-m26+m16+m21)/m04;if (  m35 *m35<m08)  {let m33 =m00+m18+m22-m35*m30};if (  m33*m33<m12)  {let m34 =m01+m20+m23-m35*m03};if (  m34*m34<m13) {return true};
// 		 let m35 =(m02+m26+m16+m21)/m04;if (  m35 *m35<m08)  {let m33 =m00+m18+m22-m35*m30};if (  m33*m33<m12)  {let m34 =m01+m20+m23-m35*m03};if (  m34*m34<m13) {return true};
// 		 let m35 =(m02-m26-m16+m21)/m04;if (  m35 *m35<m08)  {let m33 =m00-m18+m22-m35*m30};if (  m33*m33<m12)  {let m34 =m01-m20+m23-m35*m03};if (  m34*m34<m13) {return true};
// 		 let m35 =(m02+m26-m16+m21)/m04;if (  m35 *m35<m08)  {let m33 =m00-m18+m22-m35*m30};if (  m33*m33<m12)  {let m34 =m01-m20+m23-m35*m03};if (  m34*m34<m13) {return true};
// 		 let m35 =(m02-m26+m16-m21)/m04;if (  m35 *m35<m08)  {let m33 =m00+m18-m22-m35*m30};if (  m33*m33<m12)  {let Axi =m01+m20-m23-m35*m03};if (  Axi*Axi<m13) {return true};
// 		 let m35 =(m02+m26+m16-m21)/m04;if (  m35 *m35<m08)  {let m33 =m00+m18-m22-m35*m30};if (  m33*m33<m12)  {let sAn =m01+m20-m23-m35*m03};if (  sAn*sAn<m13) {return true};
// 		 let m35 =(m02-m26-m16-m21)/m04;if (  m35 *m35<m08)  {let m33 =m00-m18-m22-m35*m30};if (  m33*m33<m12)  {let gle =m01-m20-m23-m35*m03};if (  gle*gle<m13) {return true};
// 		 let m35 =(m02+m26-m16-m21)/m04;if (  m35 *m35<m08)  {let m33 =m00-m18-m22-m35*m30};if (  m33*m33<m12)  {let m34 =m01-m20-m23-m35*m03};if (  m34*m34<m13) {return true};
// 		 let m35 =(m00-m24+m18+m22)/m30;if (  m35 *m35<m08)  {let m33 =m01+m20+m23-m35*m03};if (  m33*m33<m13)  {let m34 =m02+m16+m21-m35*m04};if (  m34*m34<m14) {return true};
// 		 let m35 =(m00+m24+m18+m22)/m30;if (  m35 *m35<m08)  {let m33 =m01+m20+m23-m35*m03};if (  m33*m33<m13)  {let m34 =m02+m16+m21-m35*m04};if (  m34*m34<m14) {return true};
// 		 let m35 =(m00-m24-m18+m22)/m30;if (  m35 *m35<m08)  {let m33 =m01-m20+m23-m35*m03};if (  m33*m33<m13)  {let m34 =m02-m16+m21-m35*m04};if (  m34*m34<m14) {return true};
// 		 let m35 =(m00+m24-m18+m22)/m30;if (  m35 *m35<m08)  {let m33 =m01-m20+m23-m35*m03};if (  m33*m33<m13)  {let m34 =m02-m16+m21-m35*m04};if (  m34*m34<m14) {return true};
// 		 let m35 =(m00-m24+m18-m22)/m30;if (  m35 *m35<m08)  {let m33 =m01+m20-m23-m35*m03};if (  m33*m33<m13)  {let m34 =m02+m16-m21-m35*m04};if (  m34*m34<m14) {return true};
// 		 let m35 =(m00+m24+m18-m22)/m30;if (  m35 *m35<m08)  {let m33 =m01+m20-m23-m35*m03};if (  m33*m33<m13)  {let m34 =m02+m16-m21-m35*m04};if (  m34*m34<m14) {return true};
// 		 let m35 =(m00-m24-m18-m22)/m30;if (  m35 *m35<m08)  {let m33 =m01-m20-m23-m35*m03};if (  m33*m33<m13)  {let m34 =m02-m16-m21-m35*m04};if (  m34*m34<m14) {return true};
// 		 let m35 =(m00+m24-m18-m22)/m30;if (  m35 *m35<m08)  {let m33 =m01-m20-m23-m35*m03};if (  m33*m33<m13)  {let m34 =m02-m16-m21-m35*m04};if (  m34*m34<m14) {return true};
// 		 let m35 =(m01-m25+m20+m23)/m03;if (  m35 *m35<m08)  {let m33 =m02+m16+m21-m35*m04};if (  m33*m33<m14)  {let m34 =m00+m18+m22-m35*m30};if (  m34*m34<m12) {return true};
// 		 let m35 =(m01+m25+m20+m23)/m03;if (  m35 *m35<m08)  {let m33 =m02+m16+m21-m35*m04};if (  m33*m33<m14)  {let m34 =m00+m18+m22-m35*m30};if (  m34*m34<m12) {return true};
// 		 let m35 =(m01-m25-m20+m23)/m03;if (  m35 *m35<m08)  {let m33 =m02-m16+m21-m35*m04};if (  m33*m33<m14)  {let m34 =m00-m18+m22-m35*m30};if (  m34*m34<m12) {return true};
// 		 let m35 =(m01+m25-m20+m23)/m03;if (  m35 *m35<m08)  {let m33 =m02-m16+m21-m35*m04};if (  m33*m33<m14)  {let m34 =m00-m18+m22-m35*m30};if (  m34*m34<m12) {return true};
// 		 let m35 =(m01-m25+m20-m23)/m03;if (  m35 *m35<m08)  {let m33 =m02+m16-m21-m35*m04};if (  m33*m33<m14)  {let m34 =m00+m18-m22-m35*m30};if (  m34*m34<m12) {return true};
// 		 let m35 =(m01+m25+m20-m23)/m03;if (  m35 *m35<m08)  {let m33 =m02+m16-m21-m35*m04};if (  m33*m33<m14)  {let m34 =m00+m18-m22-m35*m30};if (  m34*m34<m12) {return true};
// 		 let m35 =(m01-m25-m20-m23)/m03;if (  m35 *m35<m08)  {let m33 =m02-m16-m21-m35*m04};if (  m33*m33<m14)  {let m34 =m00-m18-m22-m35*m30};if (  m34*m34<m12) {return true};
// 		 let m35 =(m01+m25-m20-m23)/m03;if (  m35 *m35<m08)  {let m33 =m02-m16-m21-m35*m04};if (  m33*m33<m14)  {let m34 =m00-m18-m22-m35*m30};if (  m34*m34<m12) {return true};
// 		 let m35 =(m02-m26+m21+m15)/m07;if (  m35 *m35<m11)  {let m33 =m00+m22+m17-m35*m31};if (  m33*m33<m12)  {let m34 =m01+m23+m19-m35*m06};if (  m34*m34<m13) {return true};
// 		 let m35 =(m02+m26+m21+m15)/m07;if (  m35 *m35<m11)  {let m33 =m00+m22+m17-m35*m31};if (  m33*m33<m12)  {let m34 =m01+m23+m19-m35*m06};if (  m34*m34<m13) {return true};
// 		 let m35 =(m02-m26-m21+m15)/m07;if (  m35 *m35<m11)  {let m33 =m00-m22+m17-m35*m31};if (  m33*m33<m12)  {let m34 =m01-m23+m19-m35*m06};if (  m34*m34<m13) {return true};
// 		 let m35 =(m02+m26-m21+m15)/m07;if (  m35 *m35<m11)  {let m33 =m00-m22+m17-m35*m31};if (  m33*m33<m12)  {let m34 =m01-m23+m19-m35*m06};if (  m34*m34<m13) {return true};
// 		 let m35 =(m02-m26+m21-m15)/m07;if (  m35 *m35<m11)  {let m33 =m00+m22-m17-m35*m31};if (  m33*m33<m12)  {let m34 =m01+m23-m19-m35*m06};if (  m34*m34<m13) {return true};
// 		 let m35 =(m02+m26+m21-m15)/m07;if (  m35 *m35<m11)  {let m33 =m00+m22-m17-m35*m31};if (  m33*m33<m12)  {let m34 =m01+m23-m19-m35*m06};if (  m34*m34<m13) {return true};
// 		 let m35 =(m02-m26-m21-m15)/m07;if (  m35 *m35<m11)  {let m33 =m00-m22-m17-m35*m31};if (  m33*m33<m12)  {let m34 =m01-m23-m19-m35*m06};if (  m34*m34<m13) {return true};
// 		 let m35 =(m02+m26-m21-m15)/m07;if (  m35 *m35<m11)  {let m33 =m00-m22-m17-m35*m31};if (  m33*m33<m12)  {let m34 =m01-m23-m19-m35*m06};if (  m34*m34<m13) {return true};
// 		 let m35 =(m00-m24+m22+m17)/m31;if (  m35 *m35<m11)  {let m33 =m01+m23+m19-m35*m06};if (  m33*m33<m13)  {let m34 =m02+m21+m15-m35*m07};if (  m34*m34<m14) {return true};
// 		 let m35 =(m00+m24+m22+m17)/m31;if (  m35 *m35<m11)  {let m33 =m01+m23+m19-m35*m06};if (  m33*m33<m13)  {let m34 =m02+m21+m15-m35*m07};if (  m34*m34<m14) {return true};
// 		 let m35 =(m00-m24-m22+m17)/m31;if (  m35 *m35<m11)  {let m33 =m01-m23+m19-m35*m06};if (  m33*m33<m13)  {let m34 =m02-m21+m15-m35*m07};if (  m34*m34<m14) {return true};
// 		 let m35 =(m00+m24-m22+m17)/m31;if (  m35 *m35<m11)  {let m33 =m01-m23+m19-m35*m06};if (  m33*m33<m13)  {let m34 =m02-m21+m15-m35*m07};if (  m34*m34<m14) {return true};
// 		 let m35 =(m00-m24+m22-m17)/m31;if (  m35 *m35<m11)  {let m33 =m01+m23-m19-m35*m06};if (  m33*m33<m13)  {let m34 =m02+m21-m15-m35*m07};if (  m34*m34<m14) {return true};
// 		 let m35 =(m00+m24+m22-m17)/m31;if (  m35 *m35<m11)  {let m33 =m01+m23-m19-m35*m06};if (  m33*m33<m13)  {let m34 =m02+m21-m15-m35*m07};if (  m34*m34<m14) {return true};
// 		 let m35 =(m00-m24-m22-m17)/m31;if (  m35 *m35<m11)  {let m33 =m01-m23-m19-m35*m06};if (  m33*m33<m13)  {let m34 =m02-m21-m15-m35*m07};if (  m34*m34<m14) {return true};
// 		 let m35 =(m00+m24-m22-m17)/m31;if (  m35 *m35<m11)  {let m33 =m01-m23-m19-m35*m06};if (  m33*m33<m13)  {let m34 =m02-m21-m15-m35*m07};if (  m34*m34<m14) {return true};
// 		 let m35 =(m01-m25+m23+m19)/m06;if (  m35 *m35<m11)  {let m33 =m02+m21+m15-m35*m07};if (  m33*m33<m14)  {let m34 =m00+m22+m17-m35*m31};if (  m34*m34<m12) {return true};
// 		 let m35 =(m01+m25+m23+m19)/m06;if (  m35 *m35<m11)  {let m33 =m02+m21+m15-m35*m07};if (  m33*m33<m14)  {let m34 =m00+m22+m17-m35*m31};if (  m34*m34<m12) {return true};
// 		 let m35 =(m01-m25-m23+m19)/m06;if (  m35 *m35<m11)  {let m33 =m02-m21+m15-m35*m07};if (  m33*m33<m14)  {let m34 =m00-m22+m17-m35*m31};if (  m34*m34<m12) {return true};
// 		 let m35 =(m01+m25-m23+m19)/m06;if (  m35 *m35<m11)  {let m33 =m02-m21+m15-m35*m07};if (  m33*m33<m14)  {let m34 =m00-m22+m17-m35*m31};if (  m34*m34<m12) {return true};
// 		 let m35 =(m01-m25+m23-m19)/m06;if (  m35 *m35<m11)  {let m33 =m02+m21-m15-m35*m07};if (  m33*m33<m14)  {let m34 =m00+m22-m17-m35*m31};if (  m34*m34<m12) {return true};
// 		 let m35 =(m01+m25+m23-m19)/m06;if (  m35 *m35<m11)  {let m33 =m02+m21-m15-m35*m07};if (  m33*m33<m14)  {let m34 =m00+m22-m17-m35*m31};if (  m34*m34<m12) {return true};
// 		 let m35 =(m01-m25-m23-m19)/m06;if (  m35 *m35<m11)  {let m33 =m02-m21-m15-m35*m07};if (  m33*m33<m14)  {let m34 =m00-m22-m17-m35*m31};if (  m34*m34<m12) {return true};
// 		 let m35 =(m01+m25-m23-m19)/m06;if (  m35 *m35<m11)  {let m33 =m02-m21-m15-m35*m07};if (  m33*m33<m14)  {let m34 =m00-m22-m17-m35*m31};if (  m34*m34<m12) {return true};
// 		return false
// 	end
// end

// export default {};
