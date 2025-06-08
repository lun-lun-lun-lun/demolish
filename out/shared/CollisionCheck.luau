--!native
--!optimize 2
-- Compiled with roblox-ts v3.0.0
--by doing --!native, the code is transpiled to C++ and runs faster (but uses more memory)
--using !optimize 2 is just doing the same optimizations the rolbox would do in a live game
--original calculations are from AxisAngle in 2015, i only translated from lua to typescript
--const pointToObjectSpace = emptyCFrame.PointToObjectSpace;
local function CylinderInCylinder(position0, height0, radius0, position1, height1, radius1)
	local halfHeight0 = height0 / 2
	local halfHeight1 = height1 / 2
	local cylinder0Min = position0.y - halfHeight0
	local cylinder0Max = position0.y + halfHeight0
	local cylinder1Min = position1.y - halfHeight1
	local cylinder1Max = position1.y + halfHeight1
	if cylinder0Min > cylinder1Max or cylinder0Max < cylinder1Min then
		return false
	end
	local distX = position1.x - position0.x
	local distZ = position1.z - position0.z
	local radiusSum = radius0 + radius1
	--is the distance bigger than our radius*, discounting the y
	if distX * distX + distZ * distZ > radiusSum * radiusSum then
		return false
	end
	return true
end
local function boxInSphere(cframe0, size0, position1, radius1)
	local relative = cframe0:PointToObjectSpace(position1)
	local sizeX = size0.x / 2
	local sizeY = size0.x / 2
	local sizeZ = size0.z / 2
	local relX = relative.X
	local relY = relative.Y
	local relZ = relative.Z
	--very ugly to look at unfortunately
	local distX = if relX > sizeX then relX - sizeX elseif relX < -sizeX then relX + sizeX else 0
	local distY = if relY > sizeY then relY - sizeY elseif relY < -sizeY then relY + sizeY else 0
	local distZ = if relZ > sizeZ then relZ - sizeZ elseif relZ < -sizeZ then relZ + sizeZ else 0
	return distX * distX + distY * distY + distZ * distZ < radius1 * radius1
end
local function sphereInSphere(position0, radius0, position1, radius1)
	--is the distance between our positions bigger than our radius?
	local magnitude = math.sqrt((bit32.bxor((position1.x - position0.x), 2)) + (bit32.bxor((position1.y - position0.y), 2)) + (bit32.bxor((position1.z - position0.z), 2)))
	return magnitude < radius0 + radius1
end
local function pointInBox(cframe0, size0, position1)
	--todo
	local relative = cframe0:PointToObjectSpace(position1)
	local sizeX = size0.x / 2
	local sizeY = size0.x / 2
	local sizeZ = size0.z / 2
	local relX = relative.X
	local relY = relative.Y
	local relZ = relative.Z
	--very ugly to look at unfortunately
	local distX = if relX > sizeX then relX - sizeX elseif relX < -sizeX then relX + sizeX else 0
	local distY = if relY > sizeY then relY - sizeY elseif relY < -sizeY then relY + sizeY else 0
	local distZ = if relZ > sizeZ then relZ - sizeZ elseif relZ < -sizeZ then relZ + sizeZ else 0
	return distX * distX + distY * distY + distZ * distZ < 1
end
local function boxInBox(cframe0, size0, cframe1, size1)
	local m00, m01, m02, m03, m04, m05, m06, m07, m08, m09, m10, m11 = cframe0:GetComponents()
	local m12, m13, m14, m15, m16, m17, m18, m19, m20, m21, m22, m23 = cframe1:GetComponents()
	local m24, m25, m26 = size0.x / 2, size0.y / 2, size0.z / 2
	local m27, m28, m29 = size1.x / 2, size1.y / 2, size1.z / 2
	local m30, m31, m32 = m12 - m00, m13 - m01, m14 - m02
	m00 = m03 * m30 + m06 * m31 + m09 * m32
	m01 = m04 * m30 + m07 * m31 + m10 * m32
	m12 = m15 * m30 + m18 * m31 + m21 * m32
	m13 = m16 * m30 + m19 * m31 + m22 * m32
	m14 = m17 * m30 + m20 * m31 + m23 * m32
	m30 = if m12 > m27 then m12 - m27 elseif m12 < -m27 then m12 + m27 else 0
	m31 = if m13 > m28 then m13 - m28 elseif m13 < -m28 then m13 + m28 else 0
	m32 = if m14 > m29 then m14 - m29 elseif m14 < -m29 then m14 + m29 else 0
	local m33 = if m00 > m24 then m00 - m24 elseif m00 < -m24 then m00 + m24 else 0
	local m34 = if m01 > m25 then m01 - m25 elseif m01 < -m25 then m01 + m25 else 0
	local m35 = if m02 > m26 then m02 - m26 elseif m02 < -m26 then m02 + m26 else 0
	local m36 = m30 * m30 + m31 * m31 + m32 * m32
	m30 = m33 * m33 + m34 * m34 + m35 * m35
	m31 = if m24 < m25 then (if m24 < m26 then m24 else m26) elseif m25 < m26 then m25 else m26
	m32 = if m27 < m28 then (if m27 < m29 then m27 else m29) elseif m28 < m29 then m28 else m29
	--for context, the guy that wrote the original code is an actual genius mathematician. i have no idea what any of these calculations signify or how they work.
	--i asked the dude who showed me this and he doesn't know either. its faster than the built in roblox methods, and established algorithms like GJK and EPA
	--i dont think we'll ever know what goes on inside AxisAngle's head.
	if m36 < m31 * m31 or m30 < m32 * m32 then
		return true
	elseif m36 > m24 * m24 + m25 * m25 + m26 * m26 or m30 > m27 * m27 + m28 * m28 + m29 * m29 then
		return false
	else
		m30 = m03 * m15 + m06 * m18 + m09 * m21
		m31 = m03 * m16 + m06 * m19 + m09 * m22
		m32 = m03 * m17 + m06 * m20 + m09 * m23
		m03 = m04 * m15 + m07 * m18 + m10 * m21
		m06 = m04 * m16 + m07 * m19 + m10 * m22
		m09 = m04 * m17 + m07 * m20 + m10 * m23
		m04 = m05 * m15 + m08 * m18 + m11 * m21
		m07 = m05 * m16 + m08 * m19 + m11 * m22
		m10 = m05 * m17 + m08 * m20 + m11 * m23
		m05 = m29 * m29
		m08 = m27 * m27
		m11 = m28 * m28
		m15 = m24 * m30
		m16 = m25 * m03
		m17 = m26 * m04
		m18 = m24 * m31
		m19 = m25 * m06
		m20 = m26 * m07
		m21 = m24 * m32
		m22 = m25 * m09
		m23 = m26 * m10
		m33 = m15 + m16 + m17 - m12
		if m33 * m33 < m08 then
			local m34 = m18 + m19 + m20 - m13
		end
		if m34 * m34 < m11 then
			local m35 = m21 + m22 + m23 - m14
		end
		if m35 * m35 < m05 then
			return true
		end
		m33 = -m15 + m16 + m17 - m12
		if m33 * m33 < m08 then
			m34 = -m18 + m19 + m20 - m13
		end
		if m34 * m34 < m11 then
			m35 = -m21 + m22 + m23 - m14
		end
		if m35 * m35 < m05 then
			return true
		end
		m33 = m15 - m16 + m17 - m12
		if m33 * m33 < m08 then
			m34 = m18 - m19 + m20 - m13
		end
		if m34 * m34 < m11 then
			local m35 = m21 - m22 + m23 - m14
		end
		if m35 * m35 < m05 then
			return true
		end
		m33 = -m15 - m16 + m17 - m12
		if m33 * m33 < m08 then
			m34 = -m18 - m19 + m20 - m13
		end
		if m34 * m34 < m11 then
			local m35 = -m21 - m22 + m23 - m14
		end
		if m35 * m35 < m05 then
			return true
		end
		m33 = m15 + m16 - m17 - m12
		if m33 * m33 < m08 then
			m34 = m18 + m19 - m20 - m13
		end
		if m34 * m34 < m11 then
			local m35 = m21 + m22 - m23 - m14
		end
		if m35 * m35 < m05 then
			return true
		end
		m33 = -m15 + m16 - m17 - m12
		if m33 * m33 < m08 then
			m34 = -m18 + m19 - m20 - m13
		end
		if m34 * m34 < m11 then
			local m35 = -m21 + m22 - m23 - m14
		end
		if m35 * m35 < m05 then
			return true
		end
		m33 = m15 - m16 - m17 - m12
		if m33 * m33 < m08 then
			m34 = m18 - m19 - m20 - m13
		end
		if m34 * m34 < m11 then
			local m35 = m21 - m22 - m23 - m14
		end
		if m35 * m35 < m05 then
			return true
		end
		m33 = -m15 - m16 - m17 - m12
		if m33 * m33 < m08 then
			m34 = -m18 - m19 - m20 - m13
		end
		if m34 * m34 < m11 then
			local m35 = -m21 - m22 - m23 - m14
		end
		if m35 * m35 < m05 then
			return true
		end
	end
	m12 = m24 * m24
	m13 = m25 * m25
	m14 = m26 * m26
	m15 = m27 * m04
	m16 = m28 * m07
	m17 = m27 * m30
	m18 = m28 * m31
	m19 = m27 * m03
	m20 = m28 * m06
	m21 = m29 * m10
	m22 = m29 * m32
	m23 = m29 * m09
	-- 	elseif m36>m24*m24+m25*m25+m26*m26 || m30>m27*m27+m28*m28+m29*m29)
	-- 		return false
	-- 	else
	-- 		--LOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOL
	-- 		--(This is how you tell if something was made by Axis Angle)
	-- 		 let m33 =m15+m16+m17-m12};if (  m33*m33<m08)  {let m34 =m18+m19+m20-m13};if (  m34*m34<m11)  {let m35 =m21+m22+m23-m14;if (  m35 *m35<m05) {return true};
	-- 		 let m33 =-m15+m16+m17-m12};if (  m33*m33<m08)  {let m34 =-m18+m19+m20-m13};if (  m34*m34<m11)  {let m35 =-m21+m22+m23-m14;if (  m35 *m35<m05) {return true};
	-- 		 let m33 =m15-m16+m17-m12};if (  m33*m33<m08)  {let m34 =m18-m19+m20-m13};if (  m34*m34<m11)  {let m35 =m21-m22+m23-m14;if (  m35 *m35<m05) {return true};
	-- 		 let m33 =-m15-m16+m17-m12};if (  m33*m33<m08)  {let m34 =-m18-m19+m20-m13};if (  m34*m34<m11)  {let m35 =-m21-m22+m23-m14;if (  m35 *m35<m05) {return true};
	-- 		 let m33 =m15+m16-m17-m12};if (  m33*m33<m08)  {let m34 =m18+m19-m20-m13};if (  m34*m34<m11)  {let m35 =m21+m22-m23-m14;if (  m35 *m35<m05) {return true};
	-- 		 let m33 =-m15+m16-m17-m12};if (  m33*m33<m08)  {let m34 =-m18+m19-m20-m13};if (  m34*m34<m11)  {let m35 =-m21+m22-m23-m14;if (  m35 *m35<m05) {return true};
	-- 		 let m33 =m15-m16-m17-m12};if (  m33*m33<m08)  {let m34 =m18-m19-m20-m13};if (  m34*m34<m11)  {let m35 =m21-m22-m23-m14;if (  m35 *m35<m05) {return true};
	-- 		 let m33 =-m15-m16-m17-m12};if (  m33*m33<m08)  {let m34 =-m18-m19-m20-m13};if (  m34*m34<m11)  {let m35 =-m21-m22-m23-m14;if (  m35 *m35<m05) {return true};
	-- 		 let m12 =m24*m24
	-- 		 let m13 =m25*m25
	-- 		 let m14 =m26*m26
	-- 		 let m15 =m27*m04
	-- 		 let m16 =m28*m07
	-- 		 let m17 =m27*m30
	-- 		 let m18 =m28*m31
	-- 		 let m19 =m27*m03
	-- 		 let m20 =m28*m06
	-- 		 let m21 =m29*m10
	-- 		 let m22 =m29*m32
	-- 		 let m23 =m29*m09
	m35 = (m02 - m26 + m15 + m16) / m10
	if m35 * m35 < m05 then
		local m33 = m00 + m17 + m18 - m35 * m32
	end
	if m33 * m33 < m12 then
		local m34 = m01 + m19 + m20 - m35 * m09
	end
	if m34 * m34 < m13 then
		return true
	end
	m35 = (m02 + m26 + m15 + m16) / m10
	if m35 * m35 < m05 then
		local m33 = m00 + m17 + m18 - m35 * m32
	end
	if m33 * m33 < m12 then
		local m34 = m01 + m19 + m20 - m35 * m09
	end
	if m34 * m34 < m13 then
		return true
	end
	m35 = (m02 - m26 - m15 + m16) / m10
	if m35 * m35 < m05 then
		local m33 = m00 - m17 + m18 - m35 * m32
	end
	if m33 * m33 < m12 then
		local m34 = m01 - m19 + m20 - m35 * m09
	end
	if m34 * m34 < m13 then
		return true
	end
	m35 = (m02 + m26 - m15 + m16) / m10
	if m35 * m35 < m05 then
		local m33 = m00 - m17 + m18 - m35 * m32
	end
	if m33 * m33 < m12 then
		local m34 = m01 - m19 + m20 - m35 * m09
	end
	if m34 * m34 < m13 then
		return true
	end
	m35 = (m02 - m26 + m15 - m16) / m10
	if m35 * m35 < m05 then
		local m33 = m00 + m17 - m18 - m35 * m32
	end
	if m33 * m33 < m12 then
		local m34 = m01 + m19 - m20 - m35 * m09
	end
	if m34 * m34 < m13 then
		return true
	end
	m35 = (m02 + m26 + m15 - m16) / m10
	if m35 * m35 < m05 then
		local m33 = m00 + m17 - m18 - m35 * m32
	end
	if m33 * m33 < m12 then
		local m34 = m01 + m19 - m20 - m35 * m09
	end
	if m34 * m34 < m13 then
		return true
	end
	m35 = (m02 - m26 - m15 - m16) / m10
	if m35 * m35 < m05 then
		local m33 = m00 - m17 - m18 - m35 * m32
	end
	if m33 * m33 < m12 then
		local m34 = m01 - m19 - m20 - m35 * m09
	end
	if m34 * m34 < m13 then
		return true
	end
	m35 = (m02 + m26 - m15 - m16) / m10
	if m35 * m35 < m05 then
		local m33 = m00 - m17 - m18 - m35 * m32
	end
	if m33 * m33 < m12 then
		local m34 = m01 - m19 - m20 - m35 * m09
	end
	if m34 * m34 < m13 then
		return true
	end
	m35 = (m00 - m24 + m17 + m18) / m32
	if m35 * m35 < m05 then
		local m33 = m01 + m19 + m20 - m35 * m09
	end
	if m33 * m33 < m13 then
		local m34 = m02 + m15 + m16 - m35 * m10
	end
	if m34 * m34 < m14 then
		return true
	end
	m35 = (m00 + m24 + m17 + m18) / m32
	if m35 * m35 < m05 then
		local m33 = m01 + m19 + m20 - m35 * m09
	end
	if m33 * m33 < m13 then
		local m34 = m02 + m15 + m16 - m35 * m10
	end
	if m34 * m34 < m14 then
		return true
	end
	m35 = (m00 - m24 - m17 + m18) / m32
	if m35 * m35 < m05 then
		local m33 = m01 - m19 + m20 - m35 * m09
	end
	if m33 * m33 < m13 then
		local m34 = m02 - m15 + m16 - m35 * m10
	end
	if m34 * m34 < m14 then
		return true
	end
	m35 = (m00 + m24 - m17 + m18) / m32
	if m35 * m35 < m05 then
		local m33 = m01 - m19 + m20 - m35 * m09
	end
	if m33 * m33 < m13 then
		local m34 = m02 - m15 + m16 - m35 * m10
	end
	if m34 * m34 < m14 then
		return true
	end
	m35 = (m00 - m24 + m17 - m18) / m32
	if m35 * m35 < m05 then
		local m33 = m01 + m19 - m20 - m35 * m09
	end
	if m33 * m33 < m13 then
		local m34 = m02 + m15 - m16 - m35 * m10
	end
	if m34 * m34 < m14 then
		return true
	end
	m35 = (m00 + m24 + m17 - m18) / m32
	if m35 * m35 < m05 then
		local m33 = m01 + m19 - m20 - m35 * m09
	end
	if m33 * m33 < m13 then
		local m34 = m02 + m15 - m16 - m35 * m10
	end
	if m34 * m34 < m14 then
		return true
	end
	m35 = (m00 - m24 - m17 - m18) / m32
	if m35 * m35 < m05 then
		local m33 = m01 - m19 - m20 - m35 * m09
	end
	if m33 * m33 < m13 then
		local m34 = m02 - m15 - m16 - m35 * m10
	end
	if m34 * m34 < m14 then
		return true
	end
	m35 = (m00 + m24 - m17 - m18) / m32
	if m35 * m35 < m05 then
		local m33 = m01 - m19 - m20 - m35 * m09
	end
	if m33 * m33 < m13 then
		local m34 = m02 - m15 - m16 - m35 * m10
	end
	if m34 * m34 < m14 then
		return true
	end
	m35 = (m01 - m25 + m19 + m20) / m09
	if m35 * m35 < m05 then
		local m33 = m02 + m15 + m16 - m35 * m10
	end
	if m33 * m33 < m14 then
		local m34 = m00 + m17 + m18 - m35 * m32
	end
	if m34 * m34 < m12 then
		return true
	end
	m35 = (m01 + m25 + m19 + m20) / m09
	if m35 * m35 < m05 then
		local m33 = m02 + m15 + m16 - m35 * m10
	end
	if m33 * m33 < m14 then
		local m34 = m00 + m17 + m18 - m35 * m32
	end
	if m34 * m34 < m12 then
		return true
	end
	m35 = (m01 - m25 - m19 + m20) / m09
	if m35 * m35 < m05 then
		local m33 = m02 - m15 + m16 - m35 * m10
	end
	if m33 * m33 < m14 then
		local m34 = m00 - m17 + m18 - m35 * m32
	end
	if m34 * m34 < m12 then
		return true
	end
	m35 = (m01 + m25 - m19 + m20) / m09
	if m35 * m35 < m05 then
		local m33 = m02 - m15 + m16 - m35 * m10
	end
	if m33 * m33 < m14 then
		local m34 = m00 - m17 + m18 - m35 * m32
	end
	if m34 * m34 < m12 then
		return true
	end
	m35 = (m01 - m25 + m19 - m20) / m09
	if m35 * m35 < m05 then
		local m33 = m02 + m15 - m16 - m35 * m10
	end
	if m33 * m33 < m14 then
		local m34 = m00 + m17 - m18 - m35 * m32
	end
	if m34 * m34 < m12 then
		return true
	end
	m35 = (m01 + m25 + m19 - m20) / m09
	if m35 * m35 < m05 then
		local m33 = m02 + m15 - m16 - m35 * m10
	end
	if m33 * m33 < m14 then
		local m34 = m00 + m17 - m18 - m35 * m32
	end
	if m34 * m34 < m12 then
		return true
	end
	m35 = (m01 - m25 - m19 - m20) / m09
	if m35 * m35 < m05 then
		local m33 = m02 - m15 - m16 - m35 * m10
	end
	if m33 * m33 < m14 then
		local m34 = m00 - m17 - m18 - m35 * m32
	end
	if m34 * m34 < m12 then
		return true
	end
	m35 = (m01 + m25 - m19 - m20) / m09
	if m35 * m35 < m05 then
		local m33 = m02 - m15 - m16 - m35 * m10
	end
	if m33 * m33 < m14 then
		local m34 = m00 - m17 - m18 - m35 * m32
	end
	if m34 * m34 < m12 then
		return true
	end
	m35 = (m02 - m26 + m16 + m21) / m04
	if m35 * m35 < m08 then
		local m33 = m00 + m18 + m22 - m35 * m30
	end
	if m33 * m33 < m12 then
		local m34 = m01 + m20 + m23 - m35 * m03
	end
	if m34 * m34 < m13 then
		return true
	end
	m35 = (m02 + m26 + m16 + m21) / m04
	if m35 * m35 < m08 then
		local m33 = m00 + m18 + m22 - m35 * m30
	end
	if m33 * m33 < m12 then
		local m34 = m01 + m20 + m23 - m35 * m03
	end
	if m34 * m34 < m13 then
		return true
	end
	m35 = (m02 - m26 - m16 + m21) / m04
	if m35 * m35 < m08 then
		local m33 = m00 - m18 + m22 - m35 * m30
	end
	if m33 * m33 < m12 then
		local m34 = m01 - m20 + m23 - m35 * m03
	end
	if m34 * m34 < m13 then
		return true
	end
	m35 = (m02 + m26 - m16 + m21) / m04
	if m35 * m35 < m08 then
		local m33 = m00 - m18 + m22 - m35 * m30
	end
	if m33 * m33 < m12 then
		local m34 = m01 - m20 + m23 - m35 * m03
	end
	if m34 * m34 < m13 then
		return true
	end
	m35 = (m02 - m26 + m16 - m21) / m04
	if m35 * m35 < m08 then
		local m33 = m00 + m18 - m22 - m35 * m30
	end
	if m33 * m33 < m12 then
		local Axi = m01 + m20 - m23 - m35 * m03
		if Axi * Axi < m13 then
			return true
		end
	end
	m35 = (m02 + m26 + m16 - m21) / m04
	if m35 * m35 < m08 then
		local m33 = m00 + m18 - m22 - m35 * m30
	end
	if m33 * m33 < m12 then
		local sAn = m01 + m20 - m23 - m35 * m03
		if sAn * sAn < m13 then
			return true
		end
	end
	m35 = (m02 - m26 - m16 - m21) / m04
	if m35 * m35 < m08 then
		local m33 = m00 - m18 - m22 - m35 * m30
	end
	if m33 * m33 < m12 then
		local gle = m01 - m20 - m23 - m35 * m03
		if gle * gle < m13 then
			return true
		end
	end
	m35 = (m02 + m26 - m16 - m21) / m04
	if m35 * m35 < m08 then
		local m33 = m00 - m18 - m22 - m35 * m30
	end
	if m33 * m33 < m12 then
		local m34 = m01 - m20 - m23 - m35 * m03
	end
	if m34 * m34 < m13 then
		return true
	end
	m35 = (m00 - m24 + m18 + m22) / m30
	if m35 * m35 < m08 then
		local m33 = m01 + m20 + m23 - m35 * m03
	end
	if m33 * m33 < m13 then
		local m34 = m02 + m16 + m21 - m35 * m04
	end
	if m34 * m34 < m14 then
		return true
	end
	m35 = (m00 + m24 + m18 + m22) / m30
	if m35 * m35 < m08 then
		local m33 = m01 + m20 + m23 - m35 * m03
	end
	if m33 * m33 < m13 then
		local m34 = m02 + m16 + m21 - m35 * m04
	end
	if m34 * m34 < m14 then
		return true
	end
	m35 = (m00 - m24 - m18 + m22) / m30
	if m35 * m35 < m08 then
		local m33 = m01 - m20 + m23 - m35 * m03
	end
	if m33 * m33 < m13 then
		local m34 = m02 - m16 + m21 - m35 * m04
	end
	if m34 * m34 < m14 then
		return true
	end
	m35 = (m00 + m24 - m18 + m22) / m30
	if m35 * m35 < m08 then
		local m33 = m01 - m20 + m23 - m35 * m03
	end
	if m33 * m33 < m13 then
		local m34 = m02 - m16 + m21 - m35 * m04
	end
	if m34 * m34 < m14 then
		return true
	end
	m35 = (m00 - m24 + m18 - m22) / m30
	if m35 * m35 < m08 then
		local m33 = m01 + m20 - m23 - m35 * m03
	end
	if m33 * m33 < m13 then
		local m34 = m02 + m16 - m21 - m35 * m04
	end
	if m34 * m34 < m14 then
		return true
	end
	m35 = (m00 + m24 + m18 - m22) / m30
	if m35 * m35 < m08 then
		local m33 = m01 + m20 - m23 - m35 * m03
	end
	if m33 * m33 < m13 then
		local m34 = m02 + m16 - m21 - m35 * m04
	end
	if m34 * m34 < m14 then
		return true
	end
	m35 = (m00 - m24 - m18 - m22) / m30
	if m35 * m35 < m08 then
		local m33 = m01 - m20 - m23 - m35 * m03
	end
	if m33 * m33 < m13 then
		local m34 = m02 - m16 - m21 - m35 * m04
	end
	if m34 * m34 < m14 then
		return true
	end
	m35 = (m00 + m24 - m18 - m22) / m30
	if m35 * m35 < m08 then
		local m33 = m01 - m20 - m23 - m35 * m03
	end
	if m33 * m33 < m13 then
		local m34 = m02 - m16 - m21 - m35 * m04
	end
	if m34 * m34 < m14 then
		return true
	end
	m35 = (m01 - m25 + m20 + m23) / m03
	if m35 * m35 < m08 then
		local m33 = m02 + m16 + m21 - m35 * m04
	end
	if m33 * m33 < m14 then
		local m34 = m00 + m18 + m22 - m35 * m30
	end
	if m34 * m34 < m12 then
		return true
	end
	m35 = (m01 + m25 + m20 + m23) / m03
	if m35 * m35 < m08 then
		local m33 = m02 + m16 + m21 - m35 * m04
	end
	if m33 * m33 < m14 then
		local m34 = m00 + m18 + m22 - m35 * m30
	end
	if m34 * m34 < m12 then
		return true
	end
	m35 = (m01 - m25 - m20 + m23) / m03
	if m35 * m35 < m08 then
		local m33 = m02 - m16 + m21 - m35 * m04
	end
	if m33 * m33 < m14 then
		local m34 = m00 - m18 + m22 - m35 * m30
	end
	if m34 * m34 < m12 then
		return true
	end
	m35 = (m01 + m25 - m20 + m23) / m03
	if m35 * m35 < m08 then
		local m33 = m02 - m16 + m21 - m35 * m04
	end
	if m33 * m33 < m14 then
		local m34 = m00 - m18 + m22 - m35 * m30
	end
	if m34 * m34 < m12 then
		return true
	end
	m35 = (m01 - m25 + m20 - m23) / m03
	if m35 * m35 < m08 then
		local m33 = m02 + m16 - m21 - m35 * m04
	end
	if m33 * m33 < m14 then
		local m34 = m00 + m18 - m22 - m35 * m30
	end
	if m34 * m34 < m12 then
		return true
	end
	m35 = (m01 + m25 + m20 - m23) / m03
	if m35 * m35 < m08 then
		local m33 = m02 + m16 - m21 - m35 * m04
	end
	if m33 * m33 < m14 then
		local m34 = m00 + m18 - m22 - m35 * m30
	end
	if m34 * m34 < m12 then
		return true
	end
	m35 = (m01 - m25 - m20 - m23) / m03
	if m35 * m35 < m08 then
		local m33 = m02 - m16 - m21 - m35 * m04
	end
	if m33 * m33 < m14 then
		local m34 = m00 - m18 - m22 - m35 * m30
	end
	if m34 * m34 < m12 then
		return true
	end
	m35 = (m01 + m25 - m20 - m23) / m03
	if m35 * m35 < m08 then
		local m33 = m02 - m16 - m21 - m35 * m04
	end
	if m33 * m33 < m14 then
		local m34 = m00 - m18 - m22 - m35 * m30
	end
	if m34 * m34 < m12 then
		return true
	end
	m35 = (m02 - m26 + m21 + m15) / m07
	if m35 * m35 < m11 then
		local m33 = m00 + m22 + m17 - m35 * m31
	end
	if m33 * m33 < m12 then
		local m34 = m01 + m23 + m19 - m35 * m06
	end
	if m34 * m34 < m13 then
		return true
	end
	m35 = (m02 + m26 + m21 + m15) / m07
	if m35 * m35 < m11 then
		local m33 = m00 + m22 + m17 - m35 * m31
	end
	if m33 * m33 < m12 then
		local m34 = m01 + m23 + m19 - m35 * m06
	end
	if m34 * m34 < m13 then
		return true
	end
	m35 = (m02 - m26 - m21 + m15) / m07
	if m35 * m35 < m11 then
		local m33 = m00 - m22 + m17 - m35 * m31
	end
	if m33 * m33 < m12 then
		local m34 = m01 - m23 + m19 - m35 * m06
	end
	if m34 * m34 < m13 then
		return true
	end
	m35 = (m02 + m26 - m21 + m15) / m07
	if m35 * m35 < m11 then
		local m33 = m00 - m22 + m17 - m35 * m31
	end
	if m33 * m33 < m12 then
		local m34 = m01 - m23 + m19 - m35 * m06
	end
	if m34 * m34 < m13 then
		return true
	end
	m35 = (m02 - m26 + m21 - m15) / m07
	if m35 * m35 < m11 then
		local m33 = m00 + m22 - m17 - m35 * m31
	end
	if m33 * m33 < m12 then
		local m34 = m01 + m23 - m19 - m35 * m06
	end
	if m34 * m34 < m13 then
		return true
	end
	m35 = (m02 + m26 + m21 - m15) / m07
	if m35 * m35 < m11 then
		local m33 = m00 + m22 - m17 - m35 * m31
	end
	if m33 * m33 < m12 then
		local m34 = m01 + m23 - m19 - m35 * m06
	end
	if m34 * m34 < m13 then
		return true
	end
	m35 = (m02 - m26 - m21 - m15) / m07
	if m35 * m35 < m11 then
		local m33 = m00 - m22 - m17 - m35 * m31
	end
	if m33 * m33 < m12 then
		local m34 = m01 - m23 - m19 - m35 * m06
	end
	if m34 * m34 < m13 then
		return true
	end
	m35 = (m02 + m26 - m21 - m15) / m07
	if m35 * m35 < m11 then
		local m33 = m00 - m22 - m17 - m35 * m31
	end
	if m33 * m33 < m12 then
		local m34 = m01 - m23 - m19 - m35 * m06
	end
	if m34 * m34 < m13 then
		return true
	end
	m35 = (m00 - m24 + m22 + m17) / m31
	if m35 * m35 < m11 then
		local m33 = m01 + m23 + m19 - m35 * m06
	end
	if m33 * m33 < m13 then
		local m34 = m02 + m21 + m15 - m35 * m07
	end
	if m34 * m34 < m14 then
		return true
	end
	m35 = (m00 + m24 + m22 + m17) / m31
	if m35 * m35 < m11 then
		local m33 = m01 + m23 + m19 - m35 * m06
	end
	if m33 * m33 < m13 then
		local m34 = m02 + m21 + m15 - m35 * m07
	end
	if m34 * m34 < m14 then
		return true
	end
	m35 = (m00 - m24 - m22 + m17) / m31
	if m35 * m35 < m11 then
		local m33 = m01 - m23 + m19 - m35 * m06
	end
	if m33 * m33 < m13 then
		local m34 = m02 - m21 + m15 - m35 * m07
	end
	if m34 * m34 < m14 then
		return true
	end
	m35 = (m00 + m24 - m22 + m17) / m31
	if m35 * m35 < m11 then
		local m33 = m01 - m23 + m19 - m35 * m06
	end
	if m33 * m33 < m13 then
		local m34 = m02 - m21 + m15 - m35 * m07
	end
	if m34 * m34 < m14 then
		return true
	end
	m35 = (m00 - m24 + m22 - m17) / m31
	if m35 * m35 < m11 then
		local m33 = m01 + m23 - m19 - m35 * m06
	end
	if m33 * m33 < m13 then
		local m34 = m02 + m21 - m15 - m35 * m07
	end
	if m34 * m34 < m14 then
		return true
	end
	m35 = (m00 + m24 + m22 - m17) / m31
	if m35 * m35 < m11 then
		local m33 = m01 + m23 - m19 - m35 * m06
	end
	if m33 * m33 < m13 then
		local m34 = m02 + m21 - m15 - m35 * m07
	end
	if m34 * m34 < m14 then
		return true
	end
	m35 = (m00 - m24 - m22 - m17) / m31
	if m35 * m35 < m11 then
		local m33 = m01 - m23 - m19 - m35 * m06
	end
	if m33 * m33 < m13 then
		local m34 = m02 - m21 - m15 - m35 * m07
	end
	if m34 * m34 < m14 then
		return true
	end
	m35 = (m00 + m24 - m22 - m17) / m31
	if m35 * m35 < m11 then
		local m33 = m01 - m23 - m19 - m35 * m06
	end
	if m33 * m33 < m13 then
		local m34 = m02 - m21 - m15 - m35 * m07
	end
	if m34 * m34 < m14 then
		return true
	end
	m35 = (m01 - m25 + m23 + m19) / m06
	if m35 * m35 < m11 then
		local m33 = m02 + m21 + m15 - m35 * m07
	end
	if m33 * m33 < m14 then
		local m34 = m00 + m22 + m17 - m35 * m31
	end
	if m34 * m34 < m12 then
		return true
	end
	m35 = (m01 + m25 + m23 + m19) / m06
	if m35 * m35 < m11 then
		local m33 = m02 + m21 + m15 - m35 * m07
	end
	if m33 * m33 < m14 then
		local m34 = m00 + m22 + m17 - m35 * m31
	end
	if m34 * m34 < m12 then
		return true
	end
	m35 = (m01 - m25 - m23 + m19) / m06
	if m35 * m35 < m11 then
		local m33 = m02 - m21 + m15 - m35 * m07
	end
	if m33 * m33 < m14 then
		local m34 = m00 - m22 + m17 - m35 * m31
	end
	if m34 * m34 < m12 then
		return true
	end
	m35 = (m01 + m25 - m23 + m19) / m06
	if m35 * m35 < m11 then
		local m33 = m02 - m21 + m15 - m35 * m07
	end
	if m33 * m33 < m14 then
		local m34 = m00 - m22 + m17 - m35 * m31
	end
	if m34 * m34 < m12 then
		return true
	end
	m35 = (m01 - m25 + m23 - m19) / m06
	if m35 * m35 < m11 then
		local m33 = m02 + m21 - m15 - m35 * m07
	end
	if m33 * m33 < m14 then
		local m34 = m00 + m22 - m17 - m35 * m31
	end
	if m34 * m34 < m12 then
		return true
	end
	m35 = (m01 + m25 + m23 - m19) / m06
	if m35 * m35 < m11 then
		local m33 = m02 + m21 - m15 - m35 * m07
	end
	if m33 * m33 < m14 then
		local m34 = m00 + m22 - m17 - m35 * m31
	end
	if m34 * m34 < m12 then
		return true
	end
	m35 = (m01 - m25 - m23 - m19) / m06
	if m35 * m35 < m11 then
		local m33 = m02 - m21 - m15 - m35 * m07
	end
	if m33 * m33 < m14 then
		local m34 = m00 - m22 - m17 - m35 * m31
	end
	if m34 * m34 < m12 then
		return true
	end
	m35 = (m01 + m25 - m23 - m19) / m06
	if m35 * m35 < m11 then
		local m33 = m02 - m21 - m15 - m35 * m07
	end
	if m33 * m33 < m14 then
		local m34 = m00 - m22 - m17 - m35 * m31
	end
	if m34 * m34 < m12 then
		return true
	end
	return false
end
-- function CollisionCheck.boxInBox(cframe0: CFrame, size0: vector, cframe1: CFrame, size1: vector): boolean
-- 	 let	m00,m01,m02,
-- 	m03,m04,m05,
-- 	m06,m07,m08,
-- 	m09,m10,m11	=components(cframe0)
-- 	 let	m12,m13,m14,
-- 	m15,m16,m17,
-- 	m18,m19,m20,
-- 	m21,m22,m23	=components(cframe1)
-- 	 let	m24,m25,m26	=size0.x/2,size0.y/2,size0.z/2
-- 	 let	m27,m28,m29	=size1.x/2,size1.y/2,size1.z/2
-- 	 let	m30,m31,m32	=m12-m00,m13-m01,m14-m02
-- 	 let	m00 			=m03*m30+m06*m31+m09*m32
-- 	 let	m01 			=m04*m30+m07*m31+m10*m32
-- 	 let	m02 			=m05*m30+m08*m31+m11*m32
-- 	 let	m12 			=m15*m30+m18*m31+m21*m32
-- 	 let	m13 			=m16*m30+m19*m31+m22*m32
-- 	 let	m14 			=m17*m30+m20*m31+m23*m32
-- 	 let	m30 			=m12>m27 && m12-m27
-- 		or m12<-m27 && m12+m27
-- 		or 0
-- 	 let	m31 			=m13>m28 && m13-m28
-- 		or m13<-m28 && m13+m28
-- 		or 0
-- 	 let	m32 			=m14>m29 && m14-m29
-- 		or m14<-m29 && m14+m29
-- 		or 0
-- 	 let	m33 			=m00>m24 && m00-m24
-- 		or m00<-m24 && m00+m24
-- 		or 0
-- 	 let	m34 			=m01>m25 && m01-m25
-- 		or m01<-m25 && m01+m25
-- 		or 0
-- 	 let	m35 			=m02>m26 && m02-m26
-- 		or m02<-m26 && m02+m26
-- 		or 0
-- 	 let	m36 			=m30*m30+m31*m31+m32*m32
-- 	 let	m30 			=m33*m33+m34*m34+m35*m35
-- 	 let	m31 			=m24<m25 && (m24<m26 && m24 || m26) || (m25<m26 && m25 || m26) :: number
-- 	 let	m32 			=m27<m28 && (m27<m29 && m27 || m29) || (m28<m29 && m28 || m29) :: number
-- 	if m36<m31*m31 || m30<m32*m32)
-- 		return true
-- 	elseif m36>m24*m24+m25*m25+m26*m26 || m30>m27*m27+m28*m28+m29*m29)
-- 		return false
-- 	else
-- 		--LOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOL
-- 		--(This is how you tell if something was made by Axis Angle)
-- 		 let m30 =m03*m15+m06*m18+m09*m21
-- 		 let m31 =m03*m16+m06*m19+m09*m22
-- 		 let m32 =m03*m17+m06*m20+m09*m23
-- 		 let m03 =m04*m15+m07*m18+m10*m21
-- 		 let m06 =m04*m16+m07*m19+m10*m22
-- 		 let m09 =m04*m17+m07*m20+m10*m23
-- 		 let m04 =m05*m15+m08*m18+m11*m21
-- 		 let m07 =m05*m16+m08*m19+m11*m22
-- 		 let m10 =m05*m17+m08*m20+m11*m23
-- 		 let m05 =m29*m29
-- 		 let m08 =m27*m27
-- 		 let m11 =m28*m28
-- 		 let m15 =m24*m30
-- 		 let m16 =m25*m03
-- 		 let m17 =m26*m04
-- 		 let m18 =m24*m31
-- 		 let m19 =m25*m06
-- 		 let m20 =m26*m07
-- 		 let m21 =m24*m32
-- 		 let m22 =m25*m09
-- 		 let m23 =m26*m10
-- 		 let m33 =m15+m16+m17-m12};if (  m33*m33<m08)  {let m34 =m18+m19+m20-m13};if (  m34*m34<m11)  {let m35 =m21+m22+m23-m14;if (  m35 *m35<m05) {return true};
-- 		 let m33 =-m15+m16+m17-m12};if (  m33*m33<m08)  {let m34 =-m18+m19+m20-m13};if (  m34*m34<m11)  {let m35 =-m21+m22+m23-m14;if (  m35 *m35<m05) {return true};
-- 		 let m33 =m15-m16+m17-m12};if (  m33*m33<m08)  {let m34 =m18-m19+m20-m13};if (  m34*m34<m11)  {let m35 =m21-m22+m23-m14;if (  m35 *m35<m05) {return true};
-- 		 let m33 =-m15-m16+m17-m12};if (  m33*m33<m08)  {let m34 =-m18-m19+m20-m13};if (  m34*m34<m11)  {let m35 =-m21-m22+m23-m14;if (  m35 *m35<m05) {return true};
-- 		 let m33 =m15+m16-m17-m12};if (  m33*m33<m08)  {let m34 =m18+m19-m20-m13};if (  m34*m34<m11)  {let m35 =m21+m22-m23-m14;if (  m35 *m35<m05) {return true};
-- 		 let m33 =-m15+m16-m17-m12};if (  m33*m33<m08)  {let m34 =-m18+m19-m20-m13};if (  m34*m34<m11)  {let m35 =-m21+m22-m23-m14;if (  m35 *m35<m05) {return true};
-- 		 let m33 =m15-m16-m17-m12};if (  m33*m33<m08)  {let m34 =m18-m19-m20-m13};if (  m34*m34<m11)  {let m35 =m21-m22-m23-m14;if (  m35 *m35<m05) {return true};
-- 		 let m33 =-m15-m16-m17-m12};if (  m33*m33<m08)  {let m34 =-m18-m19-m20-m13};if (  m34*m34<m11)  {let m35 =-m21-m22-m23-m14;if (  m35 *m35<m05) {return true};
-- 		 let m12 =m24*m24
-- 		 let m13 =m25*m25
-- 		 let m14 =m26*m26
-- 		 let m15 =m27*m04
-- 		 let m16 =m28*m07
-- 		 let m17 =m27*m30
-- 		 let m18 =m28*m31
-- 		 let m19 =m27*m03
-- 		 let m20 =m28*m06
-- 		 let m21 =m29*m10
-- 		 let m22 =m29*m32
-- 		 let m23 =m29*m09
-- 		 let m35 =(m02-m26+m15+m16)/m10;if (  m35 *m35<m05)  {let m33 =m00+m17+m18-m35*m32};if (  m33*m33<m12)  {let m34 =m01+m19+m20-m35*m09};if (  m34*m34<m13) {return true};
-- 		 let m35 =(m02+m26+m15+m16)/m10;if (  m35 *m35<m05)  {let m33 =m00+m17+m18-m35*m32};if (  m33*m33<m12)  {let m34 =m01+m19+m20-m35*m09};if (  m34*m34<m13) {return true};
-- 		 let m35 =(m02-m26-m15+m16)/m10;if (  m35 *m35<m05)  {let m33 =m00-m17+m18-m35*m32};if (  m33*m33<m12)  {let m34 =m01-m19+m20-m35*m09};if (  m34*m34<m13) {return true};
-- 		 let m35 =(m02+m26-m15+m16)/m10;if (  m35 *m35<m05)  {let m33 =m00-m17+m18-m35*m32};if (  m33*m33<m12)  {let m34 =m01-m19+m20-m35*m09};if (  m34*m34<m13) {return true};
-- 		 let m35 =(m02-m26+m15-m16)/m10;if (  m35 *m35<m05)  {let m33 =m00+m17-m18-m35*m32};if (  m33*m33<m12)  {let m34 =m01+m19-m20-m35*m09};if (  m34*m34<m13) {return true};
-- 		 let m35 =(m02+m26+m15-m16)/m10;if (  m35 *m35<m05)  {let m33 =m00+m17-m18-m35*m32};if (  m33*m33<m12)  {let m34 =m01+m19-m20-m35*m09};if (  m34*m34<m13) {return true};
-- 		 let m35 =(m02-m26-m15-m16)/m10;if (  m35 *m35<m05)  {let m33 =m00-m17-m18-m35*m32};if (  m33*m33<m12)  {let m34 =m01-m19-m20-m35*m09};if (  m34*m34<m13) {return true};
-- 		 let m35 =(m02+m26-m15-m16)/m10;if (  m35 *m35<m05)  {let m33 =m00-m17-m18-m35*m32};if (  m33*m33<m12)  {let m34 =m01-m19-m20-m35*m09};if (  m34*m34<m13) {return true};
-- 		 let m35 =(m00-m24+m17+m18)/m32;if (  m35 *m35<m05)  {let m33 =m01+m19+m20-m35*m09};if (  m33*m33<m13)  {let m34 =m02+m15+m16-m35*m10};if (  m34*m34<m14) {return true};
-- 		 let m35 =(m00+m24+m17+m18)/m32;if (  m35 *m35<m05)  {let m33 =m01+m19+m20-m35*m09};if (  m33*m33<m13)  {let m34 =m02+m15+m16-m35*m10};if (  m34*m34<m14) {return true};
-- 		 let m35 =(m00-m24-m17+m18)/m32;if (  m35 *m35<m05)  {let m33 =m01-m19+m20-m35*m09};if (  m33*m33<m13)  {let m34 =m02-m15+m16-m35*m10};if (  m34*m34<m14) {return true};
-- 		 let m35 =(m00+m24-m17+m18)/m32;if (  m35 *m35<m05)  {let m33 =m01-m19+m20-m35*m09};if (  m33*m33<m13)  {let m34 =m02-m15+m16-m35*m10};if (  m34*m34<m14) {return true};
-- 		 let m35 =(m00-m24+m17-m18)/m32;if (  m35 *m35<m05)  {let m33 =m01+m19-m20-m35*m09};if (  m33*m33<m13)  {let m34 =m02+m15-m16-m35*m10};if (  m34*m34<m14) {return true};
-- 		 let m35 =(m00+m24+m17-m18)/m32;if (  m35 *m35<m05)  {let m33 =m01+m19-m20-m35*m09};if (  m33*m33<m13)  {let m34 =m02+m15-m16-m35*m10};if (  m34*m34<m14) {return true};
-- 		 let m35 =(m00-m24-m17-m18)/m32;if (  m35 *m35<m05)  {let m33 =m01-m19-m20-m35*m09};if (  m33*m33<m13)  {let m34 =m02-m15-m16-m35*m10};if (  m34*m34<m14) {return true};
-- 		 let m35 =(m00+m24-m17-m18)/m32;if (  m35 *m35<m05)  {let m33 =m01-m19-m20-m35*m09};if (  m33*m33<m13)  {let m34 =m02-m15-m16-m35*m10};if (  m34*m34<m14) {return true};
-- 		 let m35 =(m01-m25+m19+m20)/m09;if (  m35 *m35<m05)  {let m33 =m02+m15+m16-m35*m10};if (  m33*m33<m14)  {let m34 =m00+m17+m18-m35*m32};if (  m34*m34<m12) {return true};
-- 		 let m35 =(m01+m25+m19+m20)/m09;if (  m35 *m35<m05)  {let m33 =m02+m15+m16-m35*m10};if (  m33*m33<m14)  {let m34 =m00+m17+m18-m35*m32};if (  m34*m34<m12) {return true};
-- 		 let m35 =(m01-m25-m19+m20)/m09;if (  m35 *m35<m05)  {let m33 =m02-m15+m16-m35*m10};if (  m33*m33<m14)  {let m34 =m00-m17+m18-m35*m32};if (  m34*m34<m12) {return true};
-- 		 let m35 =(m01+m25-m19+m20)/m09;if (  m35 *m35<m05)  {let m33 =m02-m15+m16-m35*m10};if (  m33*m33<m14)  {let m34 =m00-m17+m18-m35*m32};if (  m34*m34<m12) {return true};
-- 		 let m35 =(m01-m25+m19-m20)/m09;if (  m35 *m35<m05)  {let m33 =m02+m15-m16-m35*m10};if (  m33*m33<m14)  {let m34 =m00+m17-m18-m35*m32};if (  m34*m34<m12) {return true};
-- 		 let m35 =(m01+m25+m19-m20)/m09;if (  m35 *m35<m05)  {let m33 =m02+m15-m16-m35*m10};if (  m33*m33<m14)  {let m34 =m00+m17-m18-m35*m32};if (  m34*m34<m12) {return true};
-- 		 let m35 =(m01-m25-m19-m20)/m09;if (  m35 *m35<m05)  {let m33 =m02-m15-m16-m35*m10};if (  m33*m33<m14)  {let m34 =m00-m17-m18-m35*m32};if (  m34*m34<m12) {return true};
-- 		 let m35 =(m01+m25-m19-m20)/m09;if (  m35 *m35<m05)  {let m33 =m02-m15-m16-m35*m10};if (  m33*m33<m14)  {let m34 =m00-m17-m18-m35*m32};if (  m34*m34<m12) {return true};
-- 		 let m35 =(m02-m26+m16+m21)/m04;if (  m35 *m35<m08)  {let m33 =m00+m18+m22-m35*m30};if (  m33*m33<m12)  {let m34 =m01+m20+m23-m35*m03};if (  m34*m34<m13) {return true};
-- 		 let m35 =(m02+m26+m16+m21)/m04;if (  m35 *m35<m08)  {let m33 =m00+m18+m22-m35*m30};if (  m33*m33<m12)  {let m34 =m01+m20+m23-m35*m03};if (  m34*m34<m13) {return true};
-- 		 let m35 =(m02-m26-m16+m21)/m04;if (  m35 *m35<m08)  {let m33 =m00-m18+m22-m35*m30};if (  m33*m33<m12)  {let m34 =m01-m20+m23-m35*m03};if (  m34*m34<m13) {return true};
-- 		 let m35 =(m02+m26-m16+m21)/m04;if (  m35 *m35<m08)  {let m33 =m00-m18+m22-m35*m30};if (  m33*m33<m12)  {let m34 =m01-m20+m23-m35*m03};if (  m34*m34<m13) {return true};
-- 		 let m35 =(m02-m26+m16-m21)/m04;if (  m35 *m35<m08)  {let m33 =m00+m18-m22-m35*m30};if (  m33*m33<m12)  {let Axi =m01+m20-m23-m35*m03};if (  Axi*Axi<m13) {return true};
-- 		 let m35 =(m02+m26+m16-m21)/m04;if (  m35 *m35<m08)  {let m33 =m00+m18-m22-m35*m30};if (  m33*m33<m12)  {let sAn =m01+m20-m23-m35*m03};if (  sAn*sAn<m13) {return true};
-- 		 let m35 =(m02-m26-m16-m21)/m04;if (  m35 *m35<m08)  {let m33 =m00-m18-m22-m35*m30};if (  m33*m33<m12)  {let gle =m01-m20-m23-m35*m03};if (  gle*gle<m13) {return true};
-- 		 let m35 =(m02+m26-m16-m21)/m04;if (  m35 *m35<m08)  {let m33 =m00-m18-m22-m35*m30};if (  m33*m33<m12)  {let m34 =m01-m20-m23-m35*m03};if (  m34*m34<m13) {return true};
-- 		 let m35 =(m00-m24+m18+m22)/m30;if (  m35 *m35<m08)  {let m33 =m01+m20+m23-m35*m03};if (  m33*m33<m13)  {let m34 =m02+m16+m21-m35*m04};if (  m34*m34<m14) {return true};
-- 		 let m35 =(m00+m24+m18+m22)/m30;if (  m35 *m35<m08)  {let m33 =m01+m20+m23-m35*m03};if (  m33*m33<m13)  {let m34 =m02+m16+m21-m35*m04};if (  m34*m34<m14) {return true};
-- 		 let m35 =(m00-m24-m18+m22)/m30;if (  m35 *m35<m08)  {let m33 =m01-m20+m23-m35*m03};if (  m33*m33<m13)  {let m34 =m02-m16+m21-m35*m04};if (  m34*m34<m14) {return true};
-- 		 let m35 =(m00+m24-m18+m22)/m30;if (  m35 *m35<m08)  {let m33 =m01-m20+m23-m35*m03};if (  m33*m33<m13)  {let m34 =m02-m16+m21-m35*m04};if (  m34*m34<m14) {return true};
-- 		 let m35 =(m00-m24+m18-m22)/m30;if (  m35 *m35<m08)  {let m33 =m01+m20-m23-m35*m03};if (  m33*m33<m13)  {let m34 =m02+m16-m21-m35*m04};if (  m34*m34<m14) {return true};
-- 		 let m35 =(m00+m24+m18-m22)/m30;if (  m35 *m35<m08)  {let m33 =m01+m20-m23-m35*m03};if (  m33*m33<m13)  {let m34 =m02+m16-m21-m35*m04};if (  m34*m34<m14) {return true};
-- 		 let m35 =(m00-m24-m18-m22)/m30;if (  m35 *m35<m08)  {let m33 =m01-m20-m23-m35*m03};if (  m33*m33<m13)  {let m34 =m02-m16-m21-m35*m04};if (  m34*m34<m14) {return true};
-- 		 let m35 =(m00+m24-m18-m22)/m30;if (  m35 *m35<m08)  {let m33 =m01-m20-m23-m35*m03};if (  m33*m33<m13)  {let m34 =m02-m16-m21-m35*m04};if (  m34*m34<m14) {return true};
-- 		 let m35 =(m01-m25+m20+m23)/m03;if (  m35 *m35<m08)  {let m33 =m02+m16+m21-m35*m04};if (  m33*m33<m14)  {let m34 =m00+m18+m22-m35*m30};if (  m34*m34<m12) {return true};
-- 		 let m35 =(m01+m25+m20+m23)/m03;if (  m35 *m35<m08)  {let m33 =m02+m16+m21-m35*m04};if (  m33*m33<m14)  {let m34 =m00+m18+m22-m35*m30};if (  m34*m34<m12) {return true};
-- 		 let m35 =(m01-m25-m20+m23)/m03;if (  m35 *m35<m08)  {let m33 =m02-m16+m21-m35*m04};if (  m33*m33<m14)  {let m34 =m00-m18+m22-m35*m30};if (  m34*m34<m12) {return true};
-- 		 let m35 =(m01+m25-m20+m23)/m03;if (  m35 *m35<m08)  {let m33 =m02-m16+m21-m35*m04};if (  m33*m33<m14)  {let m34 =m00-m18+m22-m35*m30};if (  m34*m34<m12) {return true};
-- 		 let m35 =(m01-m25+m20-m23)/m03;if (  m35 *m35<m08)  {let m33 =m02+m16-m21-m35*m04};if (  m33*m33<m14)  {let m34 =m00+m18-m22-m35*m30};if (  m34*m34<m12) {return true};
-- 		 let m35 =(m01+m25+m20-m23)/m03;if (  m35 *m35<m08)  {let m33 =m02+m16-m21-m35*m04};if (  m33*m33<m14)  {let m34 =m00+m18-m22-m35*m30};if (  m34*m34<m12) {return true};
-- 		 let m35 =(m01-m25-m20-m23)/m03;if (  m35 *m35<m08)  {let m33 =m02-m16-m21-m35*m04};if (  m33*m33<m14)  {let m34 =m00-m18-m22-m35*m30};if (  m34*m34<m12) {return true};
-- 		 let m35 =(m01+m25-m20-m23)/m03;if (  m35 *m35<m08)  {let m33 =m02-m16-m21-m35*m04};if (  m33*m33<m14)  {let m34 =m00-m18-m22-m35*m30};if (  m34*m34<m12) {return true};
-- 		 let m35 =(m02-m26+m21+m15)/m07;if (  m35 *m35<m11)  {let m33 =m00+m22+m17-m35*m31};if (  m33*m33<m12)  {let m34 =m01+m23+m19-m35*m06};if (  m34*m34<m13) {return true};
-- 		 let m35 =(m02+m26+m21+m15)/m07;if (  m35 *m35<m11)  {let m33 =m00+m22+m17-m35*m31};if (  m33*m33<m12)  {let m34 =m01+m23+m19-m35*m06};if (  m34*m34<m13) {return true};
-- 		 let m35 =(m02-m26-m21+m15)/m07;if (  m35 *m35<m11)  {let m33 =m00-m22+m17-m35*m31};if (  m33*m33<m12)  {let m34 =m01-m23+m19-m35*m06};if (  m34*m34<m13) {return true};
-- 		 let m35 =(m02+m26-m21+m15)/m07;if (  m35 *m35<m11)  {let m33 =m00-m22+m17-m35*m31};if (  m33*m33<m12)  {let m34 =m01-m23+m19-m35*m06};if (  m34*m34<m13) {return true};
-- 		 let m35 =(m02-m26+m21-m15)/m07;if (  m35 *m35<m11)  {let m33 =m00+m22-m17-m35*m31};if (  m33*m33<m12)  {let m34 =m01+m23-m19-m35*m06};if (  m34*m34<m13) {return true};
-- 		 let m35 =(m02+m26+m21-m15)/m07;if (  m35 *m35<m11)  {let m33 =m00+m22-m17-m35*m31};if (  m33*m33<m12)  {let m34 =m01+m23-m19-m35*m06};if (  m34*m34<m13) {return true};
-- 		 let m35 =(m02-m26-m21-m15)/m07;if (  m35 *m35<m11)  {let m33 =m00-m22-m17-m35*m31};if (  m33*m33<m12)  {let m34 =m01-m23-m19-m35*m06};if (  m34*m34<m13) {return true};
-- 		 let m35 =(m02+m26-m21-m15)/m07;if (  m35 *m35<m11)  {let m33 =m00-m22-m17-m35*m31};if (  m33*m33<m12)  {let m34 =m01-m23-m19-m35*m06};if (  m34*m34<m13) {return true};
-- 		 let m35 =(m00-m24+m22+m17)/m31;if (  m35 *m35<m11)  {let m33 =m01+m23+m19-m35*m06};if (  m33*m33<m13)  {let m34 =m02+m21+m15-m35*m07};if (  m34*m34<m14) {return true};
-- 		 let m35 =(m00+m24+m22+m17)/m31;if (  m35 *m35<m11)  {let m33 =m01+m23+m19-m35*m06};if (  m33*m33<m13)  {let m34 =m02+m21+m15-m35*m07};if (  m34*m34<m14) {return true};
-- 		 let m35 =(m00-m24-m22+m17)/m31;if (  m35 *m35<m11)  {let m33 =m01-m23+m19-m35*m06};if (  m33*m33<m13)  {let m34 =m02-m21+m15-m35*m07};if (  m34*m34<m14) {return true};
-- 		 let m35 =(m00+m24-m22+m17)/m31;if (  m35 *m35<m11)  {let m33 =m01-m23+m19-m35*m06};if (  m33*m33<m13)  {let m34 =m02-m21+m15-m35*m07};if (  m34*m34<m14) {return true};
-- 		 let m35 =(m00-m24+m22-m17)/m31;if (  m35 *m35<m11)  {let m33 =m01+m23-m19-m35*m06};if (  m33*m33<m13)  {let m34 =m02+m21-m15-m35*m07};if (  m34*m34<m14) {return true};
-- 		 let m35 =(m00+m24+m22-m17)/m31;if (  m35 *m35<m11)  {let m33 =m01+m23-m19-m35*m06};if (  m33*m33<m13)  {let m34 =m02+m21-m15-m35*m07};if (  m34*m34<m14) {return true};
-- 		 let m35 =(m00-m24-m22-m17)/m31;if (  m35 *m35<m11)  {let m33 =m01-m23-m19-m35*m06};if (  m33*m33<m13)  {let m34 =m02-m21-m15-m35*m07};if (  m34*m34<m14) {return true};
-- 		 let m35 =(m00+m24-m22-m17)/m31;if (  m35 *m35<m11)  {let m33 =m01-m23-m19-m35*m06};if (  m33*m33<m13)  {let m34 =m02-m21-m15-m35*m07};if (  m34*m34<m14) {return true};
-- 		 let m35 =(m01-m25+m23+m19)/m06;if (  m35 *m35<m11)  {let m33 =m02+m21+m15-m35*m07};if (  m33*m33<m14)  {let m34 =m00+m22+m17-m35*m31};if (  m34*m34<m12) {return true};
-- 		 let m35 =(m01+m25+m23+m19)/m06;if (  m35 *m35<m11)  {let m33 =m02+m21+m15-m35*m07};if (  m33*m33<m14)  {let m34 =m00+m22+m17-m35*m31};if (  m34*m34<m12) {return true};
-- 		 let m35 =(m01-m25-m23+m19)/m06;if (  m35 *m35<m11)  {let m33 =m02-m21+m15-m35*m07};if (  m33*m33<m14)  {let m34 =m00-m22+m17-m35*m31};if (  m34*m34<m12) {return true};
-- 		 let m35 =(m01+m25-m23+m19)/m06;if (  m35 *m35<m11)  {let m33 =m02-m21+m15-m35*m07};if (  m33*m33<m14)  {let m34 =m00-m22+m17-m35*m31};if (  m34*m34<m12) {return true};
-- 		 let m35 =(m01-m25+m23-m19)/m06;if (  m35 *m35<m11)  {let m33 =m02+m21-m15-m35*m07};if (  m33*m33<m14)  {let m34 =m00+m22-m17-m35*m31};if (  m34*m34<m12) {return true};
-- 		 let m35 =(m01+m25+m23-m19)/m06;if (  m35 *m35<m11)  {let m33 =m02+m21-m15-m35*m07};if (  m33*m33<m14)  {let m34 =m00+m22-m17-m35*m31};if (  m34*m34<m12) {return true};
-- 		 let m35 =(m01-m25-m23-m19)/m06;if (  m35 *m35<m11)  {let m33 =m02-m21-m15-m35*m07};if (  m33*m33<m14)  {let m34 =m00-m22-m17-m35*m31};if (  m34*m34<m12) {return true};
-- 		 let m35 =(m01+m25-m23-m19)/m06;if (  m35 *m35<m11)  {let m33 =m02-m21-m15-m35*m07};if (  m33*m33<m14)  {let m34 =m00-m22-m17-m35*m31};if (  m34*m34<m12) {return true};
-- 		return false
-- 	end
-- end
-- export default {};
return {
	CylinderInCylinder = CylinderInCylinder,
	boxInSphere = boxInSphere,
	sphereInSphere = sphereInSphere,
	pointInBox = pointInBox,
	boxInBox = boxInBox,
}
