import WebSocket from 'ws';
import { getAllActiveOrders, getActiveTickersSet, markOrderTriggered, type TpSlOrder } from './tpsl-store';

const BYBIT_WS_URL = 'wss://stream.bybit.com/v5/public/linear';

/** Map our ticker to Bybit linear symbol */
function tickerToBybitSymbol(ticker: string): string {
    return `${ticker.toUpperCase()}USDT`;
}

class PriceMonitor {
    private ws: WebSocket | null = null;
    private subscribedTickers = new Set<string>();
    private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    private isRunning = false;
    private onTrigger?: (order: TpSlOrder, type: 'tp' | 'sl', price: number) => void;

    /** Register a callback that fires when a TP or SL order is triggered */
    registerTriggerCallback(cb: (order: TpSlOrder, type: 'tp' | 'sl', price: number) => void) {
        this.onTrigger = cb;
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.connect();
        console.log('📡 [Price Monitor] Started');
    }

    /** Subscribe to a new ticker if not already watching */
    watchTicker(ticker: string) {
        const upper = ticker.toUpperCase();
        if (this.subscribedTickers.has(upper)) return;

        this.subscribedTickers.add(upper);
        const symbol = tickerToBybitSymbol(upper);
        const topic = `tickers.${symbol}`;

        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ op: 'subscribe', args: [topic] }));
            console.log(`📡 [Price Monitor] Subscribed to ${topic}`);
        }
    }

    private connect() {
        if (this.ws?.readyState === WebSocket.OPEN) return;

        this.ws = new WebSocket(BYBIT_WS_URL);

        this.ws.on('open', () => {
            console.log('📡 [Price Monitor] Connected to Bybit WS');

            // Resubscribe to all watched tickers
            if (this.subscribedTickers.size > 0) {
                const topics = Array.from(this.subscribedTickers).map(
                    t => `tickers.${tickerToBybitSymbol(t)}`
                );
                this.ws!.send(JSON.stringify({ op: 'subscribe', args: topics }));
                console.log(`📡 [Price Monitor] Subscribed to ${topics.length} tickers`);
            }
        });

        this.ws.on('message', (raw: WebSocket.Data) => {
            try {
                const msg = JSON.parse(raw.toString());
                if (msg.topic?.startsWith('tickers.') && msg.data) {
                    const symbol = msg.data.symbol as string;
                    const price = parseFloat(msg.data.lastPrice);
                    if (price > 0) {
                        this.checkOrders(symbol, price);
                    }
                }
            } catch {
                // ignore parse errors
            }
        });

        this.ws.on('close', () => {
            console.log('📡 [Price Monitor] WS disconnected');
            if (this.isRunning) {
                this.reconnectTimeout = setTimeout(() => this.connect(), 3000);
            }
        });

        this.ws.on('error', (err) => {
            console.error('📡 [Price Monitor] WS error:', err.message);
        });
    }

    private checkOrders(bybitSymbol: string, currentPrice: number) {
        // Find ticker from symbol (e.g. BTCUSDT → BTC)
        const ticker = bybitSymbol.replace('USDT', '');

        const orders = getAllActiveOrders().filter(
            o => o.ticker.toUpperCase() === ticker && o.status === 'active'
        );

        for (const order of orders) {
            this.evaluateOrder(order, currentPrice);
        }
    }

    private evaluateOrder(order: TpSlOrder, currentPrice: number) {
        const { side, takeProfitPrice, stopLossPrice } = order;

        // Check Take Profit
        if (takeProfitPrice !== null) {
            const tpHit = side === 'long'
                ? currentPrice >= takeProfitPrice
                : currentPrice <= takeProfitPrice;

            if (tpHit) {
                markOrderTriggered(order.id, 'triggered_tp');
                console.log(
                    `🎯 [TP HIT] ${order.ticker} @ $${currentPrice.toLocaleString()} for wallet ${order.walletAddress} ` +
                    `(target: $${takeProfitPrice.toLocaleString()}, side: ${side}, leverage: ${order.leverage}x, positionId: ${order.positionId})`
                );
                this.onTrigger?.(order, 'tp', currentPrice);
                return;
            }
        }

        // Check Stop Loss
        if (stopLossPrice !== null) {
            const slHit = side === 'long'
                ? currentPrice <= stopLossPrice
                : currentPrice >= stopLossPrice;

            if (slHit) {
                markOrderTriggered(order.id, 'triggered_sl');
                console.log(
                    `🛑 [SL HIT] ${order.ticker} @ $${currentPrice.toLocaleString()} for wallet ${order.walletAddress} ` +
                    `(target: $${stopLossPrice.toLocaleString()}, side: ${side}, leverage: ${order.leverage}x, positionId: ${order.positionId})`
                );
                this.onTrigger?.(order, 'sl', currentPrice);
                return;
            }
        }
    }

    stop() {
        this.isRunning = false;
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        console.log('📡 [Price Monitor] Stopped');
    }
}

export const priceMonitor = new PriceMonitor();
