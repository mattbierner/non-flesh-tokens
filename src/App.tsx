import React, { useEffect } from 'react';
import { Flipper } from 'react-flip-toolkit';
import { Collection } from './Collection';
import { Asset, AssetCollection, AssetType, RawAssetJson } from './data';
import { useAppSelector } from './hooks';
import { AppMode, CellSorting, DisplayedData, slice, useDispatch } from './store';

function App() {
    const dispatch = useDispatch();

    // Init
    useEffect(() => {
        const impl = async () => {
            const result = await fetch('./data.json');
            if (result.status === 200) {
                const json: RawAssetJson = await result.json();
                const assets = json.assets.map(raw => new Asset(raw));
                dispatch(slice.actions.didLoad({ assets: assets }))
            }
        }
        impl();
    }, []);

    const state = useAppSelector((state) => state);
    useEffect(() => {
        const handler = (e: KeyboardEvent): void => {
            if (state.mode !== AppMode.Loaded || !state.selected) {
                return;
            }


            const collection = state.selected.type === AssetType.Male ? state.data.male : state.data.female;
            const move = (dx: number, dy: number) => {
                e.preventDefault();

                let x = state.selected!.x + dx;
                let y = state.selected!.y + dy;

                while (x <= collection.maxX && x >= collection.minX && y <= collection.maxY && y >= collection.minY) {
                    if (collection.has(x, y)) {
                        dispatch(slice.actions.didSelectAction({
                            type: state.selected!.type,
                            x: x,
                            y: y
                        }));
                        return;
                    }
                    x += dx;
                    y += dy;
                }
            }

            switch (e.key) {
                case 'ArrowUp':
                    move(0, -1);
                    break;
                case 'ArrowDown':
                    move(0, 1);
                    break;

                case 'ArrowLeft':
                    move(-1, 0);
                    break;
                case 'ArrowRight':
                    move(1, 0);
                    break;
            }
        };
        window.addEventListener('keydown', handler);
        return () => {
            window.removeEventListener('keydown', handler);
        };
    }, [state]);

    switch (state.mode) {
        case AppMode.Loading:
            return (
                <div>Loading</div>
            )

        case AppMode.Loaded:

            let info: DisplayInfo;
            const displayedData = state.displayedData;
            switch (displayedData) {
                case DisplayedData.None:
                    info = { type: DisplayedData.None };
                    break;

                case DisplayedData.Price:
                    const prices = state.data.assets.map(x => x.price);
                    const minPrice = Math.min(...prices);
                    const maxPrice = Math.max(...prices);
                    info = {
                        type: DisplayedData.Price,
                        min: minPrice,
                        max: maxPrice
                    };
                    break;
            }

            const minDimensions = [12, 26] as [number, number];
            return (
                <Flipper flipKey={state.sorting}>

                    <div className="app">
                        <div className='controls'>
                            <select id="cell-sorting" value={state.sorting} onChange={e => {
                                dispatch(slice.actions.changeSorting({ value: event.target.value }))
                            }}>
                                <option value={CellSorting.Position}>Order by Position</option>
                                <option value={CellSorting.PriceHighLow}>Order by Price (high to low)</option>
                            </select>
                        </div>

                        <Collection className='male-grid' title='Male' sorting={state.sorting} collection={state.data.male} displayInfo={info} minDimensions={minDimensions} />

                        <Collection className='female-grid' title='Female' sorting={state.sorting} collection={state.data.female} displayInfo={info} minDimensions={minDimensions} />

                        {state.selected
                            ? <SelectedInfo data={state.data} x={state.selected.x} y={state.selected.y} type={state.selected.type} />
                            : null}
                    </div>
                </Flipper>
            );
    }
}

function SelectedInfo(props: { data: AssetCollection, x: number, y: number, type: AssetType }) {
    const asset = props.data.get(props.type, props.x, props.y)!;
    return (
        <div className='selected-info'>
            <img className='thumbnail' src={asset.raw.image_thumbnail_url} />

            <h2>{props.type === AssetType.Female ? 'Female' : 'Male'} <span>x={props.x}</span>, <span>y={props.y}</span></h2>

            <div>
                <span>Number Sales: {asset.raw.num_sales}</span>

                {asset.raw.lastSale &&
                    <span>Last Sale: {asset.raw.lastSale.eth_price}ETH (${asset.raw.lastSale.usd_price})</span>
                }
            </div>

            <span>{asset.lastSalePrice_eth}</span>
            <a href={`https://opensea.io/assets/0x495f947276749ce646f68ac8c248420045cb7b5e/${asset.raw.token_id}`}>View on Open Sea</a>
        </div>
    );
}

type DisplayInfo =
    { readonly type: DisplayedData.None } |
    {
        readonly type: DisplayedData.Price;
        readonly min: number;
        readonly max: number;
    };

export default App;
