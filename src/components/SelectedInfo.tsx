import React from 'react';
import { AssetCollection, AssetType } from "../data";

export function SelectedInfo(props: { data: AssetCollection, x: number, y: number, type: AssetType }) {
    const asset = props.data.get(props.type, props.x, props.y)!;
    return (
        <div className='selected-info'>
            <img className='thumbnail' src={asset.raw.image_thumbnail_url} />

            <h2 className='title'>{props.type === AssetType.Female ? 'Female' : 'Male'} <span>x={props.x}</span>, <span>y={props.y}</span></h2>

            <div className='properties'>
                <div>Last Sale: {asset.raw.lastSale ? `${asset.raw.lastSale.eth_price}ETH (${asset.raw.lastSale.usd_price}` : 'none'}</div>

                <div>Number of Sales: {asset.raw.num_sales}</div>
            </div>

            <a className='item-link' href={`https://opensea.io/assets/0x495f947276749ce646f68ac8c248420045cb7b5e/${asset.raw.token_id}`}>View on OpenSea</a>
        </div>
    );
}