class Utils {
  /**
   * Create a new utils instance to help send responses
   * @param {DialogflowConversation} conv
   */
  constructor(conv) {
    this.conv = conv;
    this.screen = this.conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT');
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
}

module.exports = { Utils };
