import React from 'react';
import { Flipped } from 'react-flip-toolkit';
import { Asset, AssetSet } from './data';
import { useAppSelector } from './hooks';
import { AppMode, CellSorting, DisplayedData, slice, useDispatch } from './store';

type DisplayInfo =
    { readonly type: DisplayedData.None } |
    {
        readonly type: DisplayedData.Price;
        readonly min: number;
        readonly max: number;
    };

function Grid(props: {
    collection: AssetSet,
    displayInfo: DisplayInfo,
    minDimensions: [number, number],
    sorting: CellSorting
}) {
    const found = new Set<string>();

    const collection = props.collection;

    const gridWidth = collection.maxX - collection.minX;
    const gridHeight = collection.maxY - collection.minY;

    const leftPadding = Math.floor((props.minDimensions[0] - gridWidth) / 2.0);
    const rightPadding = Math.ceil((props.minDimensions[0] - gridWidth) / 2.0);

    const topPadding = Math.floor((props.minDimensions[1] - gridHeight) / 2.0);
    const bottomPadding = Math.ceil((props.minDimensions[1] - gridHeight) / 2.0);

    const e: JSX.Element[] = [];

    if (props.sorting === CellSorting.Position) {
        for (const x of collection.assets) {
            found.add(x.coords.join());
            const gridY = x.coords[1] - props.collection.minY + 1 + topPadding;
            const gridX = x.coords[0] - props.collection.minX + 1 + leftPadding;

            e.push(
                <Cell key={x.coords.join()}
                    asset={x}
                    displayInfo={props.displayInfo}
                    collection={collection}
                    leftPadding={leftPadding}
                    topPadding={topPadding}
                    gridArea={`${gridY} / ${gridX}`} />
            );
        }
        for (let x = collection.minX - leftPadding;x <= collection.maxX + rightPadding;++x) {
            for (let y = collection.minY - topPadding;y <= collection.maxY + bottomPadding;++y) {
                const coords = [x, y];
                if (!found.has(coords.join())) {
                    e.push(<EmptyCell key={coords.join()}
                        coords={coords}
                        collection={collection}
                        leftPadding={leftPadding}
                        topPadding={topPadding} />);
                }
            }
        }

        return (
            <div className='main-grid' style={{
                gridTemplateColumns: `repeat(${(collection.maxX - collection.minX) + 1 + leftPadding + rightPadding}, 1fr)`,
                gridTemplateRows: `repeat(${(collection.maxY - collection.minY) + 1 + topPadding + bottomPadding}, 1fr)`
            }}>
                {e}
            </div>
        )

    } else {
        for (const x of collection.assets.sort((a, b) => a.lastSalePrice_eth - b.lastSalePrice_eth)) {
            found.add(x.coords.join());

            e.push(
                <Cell key={x.coords.join()}
                    asset={x}
                    displayInfo={props.displayInfo}
                    collection={collection}
                    leftPadding={leftPadding}
                    topPadding={topPadding}
                    gridArea={``} />
            );
        }

        return (
            <div className='main-grid' style={{
                gridTemplateColumns: `repeat(${(collection.maxX - collection.minX) + 1 + leftPadding + rightPadding}, 1fr)`,
            }}>
                {e}
            </div>
        )
    }
}

function Cell(props: {
    asset: Asset,
    displayInfo: DisplayInfo,
    collection: AssetSet,
    leftPadding: number,
    topPadding: number,
    gridArea: string,
}) {
    const state = useAppSelector((state) => state);
    if (state.mode !== AppMode.Loaded) {
        return <></>;
    }

    const dispatch = useDispatch();

    const isSelected = state.selected
        && state.selected.type === props.asset.type
        && state.selected.x === props.asset.coords[0]
        && state.selected.y === props.asset.coords[1];

    return (
        <Flipped flipId={props.asset.type + '-' + props.asset.coords.join()}>
            <div className={'cell ' + (isSelected ? 'selected' : '')} style={{
                gridArea: props.gridArea,
            }} onClick={() => {
                dispatch(slice.actions.didSelectAction({ type: props.asset.type, x: props.asset.coords[0], y: props.asset.coords[1] }))
            }}>
                <div className={'cell-content ' + props.asset.previewSpriteCssName} style={{
                    // backgroundImage: `url(${props.asset.previewUrl})`,
                    // backgroundSize: '100%'
                }}>
                </div>
            </div>
        </Flipped>
    );
}

function EmptyCell(props: {
    coords: number[],
    collection: AssetSet,
    leftPadding: number
    topPadding: number
}) {
    const gridY = props.coords[1] - props.collection.minY + 1 + props.topPadding;
    const gridX = props.coords[0] - props.collection.minX + 1 + props.leftPadding;
    return (
        <div className='cell empty-cell' style={{
            gridArea: `${gridY} / ${gridX}`,
        }}></div>
    );
}

export function Collection(props: {
    title: string,
    className?: string,
    collection: AssetSet,
    displayInfo: DisplayInfo,
    minDimensions: [number, number],
    sorting: CellSorting,
}) {
    return (
        <div className={props.className}>
            <GridHeader title={props.title} minDimensions={props.minDimensions[0]} />
            <Grid
                collection={props.collection}
                sorting={props.sorting}
                displayInfo={props.displayInfo}
                minDimensions={props.minDimensions} />
        </div>
    );
}

function GridHeader(props: {
    title: string,
    minDimensions: number;
}) {
    const elements: JSX.Element[] = [];
    props.title.split('').forEach((x, i) => {
        elements.push(
            <span className='cell empty-cell' style={{
                aspectRatio: '1 / 1',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }} key={i}>{x}</span>
        );
    });

    while (elements.length < props.minDimensions + 1) {
        elements.push(
            <span className='cell empty-cell' style={{
                aspectRatio: '1 / 1',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }} key={elements.length} />
        );
    }

    return (
        <h1 className='grid-header main-grid' style={{
            gridTemplateColumns: `repeat(${props.minDimensions + 1}, 1fr)`,
            gridTemplateRows: `1fr`,
            fontSize: '1rem',
            fontWeight: 'bold',
            marginBottom: '0.4rem',
        }}>
            {elements}
        </h1>
    );
}
