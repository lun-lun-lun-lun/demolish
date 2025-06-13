# destruction-physics  
(hopefully optimized) voxel destruction physics for roblox, written in typescript  
    
Open DemoPlace.rbxl and run it to test out the demo. Instructions for beta testers are in the readme script.

## To Do  
- Loose octrees for broad-phase  (DONE)
- AxisAngle magic collision math for narrow-phase (DONE)  
- Octree subdivision for part breakage  (DONE)
- Greedy mesh sub-parts of same size during subdivision (NEXT)
- Physics applied to 'cut-outs' in models, so they seperate (idek how i'll do this one performantly lmao)  
  
## Possible Optimizations:  
- In broad phase, approximate OBBs into a bounding sphere (or cylinder when needed)  (DONE)
- Disable physics and or collisions on 'irrelevant' (unobserved/far away, and small) seperated parts  (DONE)
- Part pooling  (DONE)
- Detect which parts are fully encompassed by destructors, and dont run calcs for them, just hide them (NEXT)