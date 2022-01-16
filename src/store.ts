import { createAction, createSlice, createStore, Dispatch, PayloadAction } from "@reduxjs/toolkit";
import * as reactRedux from "react-redux";
import { Asset, AssetCollection, AssetType } from "./data";

export enum AppMode {
    Loading,
    Loaded
}

export enum DisplayedData {
    None,
    Price
}

export enum CellSorting {
    Position = 'position',
    PriceHighLow = 'price-high-low',
}

export interface SelectionState {
    readonly type: AssetType;
    readonly x: number;
    readonly y: number;
}

export namespace RootState {

    export type Loaded = {
        readonly mode: AppMode.Loaded;
        readonly data: AssetCollection;
        readonly displayedData: DisplayedData;
        readonly selected?: SelectionState;
        readonly sorting: CellSorting;
    };

    export type Loading = {
        readonly mode: AppMode.Loading;
    };

    export type State = Loading | Loaded;
};

const initialState = {
    mode: AppMode.Loading
} as RootState.State;


type Action =
    | typeof UpdateDisplayedDataAction
    | typeof DidLoadAction
    | typeof DidSelectAction
    ;

export const UpdateDisplayedDataAction = createAction('updateDisplayed');


export const DidLoadAction = createAction<{ assets: readonly Asset[] }, 'didLoad'>('didLoad');

export const DidSelectAction = createAction<{ type: AssetType, coords: [number, number] } | undefined, 'didSelectAction'>('didSelectAction');

export const ChangeSortingAction = createAction<{ value: CellSorting }, 'changeSorting'>('changeSorting');

export const useDispatch = () => reactRedux.useDispatch<Dispatch<Action>>()

export const slice = createSlice({
    name: 'main',
    initialState,
    reducers: {
        updateDisplayed: (state) => {
            return state;
        },
        [DidLoadAction.type]: (state, event: PayloadAction<{ assets: readonly Asset[] }>) => {
            const collection = new AssetCollection(event.payload.assets);
            return {
                mode: AppMode.Loaded,
                data: collection,
                displayedData: DisplayedData.None,
                sorting: CellSorting.Position,
                selected: getInitialSelection(),
            };
        },
        [DidSelectAction.type]: (state, event: PayloadAction<{ type: AssetType, coords: [number, number] } | undefined>) => {
            if (event.payload) {
                const url = new URL(window.location.href);
                url.searchParams.set('model', event.payload.type === AssetType.Male ? 'm' : 'f');
                url.searchParams.set('x', event.payload.coords[0].toString());
                url.searchParams.set('y', event.payload.coords[1].toString());
                history.replaceState(null, '', url);
            } else {
                const url = new URL(window.location.href);
                url.search = '';
                history.replaceState(null, '', url);
            }

            return {
                ...state,
                selected: event.payload ? { type: event.payload.type, x: event.payload.coords[0], y: event.payload.coords[1] } : undefined,
            };
        },
        [ChangeSortingAction.type]: (state, event: PayloadAction<{ value: CellSorting }>) => {
            return {
                ...state,
                sorting: event.payload.value,
            };
        }
    }
});

export type AppDispatch = typeof store.dispatch

export const store = createStore(slice.reducer)

function getInitialSelection(): SelectionState | undefined {
    const params = new URLSearchParams(document.location.search);

    const model = params.get('model');
    const x = params.get('x');
    const y = params.get('y');

    if (!model || !x || !y) {
        return undefined;
    }

    return {
        type: model === 'm' ? AssetType.Male : AssetType.Female,
        x: parseInt(x) || 0,
        y: parseInt(y) || 0,
    }
}

