import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import GameMeetDate, {
  fromInputDate,
  getMeetDate,
  toInputDate,
} from '../../src/app/components/ui/GamesSelector/GameMeetDate'

const dateFormatOptions = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
}

describe('GameMeetDate', () => {
  it('displays the meet date in full month, day, year format', () => {
    const meetdate = new Date(2024, 2, 20)

    render(<GameMeetDate meetdate={meetdate} />)

    expect(
      screen.getByText(meetdate.toLocaleDateString('en-US', dateFormatOptions))
    ).toBeInTheDocument()
  })

  it('shows a date picker when onDateChange is provided', () => {
    render(
      <GameMeetDate meetdate={new Date(2024, 2, 20)} onDateChange={jest.fn()} />
    )

    const dateInput = screen.getByLabelText('Change game date')
    expect(dateInput).toBeInTheDocument()
    expect(dateInput).toHaveAttribute('type', 'date')
    expect(dateInput).toHaveValue('2024-03-20')
    expect(dateInput).toHaveClass('print:hidden')

    const hint = screen.getByText(
      'If you want to change the date for printout, use the date picker above.'
    )
    expect(hint).toBeInTheDocument()
    expect(hint).toHaveClass('print:hidden')
  })

  it('does not show a date picker without onDateChange', () => {
    render(<GameMeetDate meetdate={new Date(2024, 2, 20)} />)

    expect(screen.queryByLabelText('Change game date')).not.toBeInTheDocument()
    expect(
      screen.queryByText('Change date for printout')
    ).not.toBeInTheDocument()
  })

  it('calls onDateChange with a local date when a new date is picked', () => {
    const onDateChange = jest.fn()

    render(
      <GameMeetDate
        meetdate={new Date(2024, 2, 20)}
        onDateChange={onDateChange}
      />
    )

    fireEvent.change(screen.getByLabelText('Change game date'), {
      target: { value: '2024-04-01' },
    })

    expect(onDateChange).toHaveBeenCalledTimes(1)
    expect(onDateChange.mock.calls[0][0]).toEqual(new Date(2024, 3, 1))
  })

  it('falls back to today for invalid dates', () => {
    const today = new Date().toLocaleDateString('en-US', dateFormatOptions)

    expect(getMeetDate('not-a-date')).toBe(today)
    expect(getMeetDate(new Date(0))).toBe(today)
  })

  it('converts between native date input values and local dates', () => {
    expect(toInputDate(new Date(2024, 2, 20))).toBe('2024-03-20')
    expect(toInputDate('2024-03-20')).toBe('2024-03-20')
    expect(fromInputDate('2024-04-01')).toEqual(new Date(2024, 3, 1))
  })
})
