// FILE_ENTRY: js/engine/menu/MenuActionExecutor.js

export function applyMenuAction(targetActor, payload) {
    if (targetActor === null) {
        throw new Error('Invalid targetActor: targetActor is null');
    }
    if (typeof targetActor !== 'object') {
        throw new Error('Invalid targetActor: targetActor is not an object');
    }
    if (Array.isArray(targetActor)) {
        throw new Error('Invalid targetActor: targetActor cannot be an array');
    }

    if (payload === null) {
        throw new Error('Invalid payload: payload is null');
    }
    if (typeof payload !== 'object') {
        throw new Error('Invalid payload: payload is not an object');
    }
    if (Array.isArray(payload)) {
        throw new Error('Invalid payload: payload cannot be an array');
    }
    if (typeof payload.actionType !== 'string') {
        throw new Error('Invalid payload: actionType is missing or not a string');
    }

    if (payload.actionType === 'USE_ITEM') {
        if (typeof payload.consumeCount === 'number') {
            if (!Number.isInteger(payload.consumeCount)) {
                throw new Error('Invalid payload: consumeCount must be an integer');
            }
            if (payload.consumeCount < 0) {
                throw new Error('Invalid payload: consumeCount must be >= 0');
            }
            if (payload.consumeCount > 0) {
                if (typeof payload.itemId !== 'string') {
                    throw new Error('Invalid payload: itemId must be a string when consumeCount > 0');
                }
                if (payload.itemId.length === 0) {
                    throw new Error('Invalid payload: itemId cannot be empty when consumeCount > 0');
                }
                targetActor.removeItem(payload.itemId, payload.consumeCount);
            }
        }
        if (typeof payload.healHp === 'number') {
            if (!Number.isFinite(payload.healHp)) {
                throw new Error('Invalid payload: healHp must be finite');
            }
            if (payload.healHp <= 0) {
                throw new Error('Invalid payload: healHp must be > 0');
            }
            targetActor.heal(payload.healHp);
        }
        if (typeof payload.healMp === 'number') {
            if (!Number.isFinite(payload.healMp)) {
                throw new Error('Invalid payload: healMp must be finite');
            }
            if (payload.healMp <= 0) {
                throw new Error('Invalid payload: healMp must be > 0');
            }
            targetActor.healMp(payload.healMp);
        }
        if (payload.curePoison === true) {
            targetActor.curePoison();
        }
        if (typeof payload.holyWaterSteps === 'number') {
            if (!Number.isFinite(payload.holyWaterSteps)) {
                throw new Error('Invalid payload: holyWaterSteps must be finite');
            }
            if (payload.holyWaterSteps < 0) {
                throw new Error('Invalid payload: holyWaterSteps must be >= 0');
            }
            targetActor.holyWaterSteps = payload.holyWaterSteps;
        }
        if (typeof payload.torchSteps === 'number') {
            if (!Number.isFinite(payload.torchSteps)) {
                throw new Error('Invalid payload: torchSteps must be finite');
            }
            if (payload.torchSteps < 0) {
                throw new Error('Invalid payload: torchSteps must be >= 0');
            }
            targetActor.torchSteps = payload.torchSteps;
        }
        if (typeof payload.isLanternLit === 'boolean') {
            targetActor.isLanternLit = payload.isLanternLit;
        }
    } else if (payload.actionType === 'EQUIP_ITEM') {
        let isValidSlot = false;
        if (payload.slot === 'weapon') {
            isValidSlot = true;
        } else if (payload.slot === 'armor') {
            isValidSlot = true;
        } else if (payload.slot === 'shield') {
            isValidSlot = true;
        }
        if (!isValidSlot) {
            throw new Error('Invalid payload: slot must be weapon, armor, or shield');
        }

        if (payload.operation === 'equip') {
            if (typeof payload.itemId !== 'string') {
                throw new Error('Invalid payload: itemId must be a string for equip operation');
            }
            if (payload.itemId.length === 0) {
                throw new Error('Invalid payload: itemId cannot be empty for equip operation');
            }
            targetActor.equip(payload.slot, payload.itemId);
        } else if (payload.operation === 'unequip') {
            targetActor.unequip(payload.slot);
        } else {
            throw new Error('Invalid payload: operation must be equip or unequip');
        }
    } else if (payload.actionType === 'USE_MAGIC') {
        if (typeof payload.mpCost === 'number') {
            if (!Number.isFinite(payload.mpCost)) {
                throw new Error('Invalid payload: mpCost must be finite');
            }
            if (payload.mpCost <= 0) {
                throw new Error('Invalid payload: mpCost must be > 0');
            }
            targetActor.consumeMp(payload.mpCost);
        }
        if (typeof payload.healHp === 'number') {
            if (!Number.isFinite(payload.healHp)) {
                throw new Error('Invalid payload: healHp must be finite');
            }
            if (payload.healHp <= 0) {
                throw new Error('Invalid payload: healHp must be > 0');
            }
            targetActor.heal(payload.healHp);
        }
        if (payload.curePoison === true) {
            targetActor.curePoison();
        }
        if (typeof payload.remiraSteps === 'number') {
            if (!Number.isFinite(payload.remiraSteps)) {
                throw new Error('Invalid payload: remiraSteps must be finite');
            }
            if (payload.remiraSteps < 0) {
                throw new Error('Invalid payload: remiraSteps must be >= 0');
            }
            targetActor.remiraSteps = payload.remiraSteps;
        }
        if (typeof payload.holyWaterSteps === 'number') {
            if (!Number.isFinite(payload.holyWaterSteps)) {
                throw new Error('Invalid payload: holyWaterSteps must be finite');
            }
            if (payload.holyWaterSteps < 0) {
                throw new Error('Invalid payload: holyWaterSteps must be >= 0');
            }
            targetActor.holyWaterSteps = payload.holyWaterSteps;
        }
    } else if (payload.actionType === 'DROP_ITEM') {
        if (typeof payload.itemId !== 'string') {
            throw new Error('Invalid payload: itemId must be a string for DROP_ITEM');
        }
        if (payload.itemId.length === 0) {
            throw new Error('Invalid payload: itemId cannot be empty for DROP_ITEM');
        }
        if (typeof payload.count !== 'number') {
            throw new Error('Invalid payload: count must be a number for DROP_ITEM');
        }
        if (!Number.isInteger(payload.count)) {
            throw new Error('Invalid payload: count must be an integer for DROP_ITEM');
        }
        if (payload.count <= 0) {
            throw new Error('Invalid payload: count must be > 0 for DROP_ITEM');
        }
        targetActor.removeItem(payload.itemId, payload.count);
    } else {
        throw new Error('Invalid payload: unknown actionType');
    }
}