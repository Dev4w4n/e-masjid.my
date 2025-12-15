/**
 * Display Command Service
 *
 * Provides functionality to send commands to TV displays via Supabase Broadcast.
 * Commands are ephemeral (not persisted) and delivered in real-time via WebSocket.
 */

import { supabase } from "@masjid-suite/supabase-client";

/**
 * Available commands that can be sent to a TV display
 */
export type DisplayCommand = "hard_reload" | "soft_reload" | "clear_cache";

/**
 * Command payload structure
 */
interface CommandPayload {
  command: DisplayCommand;
  timestamp: string;
  source: "hub_app";
  metadata?: Record<string, unknown>;
}

/**
 * Send a command to a TV display via Supabase Broadcast
 *
 * @param displayId - The ID of the TV display to send the command to
 * @param command - The command to send
 * @param metadata - Optional additional metadata to include
 * @returns Promise<boolean> - True if command was sent successfully
 */
export const sendDisplayCommand = async (
  displayId: string,
  command: DisplayCommand,
  metadata?: Record<string, unknown>
): Promise<boolean> => {
  const channelName = `display-commands-${displayId}`;

  try {
    const channel = supabase.channel(channelName);

    // Wait for subscription to be established
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Channel subscription timeout"));
      }, 5000);

      channel.subscribe((status) => {
        if (status === "SUBSCRIBED") {
          clearTimeout(timeout);
          resolve();
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          clearTimeout(timeout);
          reject(new Error(`Channel subscription failed: ${status}`));
        }
      });
    });

    // Send the command
    const payload: CommandPayload = {
      command,
      timestamp: new Date().toISOString(),
      source: "hub_app",
      ...(metadata && { metadata }),
    };

    const result = await channel.send({
      type: "broadcast",
      event: "command",
      payload,
    });

    // Cleanup channel after sending
    await supabase.removeChannel(channel);

    console.log(
      `[DisplayCommand] Sent ${command} to display ${displayId}:`,
      result
    );

    return result === "ok";
  } catch (error) {
    console.error(
      `[DisplayCommand] Failed to send ${command} to display ${displayId}:`,
      error
    );
    throw error;
  }
};

/**
 * Force a TV display to perform a hard reload (full page refresh)
 *
 * @param displayId - The ID of the TV display
 * @returns Promise<boolean> - True if command was sent successfully
 */
export const forceReloadDisplay = async (
  displayId: string
): Promise<boolean> => {
  return sendDisplayCommand(displayId, "hard_reload");
};

/**
 * Trigger a soft reload on a TV display (refresh data without page reload)
 *
 * @param displayId - The ID of the TV display
 * @returns Promise<boolean> - True if command was sent successfully
 */
export const softReloadDisplay = async (
  displayId: string
): Promise<boolean> => {
  return sendDisplayCommand(displayId, "soft_reload");
};

/**
 * Clear the cache on a TV display
 *
 * @param displayId - The ID of the TV display
 * @returns Promise<boolean> - True if command was sent successfully
 */
export const clearDisplayCache = async (
  displayId: string
): Promise<boolean> => {
  return sendDisplayCommand(displayId, "clear_cache");
};
