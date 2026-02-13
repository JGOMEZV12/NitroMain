import { IMessageComposer } from '../../../../../../api';

export class UnequipRPItemComposer implements IMessageComposer<[number]> {
    private _data: [number];

    constructor(id: number) {
        this._data = [id];
    }

    public getMessageArray() {
        return this._data;
    }

    public dispose(): void {
        return;
    }
}
