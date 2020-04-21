export const wait = (ms = 1000) => (new Promise(resolve => setTimeout(resolve, ms)))

export const asyncPoll = async (fetchFn, shouldKeepPollingCb, options = {interval: 1000, timeout: 1000}) => {
  let totalTime = 0;
  let result = await fetchFn();
  while(shouldKeepPollingCb(result) && totalTime < options.timeout) {
    await wait(options.interval);
    totalTime += options.interval;
    result = await fetchFn();
    console.log('checking result', shouldKeepPollingCb(result), totalTime , options.timeout)
  }
  
  if(shouldKeepPollingCb(result)) throw new Error("Timeout exceeded")

  return result;
}