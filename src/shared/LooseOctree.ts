import { Workspace } from "@rbxts/services";

class LooseOctree {
	x = 0;
	y = 0;
	z = 0;
	constructor({ x, y, z }: { x: number; y: number; z: number }) {
		this.x = x;
		this.y = y;
		this.z = z;
	}
}

export function Create() {
	//do sum
}
export default {
	create: Create,
};
