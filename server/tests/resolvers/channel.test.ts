import { GraphQLClient, request } from 'graphql-request';
import {
  channelQuery,
  createChannel,
  myChannelsQuery,
  signInEmailMutation,
  signUpMutation,
} from '../setup/queries';

import { testHost } from '../setup/testSetup';

describe('Resolver - Channel', () => {
  let authClient: GraphQLClient;

  beforeAll(async () => {
    const signUpVar = {
      user: {
        name: 'unique_tester',
        email: 'tester@dooboolab.com',
        password: 'password',
        gender: 'male',
      },
    };

    const signInVar = {
      email: 'tester@dooboolab.com',
      password: 'password',
    };

    const signUpResponse = await request(testHost, signUpMutation, signUpVar);

    expect(signUpResponse).toHaveProperty('signUp');
    expect(signUpResponse.signUp).toHaveProperty('email');
    expect(signUpResponse.signUp.email).toEqual(signUpVar.user.email);

    const signInResponse = await request(testHost, signInEmailMutation, signInVar);
    expect(signInResponse).toHaveProperty('signInEmail');
    expect(signInResponse.signInEmail).toHaveProperty('token');
    expect(signInResponse.signInEmail).toHaveProperty('user');
    expect(signInResponse.signInEmail.user.email).toEqual(signInVar.email);

    authClient = new GraphQLClient(testHost, {
      headers: {
        authorization: signInResponse.signInEmail.token,
      },
    });
  });

  const friendsId = [];

  it('should add more users', async () => {
    const signUpVar1 = {
      user: {
        name: 'another_tester_01',
        email: 'another1@dooboolab.com',
        password: 'password',
        gender: 'male',
      },
    };

    const signUpResponse1 = await request(testHost, signUpMutation, signUpVar1);

    expect(signUpResponse1).toHaveProperty('signUp');
    expect(signUpResponse1.signUp).toHaveProperty('email');
    expect(signUpResponse1.signUp.email).toEqual(signUpVar1.user.email);

    friendsId.push(signUpResponse1.signUp.id);

    const signUpVar2 = {
      user: {
        name: 'another_tester_02',
        email: 'another2@dooboolab.com',
        password: 'password',
        gender: 'male',
      },
    };

    const signUpResponse2 = await request(testHost, signUpMutation, signUpVar2);

    expect(signUpResponse2).toHaveProperty('signUp');
    expect(signUpResponse2.signUp).toHaveProperty('email');
    expect(signUpResponse2.signUp.email).toEqual(signUpVar2.user.email);

    friendsId.push(signUpResponse2.signUp.id);
  });

  let createdChannelId: string;
  const myChannels = [];

  it('should create [private] channel with message', async () => {
    const variables = {
      channel: {
        userIds: [friendsId[0]],
      },
      message: {
        text: 'Hello. How are you?',
      },
    };

    const response = await authClient.request(createChannel, variables);
    expect(response).toHaveProperty('createChannel');
    expect(response.createChannel).toHaveProperty('name');
    expect(response.createChannel).toHaveProperty('id');
    expect(response.createChannel).toHaveProperty('lastMessage');
    expect(response.createChannel).toHaveProperty('messages');
    expect(response.createChannel.messages).toHaveProperty('edges');

    createdChannelId = response.createChannel.id;

    // Add to myChannels which will be tested at the end of insertion.
    myChannels.push(createdChannelId);
  });

  it('should not create [private] channel again of same user group', async () => {
    const messageTobeSent = 'This will not create channelId but create another message.';
    const variables = {
      channel: {
        userIds: [friendsId[0]],
      },
      message: {
        text: messageTobeSent,
      },
    };

    const response = await authClient.request(createChannel, variables);
    expect(response).toHaveProperty('createChannel');
    expect(response.createChannel).toHaveProperty('id');
    expect(response.createChannel.lastMessage).toHaveProperty('text');
    expect(response.createChannel.id).toEqual(createdChannelId);
    expect(response.createChannel.lastMessage.text).toEqual(messageTobeSent);
  });

  it('should create new channel id when group of users are different in [private] channel', async () => {
    const variables = {
      channel: {
        userIds: [friendsId[0], friendsId[1]],
      },
    };

    const response = await authClient.request(createChannel, variables);
    expect(response).toHaveProperty('createChannel');
    expect(response.createChannel).toHaveProperty('id');
    expect(response.createChannel.id).not.toEqual(createdChannelId);

    // Add to myChannels which will be tested at the end of insertion.
    myChannels.push(response.createChannel.id);
  });

  it('should throw when user has no members to chat with in private channel', async () => {
    const variables = {
      channel: {
        userIds: [],
      },
    };

    const response = authClient.request(createChannel, variables);
    expect(response).rejects.toThrow();
  });

  it('should able to create channel without message', async () => {
    const variables = {
      channel: {
        userIds: [friendsId[0]],
      },
    };

    const response = await authClient.request(createChannel, variables);
    expect(response).toHaveProperty('createChannel');
    expect(response.createChannel).toHaveProperty('id');
  });

  it('should able to create [public] channel', async () => {
    const variables = {
      channel: {
        channelType: 'public',
      },
    };

    const response = await authClient.request(createChannel, variables);
    expect(response).toHaveProperty('createChannel');
    expect(response.createChannel).toHaveProperty('id');

    // Add to myChannels which will be tested at the end of insertion.
    myChannels.push(response.createChannel.id);
  });

  it('should query my channels which are newly inserted in above tests === 3', async () => {
    const response = await authClient.request(myChannelsQuery);
    expect(response).toHaveProperty('myChannels');
    expect(response.myChannels).toHaveLength(3);
    expect(myChannels.length).toEqual(response.myChannels.length);

    response.myChannels.forEach((channel) => {
      expect(myChannels).toContain(channel.id);
    });
  });

  it('should query single channel with channelId', async () => {
    const variables = {
      channelId: myChannels[0],
    };

    const response = await authClient.request(channelQuery, variables);
    expect(response).toHaveProperty('channel');
  });
});
