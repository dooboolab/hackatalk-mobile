import { StyleProp, TextStyle } from 'react-native';

import { FC } from 'react';

export interface User {
  uid: string;
  displayName: string;
  thumbURL: string;
  photoURL: string;
  statusMsg: string;
  online?: boolean;
  created?: Date;
  updated?: Date;
}

export interface AuthUser extends User {
  friends?: [];
  chatrooms?: [];
}

enum MessageType {
  Message,
  Photo,
}

export interface Chat {
  id: string;
  sender: User;
  messageType?: MessageType;
  message: string;
  created?: Date;
  updated?: Date;
}

export interface Chatroom {
  id: string;
  secret: string;
  lastChat: Chat;
  lastChatCnt: number;
  chats?: Chat[];
  users?: User[];
  created?: Date;
  updated?: Date;
}

// export type Friend = Omit<User, 'uid'>;

interface IconProps {
  style?: StyleProp<TextStyle>;
  width?: number | string;
  height?: number | string;
  children?: never;
}

export type IconType = FC<IconProps>;

export enum ThemeType {
  LIGHT = 'LIGHT',
  DARK = 'DARK',
}
