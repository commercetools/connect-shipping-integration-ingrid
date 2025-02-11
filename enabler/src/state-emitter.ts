import { EventEmitter } from 'eventemitter3';

class StateEmitter extends EventEmitter {
    private _isShippingDataChanged: boolean = false;

    get isShippingDataChanged(): boolean {
        return this._isShippingDataChanged;
    }

    set isShippingDataChanged(value: boolean) {
        console.log("isShippingDataChanged");
        this._isShippingDataChanged = value;
        this.emit('shippingDataChanged', value);
    }
}

export const stateEmitter = new StateEmitter();