class Utils {
  /**
   * Create a new utils instance to help send responses
   * @param {DialogflowConversation} conv
   */
  constructor(conv) {
    this.conv = conv;
    this.screenActive = this.conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT');
    this.screenAvailable = this.conv.available.surfaces.capabilities.has('actions.capability.SCREEN_OUTPUT');
  }

  send(method, ...args) {
    this.conv.data.lastResponse = args[0];
    this.conv[method](...args);
  }

  ask(...args) {
    this.send('ask', ...args);
  }

  close(...args) {
    this.conv.close(...args);
  }

  add(...args) {
    this.send('add', ...args);
  }

  // Retain current contexts for next call, useful for reprompting without losing state
  retainCurrentContexts() {
    for (const inputContext of this.conv.contexts) {
      // Don't reset system contexts with no lifespan
      if (inputContext.lifespan) {
        // Trim the automatic prepend to name
        const name = inputContext.name.substr(inputContext.name.lastIndexOf('/') + 1);
        // Don't reset Actions on Google reserved context
        if (name !== '_actions_on_google') {
          const refreshedLifespan = inputContext.lifespan + 1;
          this.conv.contexts.set(name, refreshedLifespan, inputContext.parameters);
        }
      }
    }
  }
}
exports.Utils = Utils;

/**
 * Return list of strings as a sentence fragment with conjunction.
 * Example: (['apples, 'oranges', 'bananas'], 'or') => 'apples, oranges, and bananas'
 */
function getConjoined(list, conjunction) {
  if (list.length === 1) {
    return list[0];
  } else if (list.length === 2) {
    return `${list[0]} ${conjunction} ${list[1]}`;
  } else {
    return `${list.slice(0, -1).join(', ')}, ${conjunction} ${list[list.length - 1]}`;
  }
}
exports.getConjoined = getConjoined;
