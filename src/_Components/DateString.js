export default DateString = (timestamp) => {
    return new Date(timestamp.toDate()).toDateString()
}