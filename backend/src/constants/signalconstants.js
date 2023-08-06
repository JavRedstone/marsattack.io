/**
 * @author Javier Huang
 */

export const SIGNALS = {
    USER_JOIN: 'user_join', // when user first joins game
    CLIENT_UPDATE: 'client_update', // update messages from client
    SERVER_UPDATE: 'server_update', // update messages from server
    CLIENT_MESSAGE: 'client_message', // just a message
    CLIENT_UPGRADE: 'client_upgrade', // upgrade message
    SERVER_UPGRADE: 'server_upgrade',
    GAME_OVER: 'game_over' // you can't respawn
};