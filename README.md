# destruction-physics  
(hopefully optimized) voxel destruction physics for roblox, written in typescript  
  
## To Do  
- Loose octrees for broad-phase  
- AxisAngle magic collision math for narrow-phase  
- Octree subdivision for part breakage  
- Greedy mesh sub-parts of same size during subdivision  
- Custom part replication  
- Physics applied to 'cut-outs' in models, so they seperate (idek how i'll do this one performantly lmao)  
  
## Possible Optimizations:  
- Greedy mesh touching parts of the same size as subdivisions are calculated  
- In broad phase, approximate OBBs into a bounding sphere (or cylinder when needed)  
- Disable physics and or collisions on 'irrelevant' (unobserved/far away, and small) seperated parts  
- Part pooling  
- Store part info as a reference  
- Use buffers ig  
