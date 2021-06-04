export const createMessage = /* GraphQL */ `
  mutation createMessage(
    $channelId: String!
    $message: MessageCreateInput!
    $deviceKey: String!
  ) {
    createMessage(
      channelId: $channelId
      message: $message
      deviceKey: $deviceKey
    ) {
      id
      text
    }
  }
`;

export const messageQuery = /* GraphQL */ `
  query message($id: String!) {
    message(id: $id) {
      id
      messageType
      text
      sender {
        id
        nickname
        thumbURL
      }
      createdAt
    }
  }
`;

export const messagesQuery = /* GraphQL */ `
  query messages($first: Int!, $channelId: String!) {
    messages(channelId: $channelId, first: $first) {
      edges {
        cursor
        node {
          id
          messageType
          text
          sender {
            id
            nickname
            thumbURL
          }
          createdAt
        }
      }
    }
  }
`;
