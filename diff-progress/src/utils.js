export const delay = (time) => new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(true)
  }, time)
})