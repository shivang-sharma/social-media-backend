const EventEmitter = require('events');

class EventManager {
  constructor() {
    if (!EventManager.instance) {
      EventManager.instance = new EventEmitter();
    }
  }

  /**
   * 
   * @returns {EventEmitter}
   */
  getInstance() {
    return EventManager.instance;
  }
}

module.exports = EventManager;