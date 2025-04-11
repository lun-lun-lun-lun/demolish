# CS30 Major Project    
  
## Description  
Voxel destruction physics for Roblox, written in TypeScript.    
  
## Needs To Have  
- Octrees for spatial partitioning in the Broad Phase   
- Part OBBs approximated into bounding spheres/cylinders when inside of the Octree for cheaper checks
- Performant collision detection method in the Narrow Phase
- Octrees for part subdivision after Narrow Phase
- Parts referenced without using the actual instance
- Physics disabled on 'irrelevant' parts


  
## Nice To Have (in estimated order of difficulty)
- Buffer usage
- Part pooling on the client to aid performance
- Loose Octree implementation (Or another spatial partitioning algorithm suitable for mostly static OBBs)
- Custom Part replication
- Pseudo Greedy Meshing (mesh nearby parts of the same size)
- Cutting out parts applies physics to the cutout
