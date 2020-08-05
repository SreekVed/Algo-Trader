import React from 'react';
import './App.css';
import Card from 'react-bootstrap/Card'
import Spinner from 'react-bootstrap/Spinner'

const Alpaca = require('@alpacahq/alpaca-trade-api')

class App extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      returns: 0.00,
      trades: 0,
      cumulative: 0.00
    }
  }

  componentDidMount() {
    const alpaca = new Alpaca({
      keyId: '???',
      secretKey: '???',
      paper: true,
      usePolygon: false
    })

    alpaca.getAccountActivities({
      activityTypes: 'FILL',
      date: new Date().toISOString().split('T')[0]
    }
    ).then((trades) => {
      this.setState({ trades: trades.length })
    })

    alpaca.getPortfolioHistory({
      period: '1D',
      timeframe: '1D'
    }
    ).then((history) => {
      this.setState({
        returns: ((history['profit_loss_pct'][0]) * 100).toFixed(2),
        cumulative: (((history['equity'][0] - 100000) / 100000) * 100).toFixed(2),
        loading : false
      })
    })

  }

  render() {
    return (
      <Card>
        <Card.Body>
          <Card.Title className="mb-4" style={{ fontSize: '10vmin' }}>Algo Trader</Card.Title>
          <Card.Subtitle className="mb-3 text-success" style={{ fontSize: '4vmin' }}>A Day Trading Bot</Card.Subtitle>
          <Card.Text>
            <hr style={{ borderTop: 'solid black' }} />
            <Spinner className="mt-3" style={{ display: this.state.loading ? '' : 'none' }} animation="border" variant="primary" />
            <div id='text' style={{ display: this.state.loading ? 'none' : '' }}>
              <ul>
                <li>Trades Today : <span style={{ color: 'blue' }}>{this.state.trades}</span> </li>
                <li>Today's Returns : <span style={{ color: this.state.returns >= 0 ? 'lime' : 'red' }}>{this.state.returns}%</span> </li>
                <li>Cumulative Returns : <span style={{ color: this.state.cumulative >= 0 ? 'lime' : 'red' }}>{this.state.cumulative}%</span> </li>
              </ul>
            </div>
          </Card.Text>
          <Card.Link href="https://sreekved.github.io"><h1 id='text'>🔗Sreekar Vedula</h1></Card.Link>
        </Card.Body>
      </Card>
    )
  }

}

export default App;
