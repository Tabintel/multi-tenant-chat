// Stream Chat client integration

import { StreamChat, type User, type Channel } from "stream-chat"
import { authApi } from "./api"

// Initialize Stream Chat client with the environment variable
const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY || ""

let chatClient: StreamChat | null = null

// Get or initialize the Stream Chat client
export const getChatClient = () => {
  if (!chatClient && apiKey) {
    chatClient = StreamChat.getInstance(apiKey)
  }
  return chatClient
}

// Connect user to Stream Chat
export const connectUser = async (userData: {
  id: string
  name: string
  role: string
  tenantId: string
}): Promise<StreamChat> => {
  try {
    const client = getChatClient()

    if (!client) {
      throw new Error("Stream Chat client not initialized")
    }

    // Get token from backend
    const { token } = await authApi.getChatToken()

    // Connect user to Stream Chat
    await client.connectUser(
      {
        id: userData.id,
        name: userData.name,
        role: userData.role,
        tenant_id: userData.tenantId,
      },
      token,
    )

    return client
  } catch (error) {
    console.error("Error connecting to Stream Chat:", error)
    throw error
  }
}

// Disconnect user from Stream Chat
export const disconnectUser = async (): Promise<void> => {
  try {
    const client = getChatClient()
    if (client && client.userID) {
      await client.disconnectUser()
    }
  } catch (error) {
    console.error("Error disconnecting from Stream Chat:", error)
  }
}

// Get channels for current user's tenant
export const getUserChannels = async (tenantId: string): Promise<Channel[]> => {
  try {
    const client = getChatClient()

    if (!client || !client.userID) {
      throw new Error("User not connected to Stream Chat")
    }

    // Query channels with tenant filter
    const filter = {
      type: "messaging",
      members: { $in: [client.userID] },
      tenant_id: tenantId,
    }

    const sort = [{ last_message_at: -1 }]

    const channels = await client.queryChannels(filter, sort, {
      watch: true,
      state: true,
    })

    return channels
  } catch (error) {
    console.error("Error getting user channels:", error)
    throw error
  }
}

// Create a new channel
export const createChannel = async (channelData: {
  name: string
  description: string
  tenantId: string
}): Promise<Channel> => {
  try {
    const client = getChatClient()

    if (!client || !client.userID) {
      throw new Error("User not connected to Stream Chat")
    }

    // Create a unique channel ID using tenant ID
    const channelId = `${channelData.tenantId}-${channelData.name.toLowerCase().replace(/\s+/g, "-")}`

    // Create the channel
    const channel = client.channel("messaging", channelId, {
      name: channelData.name,
      description: channelData.description,
      tenant_id: channelData.tenantId,
      members: [client.userID],
    })

    await channel.create()

    return channel
  } catch (error) {
    console.error("Error creating channel:", error)
    throw error
  }
}

// Add a user to a channel
export const addUserToChannel = async (channelId: string, userId: string): Promise<void> => {
  try {
    const client = getChatClient()

    if (!client) {
      throw new Error("Stream Chat client not initialized")
    }

    const channel = client.channel("messaging", channelId)
    await channel.addMembers([userId])
  } catch (error) {
    console.error("Error adding user to channel:", error)
    throw error
  }
}

// Remove a user from a channel
export const removeUserFromChannel = async (channelId: string, userId: string): Promise<void> => {
  try {
    const client = getChatClient()

    if (!client) {
      throw new Error("Stream Chat client not initialized")
    }

    const channel = client.channel("messaging", channelId)
    await channel.removeMembers([userId])
  } catch (error) {
    console.error("Error removing user from channel:", error)
    throw error
  }
}

// Get all users in a tenant
export const getTenantUsers = async (tenantId: string): Promise<User[]> => {
  try {
    const client = getChatClient()

    if (!client) {
      throw new Error("Stream Chat client not initialized")
    }

    const filter = { tenant_id: tenantId }
    const sort = [{ name: 1 }]

    const { users } = await client.queryUsers(filter, sort)
    return users
  } catch (error) {
    console.error("Error getting tenant users:", error)
    throw error
  }
}

