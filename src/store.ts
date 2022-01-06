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

export type RootState = {
    readonly mode: AppMode.Loading;
} | {
    readonly mode: AppMode.Loaded;

    readonly data: AssetCollection;

    readonly displayedData: DisplayedData;

    readonly selected?: {
        readonly type: AssetType;
        readonly x: number;
        readonly y: number;
    };

    readonly sorting: CellSorting;
};

const initialState: RootState = {
    mode: AppMode.Loading
} as RootState;


type Action =
    | typeof UpdateDisplayedDataAction
    | typeof DidLoadAction
    | typeof DidSelectAction
    ;

export const UpdateDisplayedDataAction = createAction('updateDisplayed')


export const DidLoadAction = createAction<{ assets: readonly Asset[] }, 'didLoad'>('didLoad');

export const DidSelectAction = createAction<{ type: AssetType, x: number, y: number }, 'didSelectAction'>('didSelectAction');

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
            };
        },
        [DidSelectAction.type]: (state, event: PayloadAction<{ type: AssetType, x: number, y: number }>) => {
            return {
                ...state,
                selected: event.payload,
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
