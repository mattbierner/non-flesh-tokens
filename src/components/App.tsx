import React, { useEffect } from 'react';
import { Flipper } from 'react-flip-toolkit';
import { Asset, AssetType, RawAssetJson } from '../data';
import { assetGridFromList, assetGridFromPositions } from '../grid';
import { useAppSelector } from '../hooks';
import { AppMode, CellSorting, RootState, slice, useDispatch } from '../store';
import { Collection } from './Collection';
import { SelectedInfo } from './SelectedInfo';

export function App() {
    const dispatch = useDispatch();

    // Init
    useEffect(() => {
        const impl = async () => {
            const result = await fetch('https://raw.githubusercontent.com/mattbierner/non-flesh-tokens-data/master/data.json');
            if (result.status === 200) {
                const json: RawAssetJson = await result.json();
                const assets = json.assets.map(raw => new Asset(raw));
                dispatch(slice.actions.didLoad({ assets: assets }))
            }
        }
        impl();
    }, []);

    const state = useAppSelector((state) => state);
    switch (state.mode) {
        case AppMode.Loading:
            return (
                <div>Loading</div>
            );

        case AppMode.Loaded:
            return (
                <LoadedView state={state} />
            );
    }
}

function LoadedView(props: { state: RootState.Loaded }) {
    const dispatch = useDispatch();

    const state = props.state;
    useEffect(() => {
        const handler = (e: KeyboardEvent): void => {
            if (state.mode !== AppMode.Loaded || !state.selected) {
                return;
            }

            const collection = state.selected.type === AssetType.Male ? state.data.male : state.data.female;
            const grid = state.sorting === CellSorting.Position ? assetGridFromPositions(collection) : assetGridFromList(13, collection.sortedByPriceLowHigh);

            const move = (dx: number, dy: number) => {
                e.preventDefault();

                const newAsset = grid.move([state.selected!.x, state.selected!.y], [dx, dy]);
                if (newAsset) {
                    dispatch(slice.actions.didSelectAction({
                        type: state.selected!.type,
                        coords: newAsset.coords,
                    }));
                }
            }

            switch (e.key) {
                case 'Escape':
                    dispatch(slice.actions.didSelectAction(undefined));
                    break;
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

                <Collection className='male-grid' title='Male' sorting={state.sorting} collection={state.data.male} minDimensions={minDimensions} />

                <Collection className='female-grid' title='Female' sorting={state.sorting} collection={state.data.female} minDimensions={minDimensions} />

                {state.selected
                    ? <SelectedInfo data={state.data} x={state.selected.x} y={state.selected.y} type={state.selected.type} />
                    : null}
            </div>
        </Flipper>
    );
}
