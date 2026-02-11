import { GetGuestRoomResultEvent, NavigatorSearchComposer, RateFlatMessageComposer } from '@nitrots/nitro-renderer';
import { FC, useEffect, useState } from 'react';
import { CreateLinkEvent, GetConfiguration, GetRoomEngine, LocalizeText, SendMessageComposer } from '../../../../api';
import { Base, classNames, Column, Flex } from '../../../../common';
import { useMessageEvent, useNavigator, useRoom } from '../../../../hooks';

const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' }
    ]
};

export const RoomToolsWidgetView: FC<{}> = props =>
{
    const [ areBubblesMuted, setAreBubblesMuted ] = useState(false);
    const [ isZoomedIn, setIsZoomedIn ] = useState<boolean>(false);
    const [ roomName, setRoomName ] = useState<string>(null);
    const [ roomOwner, setRoomOwner ] = useState<string>(null);
    const [ roomTags, setRoomTags ] = useState<string[]>(null);
    const [ isOpen, setIsOpen ] = useState<boolean>(false);
    const { navigatorData = null } = useNavigator();
    const { roomSession = null } = useRoom();

    // Estados para el Chat de Voz
    const [ isConnected, setIsConnected ] = useState(false);
    const [ isMicrophoneActive, setIsMicrophoneActive ] = useState(false);
    const [ activeSpeakers, setActiveSpeakers ] = useState<Set<string>>(new Set());
    

    const handleToolClick = (action: string, value?: string) =>
    {
        switch(action)
        {
            case 'settings':
                CreateLinkEvent('navigator/toggle-room-info');
                return;
            case 'zoom':
                setIsZoomedIn(prevValue =>
                {
                    if(GetConfiguration('room.zoom.enabled', true))
                    {
                        const scale = GetRoomEngine().getRoomInstanceRenderingCanvasScale(roomSession.roomId, 1);
                        GetRoomEngine().setRoomInstanceRenderingCanvasScale(roomSession.roomId, 1, scale === 1 ? 0.5 : 1);
                    }
                    else
                    {
                        const geometry = GetRoomEngine().getRoomInstanceGeometry(roomSession.roomId, 1);
    
                        if(geometry) geometry.performZoom();
                    }
    
                    return !prevValue;
                });
                return;    
            case 'chat_history':
                CreateLinkEvent('chat-history/toggle');
                return;
                case 'hiddenbubbles':
                CreateLinkEvent('nitrobubblehidden/toggle');
                const bubbleElement = document.getElementById('bubble');
                if (bubbleElement) {
                    bubbleElement.classList.toggle('icon-chat-disablebubble');
                }
                const hiddenbubblesTextElement = document.getElementById('hiddenbubblesText');
                if (hiddenbubblesTextElement) {
                    const newText = areBubblesMuted ? LocalizeText('room.unmute.button.text') : LocalizeText('room.mute.button.text');
                    hiddenbubblesTextElement.innerText = newText;
                }
                setAreBubblesMuted(!areBubblesMuted);
                const bubbleIcon = document.getElementById('bubbleIcon');
                if (bubbleIcon) {
                    bubbleIcon.classList.toggle('icon-chat-disablebubble');
                }
                return;
            case 'like_room':
                SendMessageComposer(new RateFlatMessageComposer(1));
                return;
            case 'toggle_room_link':
                CreateLinkEvent('navigator/toggle-room-link');
                return;
            case 'navigator_search_tag':
                CreateLinkEvent(`navigator/search/${ value }`);
                SendMessageComposer(new NavigatorSearchComposer('hotel_view', `tag:${ value }`));
                return;
        }
    }

    useMessageEvent<GetGuestRoomResultEvent>(GetGuestRoomResultEvent, event =>
    {
        const parser = event.getParser();

        if(!parser.roomEnter || (parser.data.roomId !== roomSession.roomId)) return;

        if(roomName !== parser.data.roomName) setRoomName(parser.data.roomName);
        if(roomOwner !== parser.data.ownerName) setRoomOwner(parser.data.ownerName);
        if(roomTags !== parser.data.tags) setRoomTags(parser.data.tags);
    });

    useEffect(() =>
    {
        setIsOpen(true);

        const timeout = setTimeout(() => setIsOpen(false), 5000);

        return () => clearTimeout(timeout);
    }, [ roomName, roomOwner, roomTags ]);

    return (
        <Flex className="nitro-room-tools-container" gap={ 2 }>
            <Column center className="nitro-room-tools p-2">
                
                {/* Modo Combate */}
                <div style={{ 
                    display: 'inline-block', 
                    cursor: 'pointer',
                    position: 'relative'
                }}>
                    <Base 
                        pointer 
                        title={LocalizeText('room.combat.button.text')}
                        style={{ 
                            backgroundColor: window.parent.isCombat ? 'rgba(42, 148, 4, 0.69)' : 'rgba(0, 0, 0, 0.1)',
                        }}
                        className="icon icon-combat"
                        onClick={() => window.parent.app['sendData']('event_target', 'open,CombatMode', false, false)}
                    />
                </div>
                
                {/* Modo Pasivo */}
                <div style={{ 
                    display: 'inline-block', 
                    cursor: 'pointer',
                    position: 'relative'
                }}>
                    <Base 
                        pointer 
                        title={LocalizeText('room.psvm.button.text')}
                        style={{ 
                            backgroundColor: window.parent.isPsv ? 'rgba(42, 148, 4, 0.69)' : 'rgba(0, 0, 0, 0.1)',
                        }}
                        className="icon icon-psvmode"
                        onClick={() => window.parent.app['sendData']('event_psv', 'open,PSVMode', false, false)}
                    />
                </div>
                
                {/* Bandas */}
                <div style={{ 
                    display: 'inline-block', 
                    cursor: 'pointer',
                    position: 'relative'
                }}>
                    <Base 
                        pointer 
                        title={LocalizeText('room.gang.button.text')}
                        className="icon icon-gang"
                        onClick={() => window.parent.app['sendData']('event_gang', 'open,GangsWindow', false, false)}
                    />
                </div>
                
                {/* Lista de buscados */}
                <div style={{ 
                    display: 'inline-block', 
                    cursor: 'pointer',
                    position: 'relative'
                }}>
                    <Base 
                        pointer 
                        title={LocalizeText('room.wanted.button.text')}
                        className="icon icon-wanted"
                        onClick={() => window.parent.app['sendData']('event_stats', 'open,WantedList', false, false)}
                    />
                </div>
                
                {/* Inventario */}
                <div style={{ 
                    display: 'inline-block', 
                    cursor: 'pointer',
                    position: 'relative'
                }}>
                    <Base 
                        pointer 
                        title={LocalizeText('room.inventory.button.text')}
                        className="icon icon-inventory2"
                        onClick={() => window.parent.document.getElementById('inventario').style.display = 'block'}
                    />
                </div>
                
                {/* Configuración */}
                <div style={{ 
                    display: 'inline-block', 
                    cursor: 'pointer',
                    position: 'relative'
                }}>
                    <Base 
                        pointer 
                        title={LocalizeText('room.settings.button.text')}
                        className="icon icon-cog"
                        onClick={() => handleToolClick('settings')}
                    />
                </div>
                
                {/* Zoom */}
                <div style={{ 
                    display: 'inline-block', 
                    cursor: 'pointer',
                    position: 'relative'
                }}>
                    <Base 
                        pointer 
                        title={LocalizeText('room.zoom.button.text')}
                        className={classNames('icon', (!isZoomedIn && 'icon-zoom-less'), (isZoomedIn && 'icon-zoom-more'))}
                        onClick={() => handleToolClick('zoom')}
                    />
                </div>
                
                {/* Historial de chat */}
                <div style={{ 
                    display: 'inline-block', 
                    cursor: 'pointer',
                    position: 'relative'
                }}>
                    <Base 
                        pointer 
                        title={LocalizeText('room.chathistory.button.text')}
                        className="icon icon-chat-history"
                        onClick={() => handleToolClick('chat_history')}
                    />
                </div>

                 {/* HiddenBubbles */}
                <div style={{ 
                    display: 'inline-block', 
                    cursor: 'pointer',
                    position: 'relative'
                }}>
                    <Base 
                        pointer 
                        title={areBubblesMuted ? LocalizeText('room.unmute.button.text') : LocalizeText('room.mute.button.text')}
                        onClick={() => handleToolClick('hiddenbubbles')} 
                        className={`icon ${areBubblesMuted ? 'icon-chat-disablebubble' : 'icon-chat-enablebubble'}`} 
                    />
                </div>
                
                {/* Me gusta (solo si puede calificar) */}
                {navigatorData?.canRate && (
                    <div style={{ 
                        display: 'inline-block', 
                        cursor: 'pointer',
                        position: 'relative'
                    }}>
                        <Base 
                            pointer 
                            title={LocalizeText('room.like.button.text')}
                            className="icon icon-like-room"
                            onClick={() => handleToolClick('like_room')}
                        />
                    </div>
                )}
            </Column>
        </Flex>
    );
}
