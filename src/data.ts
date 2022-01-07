export interface RawAssetJson {
    readonly captured: string;
    readonly assets: RawAsset[];
}

export interface RawAsset {
    readonly id: number;
    readonly name: string;
    readonly description: string;
    readonly token_id: string;
    readonly num_sales: number;
    readonly image_url: string;
    readonly image_preview_url: string;
    readonly image_thumbnail_url: string;

    readonly lastSale: {
        eth_price: string;
        usd_price: string;
    } | null;

    readonly top_bid: number | null;
}

export enum AssetType {
    Male,
    Female,
}

export class Asset {

    public readonly raw: RawAsset;

    public readonly type: AssetType;
    public readonly coords: [number, number];

    public readonly lastSalePrice_eth: number;

    public readonly name: string;

    constructor(raw: RawAsset) {
        this.raw = raw;

        this.name = raw.name;

        this.type = raw.name.startsWith('Male') ? AssetType.Male : AssetType.Female;
        const match = raw.name.match(/\((-?\d+), (-?\d+)\)/);
        if (!match) {
            console.log(raw.name);
            throw new Error('Could not parse asset');
        }
        this.coords = [+match[1], +match[2]];

        this.lastSalePrice_eth = this.raw.lastSale ? +this.raw.lastSale.eth_price : 0;
    }

    public get previewSpriteCssName(): string {
        return (this.type === AssetType.Male ? 'male-sprite' : 'female-sprite') + '-' + this.coords[0].toString().replace('-', 'm') + '-' + this.coords[1].toString().replace('-', 'm')
    }

    public get previewUrl(): string {
        return `/${this.type === AssetType.Male ? 'out-male-previews' : 'out-female-previews'}/${this.coords[0]},${this.coords[1]}.png`
    }
}


export class AssetCollection {

    public readonly male: AssetSet;
    public readonly female: AssetSet;

    constructor(init: readonly Asset[]) {
        const maleAssets = init.filter(x => x.type === AssetType.Male);
        const femaleAssets = init.filter(x => x.type === AssetType.Female);

        this.male = new AssetSet(AssetType.Male, maleAssets);
        this.female = new AssetSet(AssetType.Female, femaleAssets);
    }

    public get(type: AssetType, x: number, y: number): Asset | undefined {
        return (type === AssetType.Female ? this.female : this.male).get(x, y);
    }
}

export class AssetSet {
    private readonly _assets = new Set<Asset>();

    public readonly type: AssetType;

    public readonly maxX: number;
    public readonly minX: number;

    public readonly maxY: number;
    public readonly minY: number;

    constructor(type: AssetType, init: readonly Asset[]) {
        this.type = type;

        for (const asset of init) {
            this._assets.add(asset);
        }

        this.maxX = Math.max(...init.map(x => x.coords[0]));
        this.minX = Math.min(...init.map(x => x.coords[0]));
        this.minY = Math.min(...init.map(x => x.coords[1]));
        this.maxY = Math.max(...init.map(x => x.coords[1]));
    }

    public get assets(): Asset[] {
        return Array.from(this._assets);
    }

    public get(x: number, y: number): Asset | undefined {
        return this.assets.find(asset => {
            return asset.coords[0] === x && asset.coords[1] === y;
        });
    }

    public has(x: number, y: any): boolean {
        return this.assets.some(asset => {
            return asset.coords[0] === x && asset.coords[1] === y;
        });
    }
}

// export class AssetGrid {

//     static fromPositions(set: AssetSet) {

//     }

//     public readonly width: number;
//     public readonly height: number;

// }