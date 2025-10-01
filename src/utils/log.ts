import { partialCall } from '#bemedev/features/functions/functions/partialCall';

export const logTimes = (char: string, number: number) => {
  console.log(char.repeat(number));
};

export const logStars = partialCall(logTimes, '*');

/**
 * Log the start of an operation with a title
 */
export function logTitle(title: string): void {
  logStars(30);
  console.log(title);
  logStars(30);
  console.log();
}
