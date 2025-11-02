import React, { useMemo, useEffect } from 'react';
// FIX: Add missing import for GameSettings
import { GameState, Item, LocationStorage, GameSettings } from '../types';
import Modal from './Modal';
import { useLocalization } from '../context/LocalizationContext';
import InventoryManagerUI from './InventoryManagerUI';

interface StorageScreenProps {
    isOpen: boolean;
    onClose: () => void;
    storage: LocationStorage;
    locationId: string;
    gameState: GameState;
    onMoveToStorage: (locationId: string, storageId: string, item: Item, quantity: number) => void;
    onRetrieveFromStorage: (locationId: string, storageId: string, item: Item, quantity: number) => void;
    onShareAccess: (locationId: string, storageId: string, targetPlayerId: string) => void;
    onRevokeAccess: (locationId: string, storageId: string, targetPlayerId: string) => void;
    onOpenDetailModal: (title: string, data: any) => void;
    imageCache: Record<string, string>;
    onImageGenerated: (prompt: string, base64: string) => void;
    gameSettings: GameSettings | null;
}

const StorageScreen: React.FC<StorageScreenProps> = (props) => {
    const {
        isOpen,
        onClose,
        storage,
        locationId,
        gameState,
        onMoveToStorage,
        onRetrieveFromStorage,
        onShareAccess,
        onRevokeAccess,
        onOpenDetailModal,
        imageCache,
        onImageGenerated,
        gameSettings,
    } = props;
    const { t } = useLocalization();
    const player = gameState.playerCharacter;

    // Find the *live* storage object from the current gameState to ensure UI updates.
    const currentStorage = useMemo(() => {
        const locationWithStorage = gameState.currentLocationData.locationId === locationId 
            ? gameState.currentLocationData 
            : null;
            
        return locationWithStorage?.locationStorages?.find(s => s.storageId === storage.storageId);
    }, [gameState, storage.storageId, locationId]);

    // If the storage disappears (e.g., location changes), close the modal.
    useEffect(() => {
        if (!currentStorage) {
            onClose();
        }
    }, [currentStorage, onClose]);
    
    if (!isOpen || !currentStorage) {
        return null;
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`${t('Manage Storage')}: ${currentStorage.name}`} size="fullscreen">
            <div className="flex h-full gap-4">
                {/* Player Inventory */}
                <div className="flex-1 flex flex-col p-4 bg-gray-900/40 rounded-lg">
                    <h3 className="text-xl font-bold text-cyan-400 mb-4">{t('Your Inventory')}</h3>
                    <div className="flex-1 overflow-y-auto pr-2">
                        <div className="grid grid-cols-1 gap-2">
                            {player.inventory.filter(i => !i.contentsPath).map(item => (
                                <div key={item.existedId} className="flex items-center gap-2 p-2 bg-gray-800/60 rounded-md">
                                    <span className="flex-1">{item.name} (x{item.count})</span>
                                    <button
                                        onClick={() => onMoveToStorage(locationId, currentStorage.storageId, item, item.count)}
                                        className="px-3 py-1 text-xs font-semibold rounded-md bg-cyan-600/20 text-cyan-300 hover:bg-cyan-600/40"
                                    >
                                        {t('Move to Storage')}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                {/* Storage Contents */}
                <div className="flex-1 flex flex-col p-4 bg-gray-900/40 rounded-lg">
                    <h3 className="text-xl font-bold text-cyan-400 mb-4">{t('Storage Contents')}</h3>
                    <div className="flex-1 overflow-y-auto pr-2">
                        <div className="grid grid-cols-1 gap-2">
                            {currentStorage.contents.map(item => (
                                 <div key={item.existedId} className="flex items-center gap-2 p-2 bg-gray-800/60 rounded-md">
                                    <span className="flex-1">{item.name} (x{item.count})</span>
                                    <button
                                        onClick={() => onRetrieveFromStorage(locationId, currentStorage.storageId, item, item.count)}
                                        className="px-3 py-1 text-xs font-semibold rounded-md bg-green-600/20 text-green-300 hover:bg-green-600/40"
                                    >
                                        {t('Retrieve from Storage')}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default StorageScreen;
