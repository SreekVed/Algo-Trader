import math
import time

import alpaca_trade_api as tradeapi
import finnhub

start_time = time.time()

finnhub = finnhub.Client(api_key="???")

alpaca = tradeapi.REST('???', '???', base_url='https://paper-api.alpaca.markets')

stocklist = finnhub.indices_const(symbol="^NDX")['constituents']

positions = {}

cash = 0


def load():
    global cash, stocklist, positions

    positions.clear()
    alpaca_positions = alpaca.list_positions()
    cash = float(alpaca.get_account().cash)

    for position in alpaca_positions:
        positions[position.symbol] = position.qty


def buy():
    global cash, stocklist, positions

    buying = {}

    for ticker in stocklist - positions.keys():
        indicators = finnhub.aggregate_indicator(ticker, 'D')
        signal = indicators['technicalAnalysis']['signal']
        trending = indicators['trend']['trending']
        if (signal in ('buy', 'strong buy')) and trending:
            buying[ticker] = indicators['trend']['adx']
        time.sleep(1)

    total_adx = sum(buying.values())

    for stock in buying.keys():
        amount = (buying[stock] / total_adx) * cash
        quantity = math.floor(amount / finnhub.quote(stock)['c'])
        if quantity > 0:
            alpaca.submit_order(symbol=stock, side='buy', type='market', qty=quantity, time_in_force='day')
        time.sleep(1)


def sell():
    global cash, stocklist, positions

    for ticker in positions.keys():
        indicators = finnhub.aggregate_indicator(ticker, 'D')
        signal = indicators['technicalAnalysis']['signal']
        if signal in ('neutral', 'sell', 'strong sell'):
            alpaca.submit_order(symbol=ticker, side='sell', type='market', qty=positions[ticker], time_in_force='day')
        time.sleep(1)


load()

print(cash)
print(positions)

sell()

load()

print(cash)
print(positions)

buy()

load()

print(cash)
print(positions)

print()


print(time.time() - start_time, 's')
