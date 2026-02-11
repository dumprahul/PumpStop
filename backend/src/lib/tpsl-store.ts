export type TpSlOrder = {
    id: string;
    walletAddress: string;
    ticker: string;
    type: 'perp';
    side: 'long' | 'short';
    entryPrice: number;
    takeProfitPrice: number | null;
    stopLossPrice: number | null;
    leverage: number;
    amount: string;
    positionId: string;
    createdAt: number;
    status: 'active' | 'triggered_tp' | 'triggered_sl';
};

// In-memory store: walletAddress (lowercase) → orders
const store = new Map<string, TpSlOrder[]>();

let idCounter = 0;

export function addOrder(params: Omit<TpSlOrder, 'id' | 'createdAt' | 'status' | 'type'>): TpSlOrder {
    const wallet = params.walletAddress.toLowerCase();
    const order: TpSlOrder = {
        ...params,
        id: `tpsl_${++idCounter}_${Date.now()}`,
        type: 'perp',
        walletAddress: wallet,
        createdAt: Date.now(),
        status: 'active',
    };

    const existing = store.get(wallet) || [];
    existing.push(order);
    store.set(wallet, existing);

    console.log(`📋 [TP/SL Store] Added order ${order.id} for ${wallet} — ${order.ticker} ${order.side} TP:${order.takeProfitPrice} SL:${order.stopLossPrice}`);
    return order;
}

export function getOrders(walletAddress: string): TpSlOrder[] {
    return store.get(walletAddress.toLowerCase()) || [];
}

export function removeOrder(walletAddress: string, orderId: string): boolean {
    const wallet = walletAddress.toLowerCase();
    const orders = store.get(wallet);
    if (!orders) return false;

    const idx = orders.findIndex(o => o.id === orderId);
    if (idx === -1) return false;

    orders.splice(idx, 1);
    if (orders.length === 0) {
        store.delete(wallet);
    }
    return true;
}

export function updateOrder(
    walletAddress: string,
    orderId: string,
    updates: { takeProfitPrice?: number | null; stopLossPrice?: number | null }
): TpSlOrder | null {
    const wallet = walletAddress.toLowerCase();
    const orders = store.get(wallet);
    if (!orders) return null;

    const order = orders.find(o => o.id === orderId && o.status === 'active');
    if (!order) return null;

    if (updates.takeProfitPrice !== undefined) order.takeProfitPrice = updates.takeProfitPrice;
    if (updates.stopLossPrice !== undefined) order.stopLossPrice = updates.stopLossPrice;

    console.log(`📋 [TP/SL Store] Updated order ${orderId} — TP:${order.takeProfitPrice} SL:${order.stopLossPrice}`);
    return order;
}

export function getAllActiveOrders(): TpSlOrder[] {
    const all: TpSlOrder[] = [];
    for (const orders of store.values()) {
        for (const order of orders) {
            if (order.status === 'active') {
                all.push(order);
            }
        }
    }
    return all;
}

export function getActiveTickersSet(): Set<string> {
    const tickers = new Set<string>();
    for (const orders of store.values()) {
        for (const order of orders) {
            if (order.status === 'active') {
                tickers.add(order.ticker.toUpperCase());
            }
        }
    }
    return tickers;
}

export function markOrderTriggered(orderId: string, triggerType: 'triggered_tp' | 'triggered_sl'): void {
    for (const orders of store.values()) {
        const order = orders.find(o => o.id === orderId);
        if (order) {
            order.status = triggerType;
            return;
        }
    }
}
