import { FC } from 'react';
import { useFriends } from '../../hooks';
import { FriendsListView } from './views/friends-list/FriendsListView';
import { FriendsMessengerView } from './views/messenger/FriendsMessengerView';

export const FriendsView: FC<{}> = props =>
{
    const { settings = null, onlineFriends = [] } = useFriends();

    if(!settings) return null;

    return (
        <>
            <FriendsListView />
            <FriendsMessengerView />
        </>
    );
}
