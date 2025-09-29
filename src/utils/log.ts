import { partialCall } from '#bemedev/features/functions/functions/partialCall';

export const logTimes = (char: string, number: number) => {
  console.log(char.repeat(number));
};

export const logStars = partialCall(logTimes, '*');

export const logEquals = partialCall(logTimes, '=');
