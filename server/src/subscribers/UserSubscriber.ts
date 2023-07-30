import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from "typeorm";
import Preferences from "../models/Preferences";
import User from "../models/User";

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
  /**
   * Indicates that this subscriber only listen to User events.
   */
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  listenTo() {
    return User;
  }

  /**
   * Called before User insertion.
   */
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async beforeInsert(event: InsertEvent<User>) {
    if (!event.entity.preferences) {
      const pref = new Preferences();
      await event.manager.save(pref);
      event.entity.preferences = pref;
    }
  }
}
