import { Asset, AssetSet } from "./data";

export interface AssetGrid {
    move(current: [number, number], delta: [number, number]): Asset | undefined;
}

export function assetGridFromPositions(collection: AssetSet): AssetGrid {
    return {
        move: (current: [number, number], delta: [number, number]) => {
            let x = current[0] + delta[0];
            let y = current[1] + delta[1];
            while (x <= collection.maxX && x >= collection.minX && y <= collection.maxY && y >= collection.minY) {
                if (collection.has(x, y)) {
                    return collection.get(x, y);
                }
                x += delta[0];
                y += delta[1];
            }
        }
    };
}

export function assetGridFromList(width: number, assets: readonly Asset[]): AssetGrid {
    return {
        move: (current: [number, number], delta: [number, number]) => {
            const currentIndex = assets.findIndex(asset => asset.coords[0] === current[0] && asset.coords[1] === current[1]);
            if (typeof currentIndex !== 'number') {
                return undefined;
            }

            const newX = (currentIndex % width) + delta[0];
            const newY = Math.floor(currentIndex / width) + delta[1];

            const newIndex = newY * width + newX;

            return assets[newIndex]
        }
    };
}