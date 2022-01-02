import React from 'react'
import './App.css'
import { flatten, range } from 'lodash'
import { COLS, firstXCols, itemDirections, items, puzzleByType, solve } from './solver'

type puzzleType =
  | 'LEFT'
  | 'CENTER'


let monthNames = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

let weekdayNames = [
  'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat',
]

class Calendar extends React.PureComponent<{
  type: puzzleType,
  month: number,
  day: number,
  weekday: number,
  onChange: (params: { month: number, day: number, weekday: number }) => any
}> {
  render() {
    const { type, month, day, weekday, onChange } = this.props
    return (
      <div className="Calendar">
        {type === 'LEFT' && (
          <>
            {range(0, 6).map(m => (
              <div
                className={`item month ${month === m ? 'selected' : ''}`}
                key={m}
                onClick={() => onChange({ month: m, day, weekday })}
              >
                {monthNames[m]}
              </div>
            ))}
            <div className="item empty" />
            {range(6, 12).map(m => (
              <div
                className={`item month ${month === m ? 'selected' : ''}`}
                key={m}
                onClick={() => onChange({ month: m, day, weekday })}
              >
                {monthNames[m]}
              </div>
            ))}
            <div className="item empty" />
          </>
        )}
        {type === 'CENTER' && (
          <>
            <div className="item empty" />
            {range(0, 5).map(m => (
              <div
                className={`item month ${month === m ? 'selected' : ''}`}
                key={m}
                onClick={() => onChange({ month: m, day, weekday })}
              >
                {monthNames[m]}
              </div>
            ))}
            <div className="item empty" />
            {range(5, 12).map(m => (
              <div
                className={`item month ${month === m ? 'selected' : ''}`}
                key={m}
                onClick={() => onChange({ month: m, day, weekday })}
              >
                {monthNames[m]}
              </div>
            ))}
          </>
        )}

        {range(1, 32).map(d => (
          <div
            className={`item ${day === d ? 'selected' : ''}`}
            key={d}
            onClick={() => onChange({ month, day: d, weekday })}
          >
            {d}
          </div>
        ))}

        {range(0, 4).map(w => (
          <div
            className={`item ${weekday === w ? 'selected' : ''}`}
            key={w}
            onClick={() => onChange({ month, day, weekday: w })}
          >
            {weekdayNames[w]}
          </div>
        ))}

        <div className="item empty" />
        <div className="item empty" />
        <div className="item empty" />
        <div className="item empty" />

        {range(4, 7).map(w => (
          <div
            className={`item ${weekday === w ? 'selected' : ''}`}
            key={w}
            onClick={() => onChange({ month, day, weekday: w })}
          >
            {weekdayNames[w]}
          </div>
        ))}
      </div>
    )
  }
}

class SolutionView extends React.PureComponent<{
  solution: { index: number, j: number } [],
}> {
  colors = [
    '#6B7280',
    '#EF4444',
    '#F59E0B',
    '#10B981',
    '#3B82F6',
    '#6366F1',
    '#8B5CF6',
    '#EC4899',
    '#48EC99',
    '#4899EC',
  ]

  render() {
    const { solution } = this.props

    return (
      <div className="SolutionView">
        {items.map((item, i) => {
          const { index, j } = solution[i]
          const row = Math.floor(index / COLS)
          const col = index % COLS
          const firstXCol = firstXCols[i][j]
          const direction = itemDirections[i][j]

          const hwDiff = item.length - item[0].length
          const needDiff = (direction === 1 || direction === 3 || direction === 4 || direction === 6)
          return (
            <div
              key={i}
              className="SolutionViewItem"
              style={{
                top: row * 50,
                left: (col - firstXCol) * 50,
                width: item[0].length * 50,
                height: item.length * 50,
                transform: [
                  `translate3d(${needDiff ? hwDiff * 25 : 0}px, ${needDiff ? hwDiff * -25 : 0}px, 0px)`,
                  `rotate3d(1, 1, 0, ${Math.floor(direction / 4) * 180}deg)`,
                  `rotate3d(0, 0, 1, -${direction % 4 * 90}deg)`,
                ].join(' '),
              }}
              data-direction={direction}
            >
              {flatten(
                item.map((s, r) => s.split('').map(
                  (_1, c) => (
                    <div
                      key={`${r}_${c}`}
                      className="SolutionViewCell"
                      style={item[r][c] === 'x' ? { backgroundColor: this.colors[i] } : {}}
                    />
                  )),
                ),
              )}
            </div>
          )
        })}
      </div>
    )
  }
}

class TypeSwitch extends React.PureComponent<{
  value: puzzleType,
  onChange: (type: puzzleType) => any,
}> {
  render() {
    const { value, onChange } = this.props
    return (
      <div className="TypeSwitch">
        <div
          className={`TypeSwitchItem ${value === 'LEFT' ? 'selected' : ''}`}
          onClick={() => onChange('LEFT')}
        >
          Original
        </div>
        <div
          className={`TypeSwitchItem ${value === 'CENTER' ? 'selected' : ''}`}
          onClick={() => onChange('CENTER')}
        >
          Revised
        </div>
      </div>
    )
  }
}

type AppState = {
  type: puzzleType,
  month: number, // 0 - 11
  day: number, // 1 - 31
  weekday: number, // 0 - 6
  solutions: { index: number, j: number }[][],
  index: number,
}

export default class App extends React.PureComponent<{}, AppState> {
  solve = (type: puzzleType, month: number, day: number, weekday: number) => {
    const board = puzzleByType[type].map(row => row.split(''))
    if (type === 'LEFT') {
      board[Math.floor(month / 6)][month % 6] = 'x'
    }
    if (type === 'CENTER') {
      if (month < 5) {
        board[0][month + 1] = 'x'
      } else {
        board[1][month - 5] = 'x'
      }
    }
    board[Math.floor((day - 1) / 7) + 2][(day - 1) % 7] = 'x'
    if (weekday < 4) {
      board[6][weekday + 3] = 'x'
    } else {
      board[7][weekday] = 'x'
    }
    return solve(board)
  }

  state: AppState = {
    type: 'LEFT',
    month: new Date().getMonth(), // 0 - 11
    day: new Date().getDate(), // 1 - 31
    weekday: new Date().getDay(), // 0 - 6
    solutions: this.solve('LEFT', new Date().getMonth(), new Date().getDate(), new Date().getDay()),
    index: 0,
  }

  handleChange = ({ month, day, weekday }: { month: number, day: number, weekday: number }) => this.setState(({ type }) => ({
    month, day, weekday, solutions: this.solve(type, month, day, weekday), index: 0,
  }))

  handleTypeChange = (type: puzzleType) => this.setState(({ month, day, weekday }) => ({
    type, solutions: this.solve(type, month, day, weekday), index: 0,
  }))

  render() {
    const { type, month, day, weekday, solutions, index } = this.state
    return (
      <div className="App">
        <h1>
          Calendar Puzzle Solver
        </h1>
        <div>
          <a href="https://poodlepuzzle.com/products/daily-calendar-puzzle?variant=39685475074107">Buy the Puzzle</a>
          <a href="https://github.com/joewhaley/calendar-puzzle-solver" style={{ marginLeft: 16 }}>Github Repo</a>
        </div>
        {/*<TypeSwitch value={type} onChange={this.handleTypeChange} />*/}
        <div className="Container">
          <Calendar type={type} month={month} day={day} weekday={weekday} onChange={this.handleChange} />
          {solutions[index] && <SolutionView solution={solutions[index]} />}
        </div>
        <div style={{ color: '#333' }}>
          {`Current solution: ${weekdayNames[weekday]}, ${monthNames[month]} ${day}`}
        </div>
        {solutions.length > 0
          ? (
            <div style={{ color: '#333' }}>
              Solution #<input
                type="number"
                min="1"
                max={solutions.length}
                value={index + 1}
                onChange={e => this.setState({ index: parseInt(e.target.value, 10) - 1 })}
              /> out of {solutions.length} total.
            </div>
          )
          : (
            <div>No solutions???!!</div>
          )}
      </div>
    )
  }

}
