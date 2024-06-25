export const periodHandler = (startDate: Date | undefined, endDate: Date | undefined) => {
    if (typeof startDate === 'undefined') {
        let nowDate = new Date()
        startDate = new Date(nowDate.setMonth(nowDate.getMonth()-1) * 1) // Last month
      }else startDate = new Date(startDate)

      if (typeof endDate === 'undefined') {
        endDate = new Date() // today (now)
      }else endDate = new Date(endDate)

    return {startDate, endDate}
}