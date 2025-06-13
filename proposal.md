# CS30 Major Project    
  
## Description  
Voxel destruction physics for Roblox, written in TypeScript, using Octrees to subdivide parts and partition space.  
  
## Needs To Have  
- Octrees for spatial partitioning in the Broad Phase  DONE
- Part OBBs approximated into bounding spheres/cylinders when inside of the Octree for cheaper broad phase checks DONE
- BoxInBox, BoxInSphere, and SphereInSphere collision detection method in the Narrow Phase DONE
- Octrees for part subdivision after Narrow Phase DONE
- Certain physics attributes disabled on 'irrelevant' parts to aid performance DONE


  
## Nice To Have
- Buffer usage to compress data and send it to the client efficiently
- Cache parts ahead of time instead of creating a new part for each destruction DONE
- Parts referenced without using the actual instance (?)
- Spherical Octrees for broad phase detection (JUST TRUST ME) DONE
- Custom part replication
- Pseudo Greedy Meshing (mesh nearby parts of the same size)
- Cutting out parts applies physics to the cutout
