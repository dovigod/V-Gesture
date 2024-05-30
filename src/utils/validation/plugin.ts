import type { AbstractGesturePlugin } from "../../plugins/Plugin";

export function isValidPlugin(plugin: AbstractGesturePlugin) {
  if (plugin.register && !plugin.unregister) {
    return false
  }
  if (!plugin.register && plugin.unregister) {
    return false
  }
  return true
}