import { Subscription } from 'rxjs';

/**
 * This class should be extended by classes wishing to inherit subscription disposal logic
 */
export abstract class DestructibleComponent {

    private subscriptions: Subscription[] = [];
    protected registerSubscription(subscription: Subscription): Subscription {
        if (subscription) {
            this.subscriptions.push(subscription);
        }
        return subscription;
    }

    protected destroy() {
        this.subscriptions.forEach(s => s.unsubscribe());
    }

    constructor() { }
}
