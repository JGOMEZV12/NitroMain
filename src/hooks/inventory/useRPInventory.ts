import { EquipRPItemComposer, GetRPInventoryComposer, IRPInventoryItemData, RPInventoryEvent, UnequipRPItemComposer } from '@nitrots/nitro-renderer';
import { useCallback, useEffect, useState } from 'react';
import { useBetween } from 'use-between';
import { SendMessageComposer } from '../../api';
import { useMessageEvent } from '../events';

const useRPInventoryState = () =>
{
    const [ items, setItems ] = useState<IRPInventoryItemData[]>([]);
    const [ needsUpdate, setNeedsUpdate ] = useState(true);

    useMessageEvent<RPInventoryEvent>(RPInventoryEvent, event =>
    {
        const parser = event.getParser();

        setItems(parser.items);
    });

    const updateInventory = useCallback(() =>
    {
        SendMessageComposer(new GetRPInventoryComposer());
    }, []);

    const equipItem = useCallback((item: IRPInventoryItemData) =>
    {
        SendMessageComposer(new EquipRPItemComposer(item.id));
    }, []);

    const unequipItem = useCallback((item: IRPInventoryItemData) =>
    {
        SendMessageComposer(new UnequipRPItemComposer(item.id));
    }, []);

    useEffect(() =>
    {
        if(needsUpdate)
        {
            updateInventory();
            setNeedsUpdate(false);
        }
    }, [ needsUpdate, updateInventory ]);

    return {
        items,
        setItems,
        updateInventory,
        equipItem,
        unequipItem,
        setNeedsUpdate
    };
}

export const useRPInventory = () => useBetween(useRPInventoryState);
