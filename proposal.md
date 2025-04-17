# CS30 Major Project    
  
## Description  
Voxel destruction physics for Roblox, written in TypeScript, using Octrees to subdivide parts and partition space.  
  
## Needs To Have  
- Octrees for spatial partitioning in the Broad Phase   
- Part OBBs approximated into bounding spheres/cylinders when inside of the Octree for cheaper broad phase checks
- Performant collision detection method in the Narrow Phase
- Octrees for part subdivision after Narrow Phase
- Certain physics attributes disabled on 'irrelevant' parts to aid performance


  
## Nice To Have
- Buffer usage to compress data and send it to the client efficiently
- Cache parts ahead of time instead of creating a new part for each destruction\
- Parts referenced without using the actual instance (?)
- Loose Octree implementation (Or another spatial partitioning algorithm suitable for mostly static OBBs)
- Custom part replication
- Pseudo Greedy Meshing (mesh nearby parts of the same size)
- Cutting out parts applies physics to the cutout
